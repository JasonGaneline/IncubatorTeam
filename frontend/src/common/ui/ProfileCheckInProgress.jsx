/**
 * ProfileCheckInProgress shows real check-in counts from the API.
 */

export function ProfileCheckInProgress({ progress }) {
  if (!progress) return null

  const pct = Math.min(
    100,
    Math.round((progress.checkInsThisWeek / progress.weeklyGoal) * 100),
  )

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
      aria-labelledby="profile-checkin-heading"
    >
      <h2
        id="profile-checkin-heading"
        className="text-base font-semibold text-foreground"
      >
        Mental health check-in progress
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">This reflects your saved check-ins.</p>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="font-medium text-foreground">This week</span>
          <span className="tabular-nums text-muted-foreground">
            {progress.checkInsThisWeek} / {progress.weeklyGoal} days
          </span>
        </div>
        <div
          className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Check-ins completed this week"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/50 px-3 py-3">
          <dt className="text-xs font-medium text-muted-foreground">Streak</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {progress.streakDays} days
          </dd>
        </div>
        <div className="rounded-xl bg-muted/50 px-3 py-3">
          <dt className="text-xs font-medium text-muted-foreground">All-time</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {progress.totalCheckIns}
          </dd>
        </div>
        <div className="col-span-2 rounded-xl bg-muted/50 px-3 py-3 sm:col-span-1">
          <dt className="text-xs font-medium text-muted-foreground">Last mood</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {progress.lastMoodLabel}
          </dd>
        </div>
      </dl>
    </section>
  )
}
