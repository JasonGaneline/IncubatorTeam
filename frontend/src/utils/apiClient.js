const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
}

export function getAccessToken() {
  return window.localStorage.getItem('access_token') || ''
}

export function getRefreshToken() {
  return window.localStorage.getItem('refresh_token') || ''
}

export function getStoredAuthUser() {
  const raw = window.localStorage.getItem('auth_user')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('refresh_token')
  window.localStorage.removeItem('auth_user')
}

/**
 * Decode JWT payload without verification (client-side only).
 * DO NOT rely on this for security — always verify on the backend.
 */
function decodeJwt(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

/**
 * Check if token is expired or about to expire (within 1 minute).
 */
function isTokenExpiredOrExpiring(token) {
  const payload = decodeJwt(token)
  if (!payload || !payload.exp) return true

  const now = Math.floor(Date.now() / 1000)
  const expiresIn = payload.exp - now
  return expiresIn < 60 // refresh if less than 1 minute left
}

let isRefreshing = false
let refreshPromise = null

/**
 * Refresh the access token using the refresh token.
 */
async function tryRefreshAccessToken() {
  // Prevent multiple simultaneous refresh requests
  if (isRefreshing) {
    return refreshPromise
  }

  isRefreshing = true

  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearAuthSession()
      return null
    }

    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      clearAuthSession()
      return null
    }

    const data = await response.json()

    // Save new tokens
    if (data?.access_token) {
      window.localStorage.setItem('access_token', data.access_token)
    }
    if (data?.refresh_token) {
      window.localStorage.setItem('refresh_token', data.refresh_token)
    }

    return data?.access_token
  } catch {
    clearAuthSession()
    return null
  } finally {
    isRefreshing = false
    refreshPromise = null
  }
}

export async function apiRequest(path, options = {}) {
  let token = getAccessToken()

  // Check if token is expiring and try to refresh before making the request
  if (token && isTokenExpiredOrExpiring(token)) {
    const newToken = await tryRefreshAccessToken()
    if (newToken) {
      token = newToken
    } else {
      // Refresh failed, clear session and stop
      throw new Error('Your session has expired. Please log in again.')
    }
  }

  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  })

  // If we get a 401, try refreshing and retry once
  if (response.status === 401) {
    const newToken = await tryRefreshAccessToken()
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`)
      response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...options,
        headers,
      })
    } else {
      clearAuthSession()
    }
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.detail || 'The request could not be completed.')
  }

  return data
}
