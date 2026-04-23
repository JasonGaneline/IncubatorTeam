/**
 * ProfileHeader is purely presentational.
 */

export function ProfileHeader({ displayName, pregnancyWeek, dueDateLabel }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Profile
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
          {displayName}
        </h1>
        {dueDateLabel ? (
          <p className="mt-2 text-sm text-muted-foreground">Due {dueDateLabel}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-1 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm sm:items-end">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Pregnancy week
        </span>
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {pregnancyWeek ? `Week ${pregnancyWeek}` : 'Not set yet'}
        </span>
      </div>
    </header>
  )
}
