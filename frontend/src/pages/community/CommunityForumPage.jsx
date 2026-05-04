import { Button, ForumFeed, InlineNotice, PostCard } from '../../common/ui/index.js'
import { useCommunityFeed } from '../../hooks/useCommunityFeed.js'

/**
 * CommunityForumPage uses the real API for posts, replies, and votes.
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
    newPost,
    isCreatingPost,
    handleNewPostChange,
    handleCreatePost,
    isLoading,
    error,
    refetch,
  } = useCommunityFeed()

  return (
    <div className="min-h-svh bg-background pb-24">
      <ForumFeed
        title="Forum"
        subtitle="A gentle, Reddit-style space for questions and shared experience. Everything here comes from the real app database."
      >
        <form
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          onSubmit={handleCreatePost}
        >
          <h2 className="text-lg font-semibold text-foreground">Start a conversation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share a question, a win, or something you need support with.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <input
              type="text"
              value={newPost.title}
              onChange={(event) => handleNewPostChange('title', event.target.value)}
              placeholder="Post title"
              disabled={isCreatingPost}
              className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <textarea
              value={newPost.body}
              onChange={(event) => handleNewPostChange('body', event.target.value)}
              placeholder="What would you like to talk about?"
              disabled={isCreatingPost}
              rows={5}
              className="w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={newPost.isAnonymous}
                onChange={(event) =>
                  handleNewPostChange('isAnonymous', event.target.checked)
                }
                disabled={isCreatingPost}
              />
              Post anonymously
            </label>
            <InlineNotice tone="error">{error}</InlineNotice>
            <div className="flex justify-end">
              <Button type="submit" fullWidth={false} disabled={isCreatingPost}>
                {isCreatingPost ? 'Posting...' : 'Create post'}
              </Button>
            </div>
          </div>
        </form>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground shadow-sm">
            Loading community posts...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-danger/30 bg-accent/20 p-6 shadow-sm">
            <p className="text-sm text-accent-foreground">{error}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              fullWidth={false}
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && posts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground shadow-sm">
            No posts yet. Be the first person to start the conversation.
          </div>
        ) : null}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            postId={post.id}
            title={post.title}
            body={post.body}
            author={post.author}
            authorId={post.authorId}
            isAnonymous={post.isAnonymous}
            isVerifiedDoctor={post.isVerifiedDoctor}
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
