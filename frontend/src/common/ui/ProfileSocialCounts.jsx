/**
 * ProfileSocialCounts — followers / following placeholders for the forum & DM features.
 */

export function ProfileSocialCounts({ socialCounts }) {
  if (!socialCounts) return null

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
      aria-labelledby="profile-social-heading"
    >
      <h2
        id="profile-social-heading"
        className="text-base font-semibold text-foreground"
      >
        Community
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Counts are sample values until the follow system is wired to the API.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {socialCounts.followers}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Followers
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {socialCounts.following}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Following
          </p>
        </div>
      </div>
    </section>
  )
}
