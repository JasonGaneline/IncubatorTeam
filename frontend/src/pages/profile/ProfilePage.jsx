import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

import { Button } from '../../common/ui/Button.jsx'
import { FollowButton } from '../../common/ui/FollowButton.jsx'
import { PregnancyProgressTracker } from '../../common/ui/PregnancyProgressTracker.jsx'
import { FollowersList } from '../../common/ui/FollowersList.jsx'
import { useProfileData } from '../../hooks/useProfileData.js'
import { usePublicProfile } from '../../hooks/usePublicProfile.js'
import { getStoredAuthUser } from '../../utils/apiClient.js'
import { useAuth } from '../../context/AuthContext.jsx'

export function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const currentUser = getStoredAuthUser()
  const { logout } = useAuth()
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  const publicProfile = usePublicProfile(userId)
  const ownProfile = useProfileData()

  let data = null
  let isLoading = false
  let error = null
  let refetch = null
  let isOwnProfile = false

  if (userId) {
    data = publicProfile.data
    isLoading = publicProfile.isLoading
    error = publicProfile.error
    refetch = publicProfile.refetch
    isOwnProfile = Boolean(currentUser && userId === currentUser.id)
  } else if (currentUser) {
    data = ownProfile.data
    isLoading = ownProfile.isLoading
    error = ownProfile.error
    refetch = ownProfile.refetch
    isOwnProfile = true
  } else {
    error = 'Sign in to view your profile'
  }

  const listUserId = useMemo(() => {
    if (userId) return userId
    return currentUser?.id || null
  }, [userId, currentUser])

  const profileInitials = useMemo(() => {
    const u = data?.user
    if (!u) return '?'
    const label = (u.display_name || u.email || '?').trim()
    const parts = label.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || '?'
    }
    return label.slice(0, 2).toUpperCase() || '?'
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-svh bg-background pb-24">
        <div className="p-4">Loading...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-svh bg-background pb-24">
        <div className="p-4 text-danger">{error}</div>
      </div>
    )
  }
  if (!data) return null

  const user = data.user
  const pregnancyWeek = user.pregnancy_week
  const showPregnancyTracker =
    pregnancyWeek !== null && pregnancyWeek !== undefined && pregnancyWeek !== ''

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-svh bg-background pb-24">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-lg border border-border bg-surface p-6 mb-6">
          <div className="mb-4">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.display_name || user.email || 'Profile photo'}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary ring-2 ring-border"
                aria-hidden
              >
                {profileInitials}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>{user.display_name || user.email}</span>
            {user.is_verified_doctor ? (
              <span
                className="text-green-600 text-xl"
                title="Verified Professional"
                aria-label="Verified Professional"
              >
                {'\u2713'}
              </span>
            ) : null}
          </h1>
          {user.bio ? <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p> : null}
          {user.age !== null && user.age !== undefined ? (
            <p className="text-sm text-muted-foreground">Age: {user.age}</p>
          ) : null}

          <div className="mt-6 flex gap-2 flex-wrap">
            {isOwnProfile ? (
              <>
                <Link to="/profile/settings">
                  <Button variant="secondary" fullWidth={false}>
                    Settings
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button fullWidth={false}>Messages</Button>
                </Link>
                <Button variant="secondary" fullWidth={false} onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : null}
            {!isOwnProfile && currentUser ? (
              <>
                <FollowButton
                  targetUserId={userId}
                  initialIsFollowing={data.isFollowing}
                  onFollowChange={() => refetch?.()}
                />
                <Link to={`/messages/${userId}`}>
                  <Button fullWidth={false}>Message</Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setShowFollowing(false)
              setShowFollowers((v) => !v)
            }}
            className={`p-4 rounded-lg border text-center transition ${
              showFollowers
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted hover:bg-muted/80'
            }`}
          >
            <p className="text-lg font-bold text-foreground">{data.followers_count}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowFollowers(false)
              setShowFollowing((v) => !v)
            }}
            className={`p-4 rounded-lg border text-center transition ${
              showFollowing
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted hover:bg-muted/80'
            }`}
          >
            <p className="text-lg font-bold text-foreground">{data.following_count}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
        </div>

        {showFollowers && listUserId ? (
          <div className="mb-4">
            <FollowersList userId={listUserId} listType="followers" />
          </div>
        ) : null}
        {showFollowing && listUserId ? (
          <div className="mb-4">
            <FollowersList userId={listUserId} listType="following" />
          </div>
        ) : null}

        {showPregnancyTracker ? (
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Pregnancy Progress</h2>
            <PregnancyProgressTracker pregnancyWeek={Number(pregnancyWeek)} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
