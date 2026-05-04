import { apiRequest } from './apiClient.js'

export async function signupWithEmail({
  email,
  password,
  displayName,
  userRole,
  pregnancyWeek = null,
}) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      display_name: displayName || null,
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

export async function followUser(userId) {
  return apiRequest(`/users/${userId}/follow`, {
    method: 'POST',
  })
}

export async function unfollowUser(userId) {
  return apiRequest(`/users/${userId}/follow`, {
    method: 'DELETE',
  })
}

export async function getPublicUserProfile(userId) {
  return apiRequest(`/profile/${userId}`)
}

export async function signupDoctor({
  email,
  password,
  first_name,
  last_name,
  npi_number,
  display_name,
}) {
  return apiRequest('/auth/signup/doctor', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      first_name,
      last_name,
      npi_number,
      display_name,
    }),
  })
}

/**
 * Verify the currently-authenticated user (e.g. via Google) as a professional
 * by posting their NPI to the backend, which validates against the public
 * NPPES NPI Registry and flips the user's role to `verified_professional`.
 */
export async function verifyDoctor({ first_name, last_name, npi_number }) {
  return apiRequest('/auth/verify-doctor', {
    method: 'POST',
    body: JSON.stringify({ first_name, last_name, npi_number }),
  })
}

/** Update the current user's profile via the spec-named PUT /users/me. */
export async function updateMe(payload) {
  return apiRequest('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
