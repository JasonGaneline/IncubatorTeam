import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { apiRequest } from '../../utils/apiClient.js'
import { TextField } from './TextField.jsx'

/**
 * Loads followers or following for a user and supports a simple client-side search.
 *
 * @param {'followers'|'following'} listType
 */
export function FollowersList({ userId, listType = 'followers' }) {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const path =
    listType === 'following'
      ? `/profile/following/${userId}`
      : `/profile/followers/${userId}`

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    apiRequest(path)
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setUsers([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId, path])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const name = (u.display_name || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [users, query])

  const title = listType === 'following' ? 'Following' : 'Followers'

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-muted-foreground">Loading {title.toLowerCase()}...</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="sm:w-56">
          <TextField
            id={`${listType}-search-${userId}`}
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {users.length === 0 ? `No ${title.toLowerCase()} yet.` : 'No matches for your search.'}
        </p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {filtered.map((u) => (
            <li key={u.id}>
              <Link
                to={`/profile/${u.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-primary hover:bg-muted"
              >
                <span className="truncate">{u.display_name || u.email}</span>
                {u.is_verified_doctor ? (
                  <span className="shrink-0 text-green-600" title="Verified Professional">
                    {'\u2713'}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
