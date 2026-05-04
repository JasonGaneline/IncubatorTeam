import { useCallback, useEffect, useState } from 'react'

import { MOOD_OPTIONS } from '../constants/moodOptions.js'
import { apiRequest, getStoredAuthUser } from '../utils/apiClient.js'

const VALID_MOOD_IDS = new Set(MOOD_OPTIONS.map((m) => m.id))
const MOOD_SCORE_MAP = {
  overwhelmed: 1,
  low: 2,
  okay: 3,
  calm: 4,
  grateful: 5,
  joyful: 6,
}
const SIGNED_MOOD_WEIGHTS = {
  overwhelmed: -3,
  low: -2,
  okay: -1,
  calm: 1,
  grateful: 2,
  joyful: 3,
}
const EMOTION_COLORS = {
  overwhelmed: '#3b82f6',
  low: '#c2410c',
  okay: '#fb923c',
  calm: '#22c55e',
  grateful: '#f9a8d4',
  joyful: '#8b5cf6',
}
const DEFAULT_SELECTION_COUNT = 1

function formatDateLabel(iso) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

/** X-axis: day the check-in was submitted (e.g. May 4). */
function formatChartDayLabel(iso) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

function formatChartTimeLabel(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function buildMoodHistory(entries) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const moodCounts = new Map()
  const daySet = new Set()
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)

  let checkInsThisWeek = 0
  const scores = []

  sortedEntries.forEach((entry) => {
    const mix = Array.isArray(entry.mood_mix) && entry.mood_mix.length > 0
      ? entry.mood_mix
      : [{ mood: entry.mood_evaluation, intensity: 1 }]
    mix.forEach((portion) => {
      const moodId = portion.mood
      const weight =
        portion.intensity != null
          ? Number(portion.intensity || 0)
          : Number(portion.percentage || 0) / 100
      moodCounts.set(moodId, (moodCounts.get(moodId) || 0) + weight)
    })

    const created = new Date(entry.created_at)
    if (created >= weekStart) checkInsThisWeek += 1

    const dayKey = created.toISOString().slice(0, 10)
    daySet.add(dayKey)

    if (typeof entry.mood_score === 'number') {
      scores.push(entry.mood_score)
    } else {
      const fallback = mix.reduce((sum, portion) => {
        const moodId = portion.mood
        const weight =
          portion.intensity != null
            ? Number(portion.intensity || 0)
            : Number(portion.percentage || 0) / 100
        const signed = SIGNED_MOOD_WEIGHTS[moodId] ?? 0
        return sum + weight * signed
      }, 0)
      const weightTotal = mix.reduce((sum, portion) => {
        return sum + (portion.intensity != null ? Number(portion.intensity || 0) : Number(portion.percentage || 0) / 100)
      }, 0)
      if (weightTotal > 0) {
        const signedAvg = fallback / weightTotal
        const mapped = ((signedAvg + 3) / 6) * 5 + 1
        scores.push(mapped)
      }
    }
  })

  let streakDays = 0
  if (daySet.size > 0) {
    const sortedDays = Array.from(daySet).sort().reverse()
    let cursor = new Date(`${sortedDays[0]}T00:00:00Z`)
    for (const day of sortedDays) {
      const current = new Date(`${day}T00:00:00Z`)
      if (current.getTime() === cursor.getTime()) {
        streakDays += 1
        cursor.setUTCDate(cursor.getUTCDate() - 1)
      } else {
        break
      }
    }
  }

  const topMoodId = Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const topMood = MOOD_OPTIONS.find((option) => option.id === topMoodId)
  const averageScore = scores.length > 0 ? (scores.reduce((sum, n) => sum + n, 0) / scores.length).toFixed(2) : '—'

  const averageMoodLabel =
    scores.length === 0
      ? 'Add more check-ins to build trends'
      : Number(averageScore) >= 5.2
        ? 'High positive range (about 5.2 to 6.0)'
        : Number(averageScore) >= 4.0
          ? 'Healthy-positive range (about 4.0 to 5.19)'
          : Number(averageScore) >= 2.8
            ? 'Mixed middle range (about 2.8 to 3.99)'
            : 'Lower range (about 1.0 to 2.79); consider extra support'

  const scoreSeries = sortedEntries
    .slice()
    .reverse()
    .map((entry, idx) => {
      const value =
        typeof entry.mood_score === 'number'
          ? Number(entry.mood_score.toFixed(2))
          : null
      if (value == null) return null
      return {
        x: idx + 1,
        score: value,
        dayAxisLabel: formatChartDayLabel(entry.created_at),
        timeLabel: formatChartTimeLabel(entry.created_at),
        created_at: entry.created_at,
      }
    })
    .filter(Boolean)

  const recentEntries = sortedEntries.slice(0, 5).map((entry) => {
    const mix = Array.isArray(entry.mood_mix) && entry.mood_mix.length > 0
      ? entry.mood_mix
      : [{ mood: entry.mood_evaluation, intensity: 1 }]

    const normalizedMix = mix
      .map((portion) => ({
        mood: portion.mood,
        weight:
          portion.intensity != null
            ? Number(portion.intensity || 0)
            : Number(portion.percentage || 0) / 100,
      }))
      .filter((portion) => portion.weight > 0)
    const sumWeights = normalizedMix.reduce((sum, p) => sum + p.weight, 0)
    const pieMix =
      sumWeights > 0
        ? normalizedMix.map((portion) => ({
            mood: portion.mood,
            ratio: portion.weight / sumWeights,
            color: EMOTION_COLORS[portion.mood] || '#94a3b8',
          }))
        : []

    const byWeightThenScore = [...normalizedMix].sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight
      const sa = MOOD_SCORE_MAP[a.mood] ?? 0
      const sb = MOOD_SCORE_MAP[b.mood] ?? 0
      return sb - sa
    })
    const emotionsLine = byWeightThenScore
      .map(
        (p) => MOOD_OPTIONS.find((opt) => opt.id === p.mood)?.label ?? p.mood,
      )
      .join(', ')

    const numericScore =
      typeof entry.mood_score === 'number' ? entry.mood_score.toFixed(2) : null
    const titleLine =
      numericScore != null ? `${formatDateLabel(entry.created_at)} • ${numericScore}` : formatDateLabel(entry.created_at)

    const reflectionTrimmed =
      typeof entry.reflection_text === 'string'
        ? entry.reflection_text.trim()
        : ''
    const reflectionText = reflectionTrimmed.length > 0 ? reflectionTrimmed : null

    return {
      titleLine,
      emotionsLine,
      numericScore,
      pieMix,
      reflectionText,
    }
  })

  return {
    summary: {
      checkInsThisWeek,
      streakDays,
      topMoodLabel: topMood?.label || 'No data yet',
      averageMoodScore: averageScore,
      averageMoodLabel,
    },
    weeklyTrend: scoreSeries,
    scoreScale: { min: 1, max: 6 },
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

async function submitCheckInToApi({ moods, reflection_text }) {
  return apiRequest('/check-ins', {
    method: 'POST',
    body: JSON.stringify({ moods, reflection_text }),
  })
}

export function useMentalHealthCheckIn() {
  const [selectedMoodIds, setSelectedMoodIds] = useState([])
  const [intensities, setIntensities] = useState({})
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

  const buildDefaultIntensities = useCallback((ids) => {
    if (ids.length === 0) return {}
    return Object.fromEntries(ids.map((id) => [id, 1]))
  }, [])

  useEffect(() => {
    if (selectedMoodIds.length === 0) {
      const defaultIds = MOOD_OPTIONS.slice(0, DEFAULT_SELECTION_COUNT).map((m) => m.id)
      setSelectedMoodIds(defaultIds)
      setIntensities(buildDefaultIntensities(defaultIds))
    }
  }, [buildDefaultIntensities, selectedMoodIds.length])

  const toggleMood = useCallback((id) => {
    setSelectedMoodIds((prev) => {
      let next
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id)
      } else {
        next = [...prev, id]
      }
      const nextSafe = next.length === 0 ? [id] : next
      setIntensities((old) => {
        const nextIntensities = buildDefaultIntensities(nextSafe)
        nextSafe.forEach((moodId) => {
          if (old[moodId] != null) nextIntensities[moodId] = old[moodId]
        })
        return nextIntensities
      })
      return nextSafe
    })
    setError('')
    setStatusMessage('')
  }, [buildDefaultIntensities])

  const updateIntensity = useCallback((id, value) => {
    const snapped = Math.round((Math.max(0, Math.min(2, value)) / 0.125)) * 0.125
    setIntensities((prev) => ({ ...prev, [id]: snapped }))
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

      if (!selectedMoodIds.length || selectedMoodIds.some((id) => !VALID_MOOD_IDS.has(id))) {
        setError('Choose at least one mood.')
        return
      }

      setError('')
      setIsSubmitting(true)

      try {
        const moodsPayload = selectedMoodIds.map((id) => ({
          mood: id,
          intensity: intensities[id] ?? 1,
        }))
        await submitCheckInToApi({
          moods: moodsPayload,
          reflection_text: reflection.trim() || null,
        })
        setStatusMessage('Your check-in was saved to your account.')
        setReflection('')
        const defaultIds = MOOD_OPTIONS.slice(0, DEFAULT_SELECTION_COUNT).map((m) => m.id)
        setSelectedMoodIds(defaultIds)
        setIntensities(buildDefaultIntensities(defaultIds))
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
    [buildDefaultIntensities, intensities, loadHistory, reflection, selectedMoodIds],
  )

  return {
    moodOptions: MOOD_OPTIONS,
    moodScoreMap: MOOD_SCORE_MAP,
    selectedMoodIds,
    toggleMood,
    intensities,
    updateIntensity,
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
