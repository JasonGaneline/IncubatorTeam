/**
 * PostCard — Reddit-style post shell: votes on the left, content + replies below.
 * All interactions flow through props — the parent container owns state and mock handlers.
 */

import { Button } from './Button.jsx'

export function PostCard({
  /** Stable id for form fields and keys — avoids duplicate author names colliding. */
  postId,
  title,
  body,
  author,
  timeLabel,
  createdAt,
  voteScore,
  userVote,
  onUpvote,
  onDownvote,
  replies = [],
  replyText,
  onReplyChange,
  onReplySubmit,
  replyPlaceholder = 'Write a supportive reply…',
  isSubmittingReply = false,
}) {
  return (
    <article className="flex gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:gap-4 sm:p-5">
      {/* Vote rail — compact controls, clear focus rings for keyboard users */}
      <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-muted/60 px-1 py-2">
        <button
          type="button"
          onClick={onUpvote}
          aria-label="Upvote"
          aria-pressed={userVote === 'up'}
          className={`rounded-lg px-2 py-1 text-lg leading-none transition hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            userVote === 'up' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          ▲
        </button>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {voteScore}
        </span>
        <button
          type="button"
          onClick={onDownvote}
          aria-label="Downvote"
          aria-pressed={userVote === 'down'}
          className={`rounded-lg px-2 py-1 text-lg leading-none transition hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            userVote === 'down' ? 'text-danger' : 'text-muted-foreground'
          }`}
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h2>
        </header>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium text-secondary-foreground">{author}</span>
          <span aria-hidden> · </span>
          {createdAt ? (
            <time dateTime={createdAt}>{timeLabel}</time>
          ) : (
            <span>{timeLabel}</span>
          )}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-surface-foreground">
          {body}
        </p>

        {/* Existing thread — static list rendered from props */}
        {replies.length > 0 ? (
          <div className="mt-5 border-t border-border pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Replies ({replies.length})
            </h3>
            <ul className="mt-3 flex flex-col gap-3">
              {replies.map((reply, idx) => (
                <li
                  key={`${reply.author}-${idx}`}
                  className="rounded-xl border border-border bg-muted/30 px-3 py-2"
                >
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {reply.author}
                    </span>
                    <span aria-hidden> · </span>
                    {reply.timeLabel}
                  </p>
                  <p className="mt-1 text-sm text-surface-foreground">{reply.body}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Reply composer — controlled from the smart parent per post id */}
        <div className="mt-5 border-t border-border pt-4">
          <label
            htmlFor={`reply-${postId}`}
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Your reply
          </label>
          <textarea
            id={`reply-${postId}`}
            value={replyText}
            onChange={onReplyChange}
            placeholder={replyPlaceholder}
            disabled={isSubmittingReply}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              disabled={isSubmittingReply || !replyText.trim()}
              onClick={onReplySubmit}
            >
              {isSubmittingReply ? 'Posting…' : 'Reply'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
