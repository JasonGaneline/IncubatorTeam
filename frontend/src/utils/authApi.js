import { apiRequest } from './apiClient.js'

export async function signupWithEmail({
  email,
  password,
  userRole,
  pregnancyWeek = null,
}) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      user_role: userRole,
      pregnancy_week: pregnancyWeek,
    }),
  })
}

export async function loginWithEmail({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export async function refreshAccessToken(refreshToken) {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  })
}

export async function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  })
}

export function saveAuthSession(result) {
  if (result?.access_token) {
    window.localStorage.setItem('access_token', result.access_token)
  }

  if (result?.refresh_token) {
    window.localStorage.setItem('refresh_token', result.refresh_token)
  }

  if (result?.user) {
    window.localStorage.setItem('auth_user', JSON.stringify(result.user))
  }
}

export function getRefreshToken() {
  return window.localStorage.getItem('refresh_token') || ''
}

export function clearAuthSession() {
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('refresh_token')
  window.localStorage.removeItem('auth_user')
}
