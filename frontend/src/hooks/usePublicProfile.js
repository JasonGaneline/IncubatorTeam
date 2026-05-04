import { useCallback, useEffect, useState } from 'react'

import { getPublicUserProfile } from '../utils/authApi.js'
import { getBabySizeFromWeek } from '../utils/babySizeFromWeek.js'
import { normalizePublicProfileResponse } from './mapProfileUser.js'

async function fetchPublicProfileFromApi(userId) {
  const response = await getPublicUserProfile(userId)
  const base = normalizePublicProfileResponse(response)
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

export function usePublicProfile(userId) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const next = await fetchPublicProfileFromApi(userId)
      setData(next)
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      load()
    }
  }, [userId, load])

  const refetch = useCallback(() => load(), [load])

  return { data, isLoading, error, refetch }
}
