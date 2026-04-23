import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { loginWithEmail, saveAuthSession } from '../utils/authApi.js'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * useLoginForm owns the login form state plus the POST request to FastAPI.
 * This keeps API details out of the page component so the page can stay focused on layout.
 */

const initialValues = {
  email: '',
  password: '',
}

export function useLoginForm() {
  const navigate = useNavigate()
  const { setAuthUser } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = useCallback((field) => {
    return (event) => {
      const { value } = event.target
      setValues((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
      setStatusMessage('')
      setErrorMessage('')
    }
  }, [])

  const validate = useCallback(() => {
    const next = {}
    if (!values.email.trim()) next.email = 'Please add your email so we can find your account.'
    if (!values.password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [values.email, values.password])

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setStatusMessage('')
      setErrorMessage('')
      if (!validate()) return

      setIsSubmitting(true)

      try {
        const result = await loginWithEmail({
          email: values.email.trim(),
          password: values.password,
        })

        saveAuthSession(result)
        setAuthUser(result?.user)
        setStatusMessage(
          `Welcome back, ${result?.user?.email || values.email.trim()}. You are now signed in.`,
        )

        // Redirect to home after a short delay to show success message
        setTimeout(() => navigate('/'), 500)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'We could not sign you in. Please try again.',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [validate, values.email, values.password, setAuthUser, navigate],
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
