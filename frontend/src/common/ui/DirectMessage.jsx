import { useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '../../context/AuthContext.jsx'
import { apiRequest } from '../../utils/apiClient.js'
import { Button } from './Button.jsx'

/**
 * DirectMessage renders a single conversation with another user.
 * Loads GET /messages/:userId (ConversationDetail: messages + thread follow/request meta).
 */
export function DirectMessage({ userId }) {
  const { authUser } = useAuth()
  const myId = authUser?.id != null ? String(authUser.id) : null

  const [messages, setMessages] = useState([])
  const [thread, setThread] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isThreadLoading, setIsThreadLoading] = useState(true)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  const refetchThread = useCallback(async () => {
    const data = await apiRequest(`/messages/${userId}`)
    setMessages(Array.isArray(data?.messages) ? data.messages : [])
    setThread(data?.thread ?? null)
    setError('')
  }, [userId])

  useEffect(() => {
    let cancelled = false
    setIsThreadLoading(true)
    apiRequest(`/messages/${userId}`)
      .then((data) => {
        if (cancelled) return
        setMessages(Array.isArray(data?.messages) ? data.messages : [])
        setThread(data?.thread ?? null)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setMessages([])
        setThread(null)
        setError(err?.message || 'Could not load messages.')
      })
      .finally(() => {
        if (!cancelled) setIsThreadLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (event) => {
    event?.preventDefault?.()
    const content = newMessage.trim()
    if (!content) return
    if (thread && !thread.can_send) return

    setIsLoading(true)
    setError('')
    try {
      await apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: userId, content }),
      })
      setNewMessage('')
      await refetchThread()
    } catch (err) {
      setError(err?.message || 'Failed to send message.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async () => {
    setError('')
    try {
      await apiRequest(`/messages/${userId}/chat-request/accept`, { method: 'POST' })
      await refetchThread()
    } catch (err) {
      setError(err?.message || 'Could not accept chat request.')
    }
  }

  const handleDecline = async () => {
    setError('')
    try {
      await apiRequest(`/messages/${userId}/chat-request/decline`, { method: 'POST' })
      await refetchThread()
    } catch (err) {
      setError(err?.message || 'Could not decline chat request.')
    }
  }

  const composerDisabled =
    isThreadLoading || (thread && !thread.can_send) || isLoading || !newMessage.trim()

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
      {thread?.incoming_request_pending && (
        <div
          className="flex w-full flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="text-sm text-foreground">This user wants to start a chat with you.</p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="primary" fullWidth={false} onClick={handleAccept}>
              Accept
            </Button>
            <Button type="button" variant="outline" fullWidth={false} onClick={handleDecline}>
              Decline
            </Button>
          </div>
        </div>
      )}

      {thread?.outgoing_request_pending && !thread.incoming_request_pending && (
        <p className="text-sm text-muted-foreground" role="status">
          Waiting for them to accept your chat request.
        </p>
      )}

      {thread?.outgoing_request_declined && !thread.mutual_follow && (
        <p className="text-sm text-danger" role="status">
          Your chat request was declined. You can message again once you both follow each other.
        </p>
      )}

      <div
        ref={scrollRef}
        className="flex min-h-[12rem] max-h-[min(24rem,50svh)] w-full min-w-0 flex-1 flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3"
      >
        {isThreadLoading ? (
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Say hi.</p>
        ) : (
          messages.map((msg) => {
            const isMine = myId != null && String(msg.sender_id) === myId
            return (
              <div
                key={msg.id}
                className={`flex w-full min-w-0 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[min(85%,20rem)] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isMine
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md border border-border bg-surface text-foreground'
                  }`}
                >
                  <p
                    className={`text-xs ${isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                  >
                    {new Date(msg.created_at).toLocaleString()}
                    {msg.chat_request_status === 'pending' && (
                      <span
                        className={`ml-2 font-medium ${
                          isMine ? 'text-amber-100' : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        (chat request)
                      </span>
                    )}
                  </p>
                  <p
                    className={`mt-1 whitespace-pre-wrap ${isMine ? 'text-primary-foreground' : 'text-foreground'}`}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="w-full shrink-0 border-t border-border pt-3">
        <form
          onSubmit={handleSend}
          className="mx-auto flex w-full max-w-2xl flex-row items-end justify-center gap-3"
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              thread && !thread.can_send
                ? thread.send_disabled_reason || 'Messaging is not available.'
                : 'Type a message...'
            }
            disabled={isThreadLoading || (thread && !thread.can_send)}
            className="min-h-[2.75rem] min-w-0 flex-1 resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
            rows={2}
          />
          <Button
            type="submit"
            disabled={composerDisabled}
            fullWidth={false}
            className="h-10 shrink-0 self-end px-5 py-2 text-sm"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  )
}
