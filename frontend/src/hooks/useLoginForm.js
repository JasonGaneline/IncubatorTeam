import { useCallback, useState } from 'react'

/**
 * useLoginForm — "smart" hook: owns state and (later) will call the real login API.
 * The Login page stays thin: it reads these values and passes them into dumb inputs.
 *
 * When Backend / Frontend-2 wires FastAPI:
 * - Replace the fake `setTimeout` with `fetch` or your API client.
 * - Persist JWT in memory or secure storage.
 * - Trigger React Router navigation on success.
 */

const initialValues = {
  email: '',
  password: '',
}

export function useLoginForm() {
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
    if (!values.email.trim()) next.email = 'Please add your email so we can find your account.'
    if (!values.password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [values.email, values.password])

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault()
      setStatusMessage('')
      if (!validate()) return

      setIsSubmitting(true)
      // Pretend network latency — swap for real API integration.
      window.setTimeout(() => {
        setIsSubmitting(false)
        setStatusMessage(
          `Welcome back — we would now log in "${values.email}" once the API is connected.`,
        )
      }, 600)
    },
    [validate, values.email],
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
