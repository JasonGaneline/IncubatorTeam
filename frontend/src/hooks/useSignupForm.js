import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { saveAuthSession, signupWithEmail } from '../utils/authApi.js'
import { postLoginPath } from '../utils/profileStatus.js'
import { useAuth } from '../context/AuthContext.jsx'

const initialValues = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

/**
 * Email/password signup without choosing account type here — that happens in
 * /onboarding (same five-option flow as Google users).
 */
export function useSignupForm() {
  const navigate = useNavigate()
  const { setAuthUser } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = useCallback((field) => {
    return (event) => {
      const value = event.target.value
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
      setStatusMessage('')
      setErrorMessage('')
    }
  }, [])

  const validate = useCallback(() => {
    const next = {}
    if (!values.displayName.trim()) {
      next.displayName = 'A display name helps the community feel welcoming.'
    }
    if (!values.email.trim()) next.email = 'We need your email for account recovery and updates.'
    if (values.password.length < 8) {
      next.password = 'Use at least 8 characters to keep your account safer.'
    }
    if (values.password !== values.confirmPassword) {
      next.confirmPassword = 'Both password fields need to match.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }, [values.confirmPassword, values.displayName, values.email, values.password])

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setStatusMessage('')
      setErrorMessage('')
      if (!validate()) return

      setIsSubmitting(true)

      try {
        const result = await signupWithEmail({
          email: values.email.trim(),
          password: values.password,
          displayName: values.displayName.trim(),
          userRole: 'information_only',
          pregnancyWeek: null,
        })

        saveAuthSession(result)
        setAuthUser(result?.user)
        setStatusMessage(`Account created for ${values.displayName.trim()}. You are now signed in.`)

        const destination = postLoginPath(result?.user)
        setTimeout(() => navigate(destination, { replace: true }), 500)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not create your account. Please try again.',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [validate, values.displayName, values.email, values.password, setAuthUser, navigate],
  )

  return {
    values,
    errors,
    statusMessage,
    errorMessage,
    isSubmitting,
    onChange,
    onSubmit,
  }
}
