import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { saveAuthSession } from '../utils/authApi.js'
import { postLoginPath } from '../utils/profileStatus.js'
import { useAuth } from '../context/AuthContext.jsx'

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
}

async function postGoogleCredential(credential) {
  const response = await fetch(`${getApiBaseUrl()}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.detail || 'Google sign-in could not be completed. Please try again.',
    )
  }

  return data
}

/**
 * useGoogleAuth keeps Google OAuth side effects out of the page components.
 *
 * OAuth flow for beginners:
 * 1. Google opens a popup and the user chooses an account.
 * 2. Google returns a short-lived credential token to the browser.
 * 3. We POST that credential to FastAPI, because the backend should verify it.
 * 4. FastAPI can then create/find the user and return our app's own JWT/session payload.
 */
export function useGoogleAuth() {
  const navigate = useNavigate()
  const { setAuthUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const resetFeedback = useCallback(() => {
    setError('')
    setStatusMessage('')
  }, [])

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    const credential = credentialResponse?.credential

    if (!credential) {
      setError('Google did not return a credential token. Please try the popup again.')
      setStatusMessage('')
      return null
    }

    setIsSubmitting(true)
    setError('')
    setStatusMessage('')

    try {
      const result = await postGoogleCredential(credential)

      saveAuthSession(result)
      setAuthUser(result?.user)

      const signedInEmail = result?.user?.email
      setStatusMessage(
        signedInEmail
          ? `Signed in with Google as ${signedInEmail}.`
          : 'Signed in with Google successfully.',
      )

      // Returning users with a complete profile go straight to /check-in.
      // New users (default `information_only` role) land on /onboarding to
      // pick an account type (and, if pregnant, a gestational week).
      const destination = postLoginPath(result?.user)
      setTimeout(() => navigate(destination, { replace: true }), 500)

      return result
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong during Google sign-in.'

      setError(message)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [setAuthUser, navigate])

  const handleGoogleError = useCallback(() => {
    setError('The Google sign-in popup was closed or could not finish.')
    setStatusMessage('')
  }, [])

  return {
    isSubmitting,
    error,
    statusMessage,
    resetFeedback,
    handleGoogleSuccess,
    handleGoogleError,
  }
}
