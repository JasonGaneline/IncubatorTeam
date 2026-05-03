import { useCallback, useEffect, useState } from 'react'
import { getPublicUserProfile } from '../utils/authApi.js'
import { getBabySizeFromWeek } from '../utils/babySizeFromWeek.js'

function displayNameFromEmail(email) {
  if (!email) return 'User profile'
  return email.split('@', 1)[0]
}

function normalizePublicProfilePayload(raw) {
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
    isFollowing: raw.is_following || false,
    babySize: getBabySizeFromWeek(pregnancyWeek),
  }
}

async function fetchPublicProfileFromApi(userId) {
  const response = await getPublicUserProfile(userId)
  return normalizePublicProfilePayload(response)
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
