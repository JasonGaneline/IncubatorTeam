/**
 * UserSearch — search for users by name/email and display results with follow functionality.
 */

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiRequest } from '../../utils/apiClient.js'
import { Button } from './Button.jsx'
import { TextField } from './TextField.jsx'

/**
 * Single user result row in search results.
 */
function UserResultRow({ user, isFollowing, onFollowToggle, isLoading }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 transition hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <Link
          to={`/profile/${user.id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {user.display_name || user.email}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
        {user.pregnancy_week !== null ? (
          <p className="mt-1 text-xs text-secondary-foreground">
            Week {user.pregnancy_week}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onFollowToggle}
        disabled={isLoading}
        className={`ml-3 shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
          isFollowing
            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        } disabled:opacity-60`}
      >
        {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

export function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [followingMap, setFollowingMap] = useState({})
  const [followingLoading, setFollowingLoading] = useState({})

  // Debounced search: wait 300ms after user stops typing
  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setResults([])
      setError('')
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      setError('')

      try {
        const data = await apiRequest(
          `/users/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`,
        )
        setResults(Array.isArray(data) ? data : [])
      } catch (searchError) {
        setError(
          searchError instanceof Error
            ? searchError.message
            : 'Search failed. Please try again.',
        )
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleFollowToggle = useCallback(
    async (userId) => {
      setFollowingLoading((prev) => ({ ...prev, [userId]: true }))

      try {
        const isCurrentlyFollowing = followingMap[userId]

        if (isCurrentlyFollowing) {
          await apiRequest(`/users/${userId}/follow`, { method: 'DELETE' })
        } else {
          await apiRequest(`/users/${userId}/follow`, { method: 'POST' })
        }

        setFollowingMap((prev) => ({
          ...prev,
          [userId]: !isCurrentlyFollowing,
        }))
      } catch (err) {
        console.error('Follow toggle failed:', err)
      } finally {
        setFollowingLoading((prev) => ({ ...prev, [userId]: false }))
      }
    },
    [followingMap],
  )

  return (
    <div className="w-full space-y-4">
      <div>
        <TextField
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
        {isSearching ? (
          <p className="mt-2 text-xs text-muted-foreground">Searching...</p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-accent/20 p-3">
          <p className="text-xs text-accent-foreground">{error}</p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Results ({results.length})
          </p>
          <div className="space-y-2">
            {results.map((user) => (
              <UserResultRow
                key={user.id}
                user={user}
                isFollowing={Boolean(followingMap[user.id])}
                onFollowToggle={() => handleFollowToggle(user.id)}
                isLoading={Boolean(followingLoading[user.id])}
              />
            ))}
          </div>
        </div>
      ) : query.trim() && !isSearching ? (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">No users found for "{query}"</p>
        </div>
      ) : null}
    </div>
  )
}
