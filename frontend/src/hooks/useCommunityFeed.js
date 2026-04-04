import { useCallback, useState } from 'react'

import MOCK_POSTS from '../data/mockForumPosts.json'

/**
 * useCommunityFeed — local forum state: votes and draft replies on top of static JSON.
 * PostCard stays dumb; this hook is the only place that mutates scores or reply lists.
 */

function seedPosts() {
  return MOCK_POSTS.map((p) => ({
    ...p,
    userVote: null,
    displayScore: p.score,
  }))
}

function adjustVote(prevVote, nextClick) {
  // nextClick is 'up' or 'down' — returns { userVote, delta }
  if (nextClick === 'up') {
    if (prevVote === 'up') return { userVote: null, delta: -1 }
    if (prevVote === 'down') return { userVote: 'up', delta: 2 }
    return { userVote: 'up', delta: 1 }
  }
  if (prevVote === 'down') return { userVote: null, delta: 1 }
  if (prevVote === 'up') return { userVote: 'down', delta: -2 }
  return { userVote: 'down', delta: -1 }
}

export function useCommunityFeed() {
  const [posts, setPosts] = useState(seedPosts)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replySubmitting, setReplySubmitting] = useState({})

  const handleUpvote = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const { userVote, delta } = adjustVote(p.userVote, 'up')
        return {
          ...p,
          userVote,
          displayScore: p.displayScore + delta,
        }
      }),
    )
  }, [])

  const handleDownvote = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const { userVote, delta } = adjustVote(p.userVote, 'down')
        return {
          ...p,
          userVote,
          displayScore: p.displayScore + delta,
        }
      }),
    )
  }, [])

  const handleReplyChange = useCallback((postId, value) => {
    setReplyDrafts((d) => ({ ...d, [postId]: value }))
  }, [])

  const handleReplySubmit = useCallback((postId) => {
    const text = (replyDrafts[postId] ?? '').trim()
    if (!text) return

    setReplySubmitting((s) => ({ ...s, [postId]: true }))
    window.setTimeout(() => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p
          return {
            ...p,
            replies: [
              ...p.replies,
              {
                author: 'you (preview)',
                body: text,
                timeLabel: 'just now',
              },
            ],
          }
        }),
      )
      setReplyDrafts((d) => ({ ...d, [postId]: '' }))
      setReplySubmitting((s) => ({ ...s, [postId]: false }))
    }, 450)
  }, [replyDrafts])

  return {
    posts,
    handleUpvote,
    handleDownvote,
    handleReplyChange,
    handleReplySubmit,
    replyDrafts,
    replySubmitting,
  }
}
