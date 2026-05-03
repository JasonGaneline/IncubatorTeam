import { useCallback, useState } from 'react'
import { followUser, unfollowUser } from '../utils/authApi.js'

/**
 * useFollow manages follow/unfollow state for a target user.
 * @param {string} targetUserId - UUID of the user to follow/unfollow
 * @param {boolean} initialIsFollowing - Initial follow state
 * @returns {object} - { isFollowing, isLoading, error, toggle }
 */
export function useFollow(targetUserId, initialIsFollowing = false) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggle = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isFollowing) {
        await unfollowUser(targetUserId)
        setIsFollowing(false)
      } else {
        await followUser(targetUserId)
        setIsFollowing(true)
      }
    } catch (err) {
      setError(err.message || 'Failed to update follow status')
      // Revert state on error
      setIsFollowing(!isFollowing)
    } finally {
      setIsLoading(false)
    }
  }, [targetUserId, isFollowing])

  return { isFollowing, isLoading, error, toggle }
}
