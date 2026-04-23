import { useCallback, useEffect, useState } from 'react'

import { MOOD_OPTIONS } from '../constants/moodOptions.js'
import { apiRequest, getStoredAuthUser } from '../utils/apiClient.js'

const VALID_MOOD_IDS = new Set(MOOD_OPTIONS.map((m) => m.id))

function formatDateLabel(iso) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

function buildMoodHistory(entries) {
  const recentEntries = entries.slice(0, 5).map((entry) => {
    const mood = MOOD_OPTIONS.find((option) => option.id === entry.mood_evaluation)

    return {
      moodLabel: mood?.label || entry.mood_evaluation,
      emoji: mood?.emoji || '•',
      dateLabel: formatDateLabel(entry.created_at),
      reflectionSnippet:
        entry.reflection_text || 'No written reflection for this check-in.',
    }
  })

  return {
    summary: {
      checkInsThisWeek: entries.length,
      streakDays: entries.length,
      topMoodLabel: recentEntries[0]?.moodLabel || 'No data yet',
      averageMoodScore: '—',
      averageMoodLabel: 'Add more check-ins to build trends',
    },
    weeklyTrend: [],
    scoreScale: { max: 5 },
    recentEntries,
    chartCaption:
      entries.length > 0
        ? 'Recent check-ins are shown below using your real data.'
        : 'Your mood history will appear here after you submit check-ins.',
  }
}

async function fetchHistoryFromApi() {
  const rows = await apiRequest('/check-ins/me')
  return buildMoodHistory(rows)
}

async function submitCheckInToApi({ mood_evaluation, reflection_text }) {
  return apiRequest('/check-ins', {
    method: 'POST',
    body: JSON.stringify({ mood_evaluation, reflection_text }),
  })
}

export function useMentalHealthCheckIn() {
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [reflection, setReflection] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [history, setHistory] = useState(null)
  const [historyError, setHistoryError] = useState('')
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    setHistoryError('')

    try {
      if (!getStoredAuthUser()) {
        throw new Error('Sign in to see your real check-in history.')
      }

      const nextHistory = await fetchHistoryFromApi()
      setHistory(nextHistory)
    } catch (loadError) {
      setHistory(null)
      setHistoryError(
        loadError instanceof Error
          ? loadError.message
          : 'Your check-in history could not be loaded.',
      )
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const selectMood = useCallback((id) => {
    setSelectedMoodId(id)
    setError('')
    setStatusMessage('')
  }, [])

  const setReflectionText = useCallback((event) => {
    setReflection(event.target.value)
    setStatusMessage('')
    setError('')
  }, [])

  const submit = useCallback(
    async (event) => {
      event.preventDefault()
      setStatusMessage('')

      if (!selectedMoodId || !VALID_MOOD_IDS.has(selectedMoodId)) {
        setError('Choose a mood — there is no wrong answer, just what is true today.')
        return
      }

      setError('')
      setIsSubmitting(true)

      try {
        await submitCheckInToApi({
          mood_evaluation: selectedMoodId,
          reflection_text: reflection.trim() || null,
        })
        setStatusMessage('Your check-in was saved to your account.')
        setReflection('')
        setSelectedMoodId(null)
        await loadHistory()
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : 'Your check-in could not be saved.',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [loadHistory, reflection, selectedMoodId],
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
    history,
    historyError,
    isHistoryLoading,
    refetchHistory: loadHistory,
  }
}
