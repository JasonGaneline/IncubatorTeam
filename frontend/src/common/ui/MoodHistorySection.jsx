/**
 * MoodHistorySection — static presentation of stats + a simple bar chart + recent rows.
 * Feed it the mock JSON shape from `data/mockMoodHistory.json`; swap for API data later.
 */

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function MoodHistorySection({ data }) {
  if (!data) return null

  const { summary, weeklyTrend, scoreScale, recentEntries, chartCaption } = data
  const maxScore = scoreScale?.max ?? 5

  return (
    <section
      className="flex flex-col gap-8 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8"
      aria-labelledby="mood-history-heading"
    >
      <div>
        <h2
          id="mood-history-heading"
          className="text-lg font-semibold text-foreground"
        >
          Your mood snapshot (preview)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Numbers below are sample data so designers can see spacing and hierarchy.
        </p>
      </div>

      {/* Summary grid — will map to real aggregates from the backend */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Check-ins this week" value={summary.checkInsThisWeek} />
        <StatCard label="Streak" value={`${summary.streakDays} days`} />
        <StatCard label="Most common mood" value={summary.topMoodLabel} />
        <StatCard
          label="Avg. mood score"
          value={summary.averageMoodScore}
          hint={summary.averageMoodLabel}
        />
      </div>

      {/* Fake “chart” using flex bars — replace with Chart.js / Recharts later */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">Week at a glance</h3>
        <p className="mt-1 text-xs text-muted-foreground">{chartCaption}</p>
        <div
          className="mt-4 flex h-40 items-end justify-between gap-2 rounded-xl border border-border bg-surface px-3 pb-2 pt-6"
          role="img"
          aria-label="Bar chart of mood scores by day of week"
        >
          {weeklyTrend.map((row) => {
            const heightPct = Math.round((row.score / maxScore) * 100)
            return (
              <div
                key={row.day}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className="w-full max-w-[2.5rem] rounded-t-lg bg-primary/85 transition hover:bg-primary"
                    style={{ height: `${heightPct}%` }}
                    title={`${row.day}: ${row.moodShort}`}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {row.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent reflections — list layout ready for infinite scroll later */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">Recent reflections</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {recentEntries.map((entry, idx) => (
            <li
              key={`${entry.dateLabel}-${idx}`}
              className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    {entry.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {entry.moodLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.dateLabel}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.reflectionSnippet}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
