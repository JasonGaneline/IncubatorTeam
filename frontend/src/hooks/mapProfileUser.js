/**
 * Maps API `UserPublic` (snake_case) into the shape ProfilePage expects.
 */
export function mapProfileUser(rawUser) {
  if (!rawUser) return null
  return {
    id: rawUser.id,
    email: rawUser.email,
    display_name: rawUser.display_name ?? null,
    bio: rawUser.bio ?? null,
    age: rawUser.age ?? null,
    profile_picture: rawUser.profile_picture ?? null,
    pregnancy_week: rawUser.pregnancy_week ?? null,
    user_role: rawUser.user_role ?? null,
    is_verified_doctor: Boolean(rawUser.is_verified_doctor),
    created_at: rawUser.created_at,
  }
}

export function normalizeOwnProfileResponse(raw) {
  return {
    user: mapProfileUser(raw.user),
    followers_count: raw.followers_count ?? 0,
    following_count: raw.following_count ?? 0,
    mood: raw.mood,
  }
}

export function normalizePublicProfileResponse(raw) {
  return {
    user: mapProfileUser(raw.user),
    followers_count: raw.followers_count ?? 0,
    following_count: raw.following_count ?? 0,
    isFollowing: Boolean(raw.is_following),
    mood: raw.mood,
  }
}
