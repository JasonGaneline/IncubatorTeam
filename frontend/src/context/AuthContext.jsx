import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { logout } from '../utils/authApi.js'
import { getAccessToken, getRefreshToken, getStoredAuthUser, clearAuthSession } from '../utils/apiClient.js'

/**
 * AuthContext provides global authentication state to the app.
 *
 * Usage in components: const { authUser, isAuthenticated, isLoading, logout } = useAuth()
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const user = getStoredAuthUser()
    const token = getAccessToken()
    const refreshToken = getRefreshToken()

    // Only set user if we have tokens
    if (user && token && refreshToken) {
      setAuthUser(user)
    } else {
      clearAuthSession()
      setAuthUser(null)
    }

    setIsLoading(false)
  }, [])

  const isAuthenticated = useMemo(() => {
    return Boolean(authUser && getAccessToken())
  }, [authUser])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Logout may fail if token expired; that's okay
    } finally {
      clearAuthSession()
      setAuthUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      authUser,
      isAuthenticated,
      isLoading,
      setAuthUser,
      logout: handleLogout,
    }),
    [authUser, isAuthenticated, isLoading, handleLogout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context. Use this in any component that needs auth state.
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
