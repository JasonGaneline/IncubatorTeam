/**
 * Profile-completion rule used to decide post-Google-login routing.
 *
 * A user's profile is "complete" enough to skip onboarding when:
 *   - they are a verified_professional, OR
 *   - they have an explicit user_role (anything other than the default
 *     `information_only`) AND, if pregnant_woman, pregnancy_week is set.
 *
 * Note: brand-new Google users are created server-side with the default
 * `information_only` role, so they fail this check and land on /onboarding.
 */
export function isProfileComplete(user) {
  if (!user) return false
  if (user.user_role === 'verified_professional' || user.is_verified_doctor) {
    return true
  }
  if (!user.user_role || user.user_role === 'information_only') {
    return false
  }
  if (user.user_role === 'pregnant_woman' && (user.pregnancy_week === null || user.pregnancy_week === undefined)) {
    return false
  }
  return true
}

/** Returns the path the user should land on after a successful login. */
export function postLoginPath(user) {
  return isProfileComplete(user) ? '/check-in' : '/onboarding'
}
