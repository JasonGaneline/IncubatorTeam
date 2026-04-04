import { useCallback, useState } from 'react'

import { MOOD_OPTIONS } from '../constants/moodOptions.js'

const VALID_MOOD_IDS = new Set(MOOD_OPTIONS.map((m) => m.id))

/**
 * useMentalHealthCheckIn — owns mood + reflection state and submit timing.
 * UI components stay thin; swap the setTimeout block for a POST /check-ins call later.
 */

export function useMentalHealthCheckIn() {
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [reflection, setReflection] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectMood = useCallback((id) => {
    setSelectedMoodId(id)
    setError('')
    setStatusMessage('')
  }, [])

  const setReflectionText = useCallback((event) => {
    setReflection(event.target.value)
    setStatusMessage('')
  }, [])

  const submit = useCallback(
    (event) => {
      event.preventDefault()
      setStatusMessage('')

      if (!selectedMoodId || !VALID_MOOD_IDS.has(selectedMoodId)) {
        setError('Choose a mood — there is no wrong answer, just what is true today.')
        return
      }

      setError('')
      setIsSubmitting(true)
      window.setTimeout(() => {
        setIsSubmitting(false)
        setStatusMessage(
          'Thank you for checking in. This preview saves locally; the backend will store history soon.',
        )
      }, 550)
    },
    [selectedMoodId],
  )

  return {
    moodOptions: MOOD_OPTIONS,
    selectedMoodId,
    selectMood,
    reflection,
    setReflectionText,
    submit,
    isSubmitting,
    statusMessage,
    error,
  }
}
