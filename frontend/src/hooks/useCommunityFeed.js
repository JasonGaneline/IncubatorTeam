import { useCallback, useEffect, useState } from 'react'

import { apiRequest, getStoredAuthUser } from '../utils/apiClient.js'

function formatTimeLabel(iso) {
  if (!iso) return 'just now'

  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))

  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function normalizePost(post) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    author: post.author_display,
    timeLabel: formatTimeLabel(post.last_activity_at),
    createdAt: post.created_at,
    displayScore: (post.upvote_count || 0) - (post.downvote_count || 0),
    userVote: post.my_vote === 1 ? 'up' : post.my_vote === -1 ? 'down' : null,
    replies: (post.replies || []).map((reply) => ({
      author: reply.author_display,
      body: reply.body,
      timeLabel: formatTimeLabel(reply.created_at),
    })),
  }
}

async function fetchFeed() {
  const data = await apiRequest('/community/feed')
  return (data.posts || []).map(normalizePost)
}

async function submitVote(postId, value) {
  await apiRequest(`/community/posts/${postId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  })
}

async function submitReply(postId, body) {
  await apiRequest(`/community/posts/${postId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

async function createPost({ title, body, isAnonymous }) {
  await apiRequest('/community/posts', {
    method: 'POST',
    body: JSON.stringify({
      title,
      body,
      is_anonymous: isAnonymous,
    }),
  })
}

export function useCommunityFeed() {
  const [posts, setPosts] = useState([])
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replySubmitting, setReplySubmitting] = useState({})
  const [newPost, setNewPost] = useState({
    title: '',
    body: '',
    isAnonymous: false,
  })
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      if (!getStoredAuthUser()) {
        throw new Error('Sign in to see and contribute to the real community feed.')
      }

      const nextPosts = await fetchFeed()
      setPosts(nextPosts)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'The community feed could not be loaded.',
      )
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleVote = useCallback(
    async (postId, clickedVote) => {
      const current = posts.find((post) => post.id === postId)
      if (!current) return

      const nextValue = current.userVote === clickedVote ? 'none' : clickedVote

      try {
        setError('')
        await submitVote(postId, nextValue)
        await load()
      } catch (voteError) {
        setError(
          voteError instanceof Error
            ? voteError.message
            : 'Your vote could not be saved.',
        )
      }
    },
    [load, posts],
  )

  const handleUpvote = useCallback(
    (postId) => {
      handleVote(postId, 'up')
    },
    [handleVote],
  )

  const handleDownvote = useCallback(
    (postId) => {
      handleVote(postId, 'down')
    },
    [handleVote],
  )

  const handleReplyChange = useCallback((postId, value) => {
    setReplyDrafts((drafts) => ({ ...drafts, [postId]: value }))
  }, [])

  const handleNewPostChange = useCallback((field, value) => {
    setNewPost((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleReplySubmit = useCallback(
    async (postId) => {
      const text = (replyDrafts[postId] ?? '').trim()
      if (!text) return

      setReplySubmitting((submitting) => ({ ...submitting, [postId]: true }))
      setError('')

      try {
        await submitReply(postId, text)
        setReplyDrafts((drafts) => ({ ...drafts, [postId]: '' }))
        await load()
      } catch (replyError) {
        setError(
          replyError instanceof Error
            ? replyError.message
            : 'Your reply could not be posted.',
        )
      } finally {
        setReplySubmitting((submitting) => ({ ...submitting, [postId]: false }))
      }
    },
    [load, replyDrafts],
  )

  const handleCreatePost = useCallback(
    async (event) => {
      event.preventDefault()

      const title = newPost.title.trim()
      const body = newPost.body.trim()

      if (!title || !body) {
        setError('Add both a title and a message before posting to the community.')
        return
      }

      setIsCreatingPost(true)
      setError('')

      try {
        await createPost({
          title,
          body,
          isAnonymous: newPost.isAnonymous,
        })
        setNewPost({ title: '', body: '', isAnonymous: false })
        await load()
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : 'Your post could not be created.',
        )
      } finally {
        setIsCreatingPost(false)
      }
    },
    [load, newPost],
  )

  return {
    posts,
    handleUpvote,
    handleDownvote,
    handleReplyChange,
    handleReplySubmit,
    replyDrafts,
    replySubmitting,
    newPost,
    isCreatingPost,
    handleNewPostChange,
    handleCreatePost,
    isLoading,
    error,
    refetch: load,
  }
}
