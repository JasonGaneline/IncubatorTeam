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

export function saveAuthSession(result) {
  if (result?.access_token) {
    window.localStorage.setItem('access_token', result.access_token)
  }

  if (result?.user) {
    window.localStorage.setItem('auth_user', JSON.stringify(result.user))
  }
}
