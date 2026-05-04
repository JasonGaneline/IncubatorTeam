import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { apiRequest } from '../utils/apiClient.js'
import { DirectMessage } from '../common/ui/DirectMessage.jsx'

/**
 * MessagesPage shows either:
 *   - the conversation list (when no :userId is in the URL), or
 *   - a single thread (when navigated to /messages/:userId).
 *
 * The list view fetches GET /messages which returns one row per peer with
 * the most recent message content + unread count. Thread view uses GET
 * /messages/:peerId (messages + thread meta for follow/chat-request rules).
 */

export function MessagesPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId) {
      // The thread view loads its own messages; nothing to fetch here.
      return
    }
    let cancelled = false
    setIsLoading(true)
    apiRequest('/messages')
      .then((data) => {
        if (cancelled) return
        setConversations(Array.isArray(data) ? data : [])
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setConversations([])
        setError(err?.message || 'Could not load conversations.')
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <div className="min-h-svh bg-background pb-24">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {userId ? 'Conversation' : 'Direct Messages'}
        </h1>

        {userId ? (
          <>
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="mb-4 text-sm text-primary hover:underline"
            >
              {'\u2190 Back to inbox'}
            </button>
            <div className="flex w-full min-w-0 flex-col">
              <DirectMessage userId={userId} />
            </div>
          </>
        ) : isLoading ? (
          <div className="text-sm text-muted-foreground">Loading conversations...</div>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No conversations yet. Visit a profile and tap Message to start one.
          </p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conv) => {
              const peer = conv.peer || {}
              return (
                <li key={peer.id}>
                  <Link
                    to={`/messages/${peer.id}`}
                    className="block w-full p-3 rounded-lg border border-border bg-muted hover:bg-muted/80 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <span className="truncate">{peer.display_name || peer.email}</span>
                          {peer.is_verified_doctor && (
                            <span
                              className="text-green-600"
                              title="Verified Professional"
                              aria-label="Verified Professional"
                            >
                              {'\u2713'}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.last_message}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
