import { useCallback, useState } from 'react'

/**
 * useSignupForm — smart hook for the signup screen.
 * Same idea as login: UI components stay simple; this file will grow with API calls.
 */

const initialValues = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function useSignupForm() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = useCallback((field) => {
    return (event) => {
      const { value } = event.target
      setValues((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
      setStatusMessage('')
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
  }, [
    values.confirmPassword,
    values.displayName,
    values.email,
    values.password,
  ])

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault()
      setStatusMessage('')
      if (!validate()) return

      setIsSubmitting(true)
      window.setTimeout(() => {
        setIsSubmitting(false)
        setStatusMessage(
          `Account ready for "${values.displayName}" — next step: connect the signup API.`,
        )
      }, 650)
    },
    [validate, values.displayName],
  )

  return {
    values,
    errors,
    statusMessage,
    isSubmitting,
    onChange,
    onSubmit,
  }
}
