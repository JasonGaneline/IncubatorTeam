import { useCallback, useEffect, useState } from 'react'

import MOCK_PROFILE from '../data/mockProfile.json'
import { getBabySizeFromWeek } from '../utils/babySizeFromWeek.js'

/**
 * Normalized profile payload — mirror what `GET /api/users/me/profile` (or similar) should return.
 * @typedef {object} ProfileUser
 * @property {string} id
 * @property {string} displayName
 * @property {string} email
 * @property {number} pregnancyWeek
 * @property {string} [dueDate]
 *
 * @typedef {object} CheckInProgress
 * @property {number} checkInsThisWeek
 * @property {number} weeklyGoal
 * @property {number} streakDays
 * @property {number} totalCheckIns
 * @property {string} lastCheckInAt
 * @property {string} lastMoodLabel
 *
 * @typedef {object} SocialCounts
 * @property {number} followers
 * @property {number} following
 *
 * @typedef {object} BabySize
 * @property {number} weekReferenced
 * @property {string} headline
 * @property {string} supportingCopy
 * @property {string} emoji
 * @property {string|null} illustrationUrl
 * @property {string} illustrationAlt
 */

/**
 * useProfileData — fetches (mock today) the signed-in user's profile.
 *
 * SWAP FOR REAL API:
 * 1. Replace `MOCK_PROFILE` import with a `fetch` to your FastAPI route.
 * 2. Use `Authorization: Bearer <token>` headers from your auth layer.
 * 3. Map the JSON body into the same shape as `normalizeProfilePayload` expects.
 * 4. Keep `isLoading` / `error` / `refetch` so pages do not need to change.
 */

const MOCK_LATENCY_MS = 420

function normalizeProfilePayload(raw) {
  const user = raw.user
  const babySize =
    raw.babySize && raw.babySize.headline
      ? raw.babySize
      : getBabySizeFromWeek(user?.pregnancyWeek)

  return {
    user,
    checkInProgress: raw.checkInProgress,
    socialCounts: raw.socialCounts,
    babySize,
  }
}

async function fetchProfileFromApi() {
  // --- Replace this entire function with real REST logic, e.g.:
  // const token = getAccessToken()
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/profile`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // })
  // if (!res.ok) throw new Error('Could not load profile')
  // const json = await res.json()
  // return normalizeProfilePayload(json)

  await new Promise((r) => window.setTimeout(r, MOCK_LATENCY_MS))
  return normalizeProfilePayload(MOCK_PROFILE)
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
