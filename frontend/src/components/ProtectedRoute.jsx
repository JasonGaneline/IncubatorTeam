import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

/**
 * ProtectedRoute wraps routes that require authentication.
 * If the user is not authenticated, redirects to the login page.
 */

export function ProtectedRoute({ element: Element }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center pb-24">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return Element
}
