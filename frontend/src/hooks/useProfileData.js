import { useCallback, useEffect, useState } from 'react'

import { apiRequest, getStoredAuthUser } from '../utils/apiClient.js'
import { getBabySizeFromWeek } from '../utils/babySizeFromWeek.js'
import { normalizeOwnProfileResponse } from './mapProfileUser.js'

async function fetchProfileFromApi() {
  const storedUser = getStoredAuthUser()

  if (!storedUser) {
    throw new Error('Sign in to view your real profile data.')
  }

  const response = await apiRequest('/profile/me')
  const base = normalizeOwnProfileResponse(response)
  const pregnancyWeek = base.user?.pregnancy_week ?? null

  return {
    ...base,
    checkInProgress: {
      checkInsThisWeek: response.mood.check_ins_this_week,
      weeklyGoal: 7,
      streakDays: response.mood.streak_days,
      totalCheckIns: response.mood.total_check_ins,
      lastCheckInAt: response.mood.last_check_in_at,
      lastMoodLabel: response.mood.last_mood_label || 'No check-ins yet',
    },
    socialCounts: {
      followers: base.followers_count,
      following: base.following_count,
    },
    babySize: getBabySizeFromWeek(pregnancyWeek),
  }
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
