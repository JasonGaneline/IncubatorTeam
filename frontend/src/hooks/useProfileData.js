import { useCallback, useEffect, useState } from 'react'

import { apiRequest, getStoredAuthUser } from '../utils/apiClient.js'
import { getBabySizeFromWeek } from '../utils/babySizeFromWeek.js'

function displayNameFromEmail(email) {
  if (!email) return 'Your profile'
  return email.split('@', 1)[0]
}

function normalizeProfilePayload(raw) {
  const pregnancyWeek = raw?.user?.pregnancy_week ?? null

  return {
    user: {
      id: raw.user.id,
      email: raw.user.email,
      displayName: displayNameFromEmail(raw.user.email),
      pregnancyWeek,
      dueDate: null,
    },
    checkInProgress: {
      checkInsThisWeek: raw.mood.check_ins_this_week,
      weeklyGoal: 7,
      streakDays: raw.mood.streak_days,
      totalCheckIns: raw.mood.total_check_ins,
      lastCheckInAt: raw.mood.last_check_in_at,
      lastMoodLabel: raw.mood.last_mood_label || 'No check-ins yet',
    },
    socialCounts: {
      followers: raw.followers_count,
      following: raw.following_count,
    },
    babySize: getBabySizeFromWeek(pregnancyWeek),
  }
}

async function fetchProfileFromApi() {
  const storedUser = getStoredAuthUser()

  if (!storedUser) {
    throw new Error('Sign in to view your real profile data.')
  }

  const response = await apiRequest('/profile/me')
  return normalizeProfilePayload(response)
}

export function useProfileData() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const next = await fetchProfileFromApi()
      setData(next)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Something went wrong loading your profile.',
      )
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    isLoading,
    error,
    refetch: load,
  }
}
