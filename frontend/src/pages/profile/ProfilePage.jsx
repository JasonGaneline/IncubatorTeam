import { useParams } from 'react-router-dom'
import { Button } from '../../common/ui/Button.jsx'
import { FollowButton } from '../../common/ui/FollowButton.jsx'
import { BabySizeVisualization } from '../../common/ui/BabySizeVisualization.jsx'
import { ProfileCheckInProgress } from '../../common/ui/ProfileCheckInProgress.jsx'
import { ProfileHeader } from '../../common/ui/ProfileHeader.jsx'
import { ProfilePageSkeleton } from '../../common/ui/ProfilePageSkeleton.jsx'
import { ProfileSocialCounts } from '../../common/ui/ProfileSocialCounts.jsx'
import { useProfileData } from '../../hooks/useProfileData.js'
import { usePublicProfile } from '../../hooks/usePublicProfile.js'
import { getStoredAuthUser } from '../../utils/apiClient.js'
import { MainNav } from '../../layouts/MainNav.jsx'

/**
 * ProfilePage displays either the current user's profile or another user's public profile.
 * - No userId param: show current user's profile (protected)
 * - With userId param: show another user's public profile (public)
 */

function formatDueDate(iso) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function isOwnProfile(userId, currentUser) {
  return currentUser && userId === currentUser.id
}

export function ProfilePage() {
  const { userId } = useParams()
  const currentUser = getStoredAuthUser()

  // Use public profile hook if userId is provided, otherwise use own profile hook
  const publicProfile = usePublicProfile(userId)
  const ownProfile = useProfileData()

  // Determine which profile to use
  let data = null
  let isLoading = false
  let error = null
  let refetch = null

  if (userId) {
    // Viewing another user's profile
    data = publicProfile.data
    isLoading = publicProfile.isLoading
    error = publicProfile.error
    refetch = publicProfile.refetch
  } else if (currentUser) {
    // Viewing own profile
    data = ownProfile.data
    isLoading = ownProfile.isLoading
    error = ownProfile.error
    refetch = ownProfile.refetch
  } else {
    // Not authenticated and no userId provided
    error = 'Sign in to view your profile'
  }

  return (
    <div className="min-h-svh bg-background">
      <MainNav />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {isLoading ? (
          <ProfilePageSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-danger/30 bg-accent/30 p-6 text-center">
            <p className="text-sm font-medium text-accent-foreground">{error}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => refetch?.()}
            >
              Try again
            </Button>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <ProfileHeader
                displayName={data.user.displayName}
                pregnancyWeek={data.user.pregnancyWeek}
                dueDateLabel={formatDueDate(data.user.dueDate)}
              />
              {userId && currentUser && !isOwnProfile(userId, currentUser) ? (
                <FollowButton
                  targetUserId={userId}
                  initialIsFollowing={data.isFollowing}
                  onFollowChange={() => refetch?.()}
                />
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
              <ProfileCheckInProgress progress={data.checkInProgress} />
              <ProfileSocialCounts socialCounts={data.socialCounts} />
            </div>

            <BabySizeVisualization babySize={data.babySize} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
