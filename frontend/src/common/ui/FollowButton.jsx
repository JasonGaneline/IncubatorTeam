import { useFollow } from '../../hooks/useFollow.js'
import { Button } from './Button.jsx'

/**
 * FollowButton displays follow/unfollow state and allows toggling.
 * @param {string} targetUserId - UUID of the user to follow/unfollow
 * @param {boolean} initialIsFollowing - Initial follow state (defaults to false)
 * @param {function} onFollowChange - Optional callback after follow status changes
 */
export function FollowButton({ targetUserId, initialIsFollowing = false, onFollowChange }) {
  const { isFollowing, isLoading, error, toggle } = useFollow(targetUserId, initialIsFollowing)

  const handleToggle = async () => {
    await toggle()
    onFollowChange?.()
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant={isFollowing ? 'secondary' : 'primary'}
        className="w-full sm:w-auto"
      >
        {isLoading ? 'Updating...' : isFollowing ? 'Following' : 'Follow'}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
