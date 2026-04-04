import { Button } from '../../common/ui/Button.jsx'
import { BabySizeVisualization } from '../../common/ui/BabySizeVisualization.jsx'
import { ProfileCheckInProgress } from '../../common/ui/ProfileCheckInProgress.jsx'
import { ProfileHeader } from '../../common/ui/ProfileHeader.jsx'
import { ProfilePageSkeleton } from '../../common/ui/ProfilePageSkeleton.jsx'
import { ProfileSocialCounts } from '../../common/ui/ProfileSocialCounts.jsx'
import { useProfileData } from '../../hooks/useProfileData.js'
import { MainNav } from '../../layouts/MainNav.jsx'

/**
 * ProfilePage — composes profile sections; data arrives from useProfileData (mock → API).
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

export function ProfilePage() {
  const { data, isLoading, error, refetch } = useProfileData()

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
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-8 sm:gap-10">
            <ProfileHeader
              displayName={data.user.displayName}
              pregnancyWeek={data.user.pregnancyWeek}
              dueDateLabel={formatDueDate(data.user.dueDate)}
            />

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
