import { useEffect, useState } from 'react'

import { isSupabaseConfigured, supabase } from '../utils/supabase.js'
import { MainNav } from '../layouts/MainNav.jsx'

/**
 * Mirrors the Supabase quickstart: lists rows from `todos`.
 * Create table in Supabase: id uuid default gen_random_uuid(), name text (or match your schema).
 */

export function SupabaseTodosDemoPage() {
  const configured = isSupabaseConfigured()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(configured)
  const [error, setError] = useState(
    configured
      ? null
      : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY in .env',
  )

  useEffect(() => {
    if (!configured) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: qErr } = await supabase.from('todos').select()

      if (cancelled) return

      if (qErr) {
        setError(qErr.message)
        setTodos([])
      } else if (data) {
        setTodos(data)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [configured])

  return (
    <div className="min-h-svh bg-background">
      <MainNav />
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-foreground">Supabase demo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reads from the <code className="rounded bg-muted px-1">todos</code> table. Add the
          table in Supabase if you see an error.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : (
          <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-foreground">
            {todos.length === 0 ? (
              <li className="list-none text-muted-foreground">No rows yet.</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id}>{todo.name ?? JSON.stringify(todo)}</li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
