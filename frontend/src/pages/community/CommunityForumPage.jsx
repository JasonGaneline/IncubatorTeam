import { ForumFeed, PostCard } from '../../common/ui/index.js'
import { useCommunityFeed } from '../../hooks/useCommunityFeed.js'
import { MainNav } from '../../layouts/MainNav.jsx'

/**
 * CommunityForumPage — smart container: hook supplies handlers + state, PostCard stays visual-only.
 */

export function CommunityForumPage() {
  const {
    posts,
    handleUpvote,
    handleDownvote,
    handleReplyChange,
    handleReplySubmit,
    replyDrafts,
    replySubmitting,
  } = useCommunityFeed()

  return (
    <div className="min-h-svh bg-background">
      <MainNav />
      <ForumFeed
        title="Forum"
        subtitle="A gentle, Reddit-style space for questions and shared experience. Data below is mock JSON until the API is live."
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            postId={post.id}
            title={post.title}
            body={post.body}
            author={post.author}
            timeLabel={post.timeLabel}
            createdAt={post.createdAt}
            voteScore={post.displayScore}
            userVote={post.userVote}
            onUpvote={() => handleUpvote(post.id)}
            onDownvote={() => handleDownvote(post.id)}
            replies={post.replies}
            replyText={replyDrafts[post.id] ?? ''}
            onReplyChange={(e) => handleReplyChange(post.id, e.target.value)}
            onReplySubmit={() => handleReplySubmit(post.id)}
            isSubmittingReply={Boolean(replySubmitting[post.id])}
          />
        ))}
      </ForumFeed>
    </div>
  )
}
