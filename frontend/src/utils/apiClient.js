const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
}

export function getAccessToken() {
  return window.localStorage.getItem('access_token') || ''
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
  window.localStorage.removeItem('auth_user')
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession()
    }

    throw new Error(data?.detail || 'The request could not be completed.')
  }

  return data
}
