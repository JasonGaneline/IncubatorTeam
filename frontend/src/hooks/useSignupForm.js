import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { saveAuthSession, signupWithEmail } from '../utils/authApi.js'
import { useAuth } from '../context/AuthContext.jsx'

const ROLE_OPTIONS = [
  {
    value: 'pregnant_woman',
    label: 'Pregnant woman',
    description: 'I am currently pregnant and want support during pregnancy.',
  },
  {
    value: 'spouse_of_pregnant_woman',
    label: 'Spouse of a pregnant woman',
    description: 'I am supporting a pregnant partner and want guidance.',
  },
  {
    value: 'soon_to_be_pregnant',
    label: 'Soon-to-be pregnant woman',
    description: 'I am preparing for pregnancy and gathering information early.',
  },
  {
    value: 'information_only',
    label: 'Information-only user',
    description: 'I am here to learn and use the app for information.',
  },
]

const initialValues = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  userRole: 'pregnant_woman',
  pregnancyWeek: '',
}

export function useSignupForm() {
  const navigate = useNavigate()
  const { setAuthUser } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requiresPregnancyWeek = values.userRole === 'pregnant_woman'

  const onChange = useCallback((field) => {
    return (event) => {
      const value =
        field === 'userRole'
          ? event.target.value
          : field === 'pregnancyWeek'
            ? event.target.value.replace(/[^\d]/g, '')
            : event.target.value

      setValues((prev) => ({
        ...prev,
        [field]: value,
        ...(field === 'userRole' && value !== 'pregnant_woman'
          ? { pregnancyWeek: '' }
          : {}),
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
    if (!values.userRole) {
      next.userRole = 'Please choose the option that best describes you.'
    }
    if (requiresPregnancyWeek) {
      const weekNumber = Number(values.pregnancyWeek)
      if (!values.pregnancyWeek) {
        next.pregnancyWeek = 'Please add your current pregnancy week.'
      } else if (!Number.isInteger(weekNumber) || weekNumber < 0 || weekNumber > 42) {
        next.pregnancyWeek = 'Pregnancy week must be a whole number from 0 to 42.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }, [
    requiresPregnancyWeek,
    values.confirmPassword,
    values.displayName,
    values.email,
    values.password,
    values.pregnancyWeek,
    values.userRole,
  ])

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
          userRole: values.userRole,
          pregnancyWeek: requiresPregnancyWeek ? Number(values.pregnancyWeek) : null,
        })

        saveAuthSession(result)
        setAuthUser(result?.user)
        setStatusMessage(`Account created for ${values.displayName}. You are now signed in.`)

        // Redirect to home after a short delay to show success message
        setTimeout(() => navigate('/'), 500)
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
    [
      requiresPregnancyWeek,
      validate,
      values.displayName,
      values.email,
      values.password,
      values.pregnancyWeek,
      values.userRole,
      setAuthUser,
      navigate,
    ],
  )

  const roleOptions = useMemo(() => ROLE_OPTIONS, [])

  return {
    values,
    errors,
    statusMessage,
    errorMessage,
    isSubmitting,
    roleOptions,
    requiresPregnancyWeek,
    onChange,
    onSubmit,
  }
}
