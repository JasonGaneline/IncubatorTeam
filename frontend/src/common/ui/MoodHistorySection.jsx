/**
 * MoodHistorySection renders the user's real check-in history and summary stats.
 */

import { useCallback, useRef, useState } from 'react'

function StatCard({ label, value, hint }) {
  const compact = label === 'Most common mood'
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-semibold leading-tight text-foreground ${compact ? 'truncate whitespace-nowrap text-sm sm:text-base' : 'break-words text-xl sm:text-2xl'}`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

const CHART_X0 = 15
const CHART_X1 = 90
const CHART_Y_TOP = 11
const CHART_Y_BOT = 36

function moodScorePointPx(rowIdx, score, weeklyTrendLen, minScore, maxScore) {
  const n = weeklyTrendLen
  const span = CHART_X1 - CHART_X0
  const xMid = (CHART_X0 + CHART_X1) / 2
  const x =
    n <= 1 ? xMid : CHART_X0 + (rowIdx / Math.max(n - 1, 1)) * span
  const yNorm = (score - minScore) / (maxScore - minScore)
  const ySpan = CHART_Y_BOT - CHART_Y_TOP
  const y = CHART_Y_BOT - yNorm * ySpan
  return { x, y: Math.max(CHART_Y_TOP + 0.75, Math.min(CHART_Y_BOT - 0.5, y)) }
}

export function MoodHistorySection({ data }) {
  if (!data) return null

  const { summary, weeklyTrend, scoreScale, recentEntries, chartCaption } = data
  const maxScore = scoreScale?.max ?? 6
  const minScore = scoreScale?.min ?? 1
  const wrapRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  const linePoints = weeklyTrend
    .map((row, idx) => {
      const { x, y } = moodScorePointPx(idx, row.score, weeklyTrend.length, minScore, maxScore)
      return `${x},${y}`
    })
    .join(' ')

  const hideTooltip = useCallback(() => setTooltip(null), [])

  const showTooltip = useCallback((e, row) => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setTooltip({
      left: e.clientX - r.left,
      top: e.clientY - r.top,
      score: row.score,
      dayLabel: row.dayAxisLabel,
      timeLabel: row.timeLabel,
    })
  }, [])

  function buildMiniPieBackground(pieMix) {
    if (!Array.isArray(pieMix) || pieMix.length === 0) return 'transparent'
    let cursor = 0
    const parts = pieMix.map((slice) => {
      const start = cursor
      const end = cursor + slice.ratio * 100
      cursor = end
      return `${slice.color} ${start}% ${end}%`
    })
    if (cursor < 100) {
      parts.push(`#cbd5e1 ${cursor}% 100%`)
    }
    return `conic-gradient(${parts.join(', ')})`
  }

  return (
    <section
      className="flex flex-col gap-8 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8"
      aria-labelledby="mood-history-heading"
    >
      <div>
        <h2 id="mood-history-heading" className="text-lg font-semibold text-foreground">
          Your mood snapshot
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This section updates only when you submit real check-ins.
        </p>
      </div>

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

      {weeklyTrend.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-foreground">Score trend by check-in</h3>
          <p className="mt-1 text-xs text-muted-foreground">{chartCaption}</p>
          <div
            ref={wrapRef}
            className="relative mt-4 rounded-xl border border-border bg-surface p-3"
            onMouseLeave={hideTooltip}
          >
            {tooltip ? (
              <div
                className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground shadow-md"
                style={{
                  left: Math.min(
                    Math.max(tooltip.left + 12, 8),
                    (wrapRef.current?.offsetWidth ?? 200) - 120,
                  ),
                  top: Math.max(tooltip.top - 36, 4),
                }}
                role="status"
              >
                <span className="font-semibold">Score {tooltip.score}</span>
                <span className="text-muted-foreground">
                  {' '}
                  · {tooltip.dayLabel}
                  {tooltip.timeLabel ? ` · ${tooltip.timeLabel}` : ''}
                </span>
              </div>
            ) : null}
            <svg
              viewBox="-6 0 106 52"
              className="w-full text-muted-foreground"
              role="img"
              aria-label="Line graph of check-in mood scores over time"
            >
              {/* Y-axis title — left of tick numbers to avoid overlap */}
              <text
                x="-3.5"
                y="23.5"
                textAnchor="middle"
                dominantBaseline="middle"
                transform="rotate(-90 -3.5 23.5)"
                className="fill-muted-foreground"
                fontSize="2.75"
              >
                Mood Score
              </text>

              {/* Y tick labels */}
              <text
                x={CHART_X0 - 3.2}
                y={CHART_Y_TOP}
                dominantBaseline="middle"
                fontSize="2.5"
                textAnchor="end"
                className="fill-muted-foreground"
              >
                {maxScore}
              </text>
              <text
                x={CHART_X0 - 3.2}
                y={(CHART_Y_TOP + CHART_Y_BOT) / 2}
                dominantBaseline="middle"
                fontSize="2.5"
                textAnchor="end"
                className="fill-muted-foreground"
              >
                {((minScore + maxScore) / 2).toFixed(1)}
              </text>
              <text
                x={CHART_X0 - 3.2}
                y={CHART_Y_BOT}
                dominantBaseline="middle"
                fontSize="2.5"
                textAnchor="end"
                className="fill-muted-foreground"
              >
                {minScore}
              </text>

              {/* Grid lines */}
              <line
                x1={CHART_X0}
                y1={CHART_Y_TOP}
                x2={CHART_X1}
                y2={CHART_Y_TOP}
                stroke="currentColor"
                opacity="0.08"
              />
              <line
                x1={CHART_X0}
                y1={(CHART_Y_TOP + CHART_Y_BOT) / 2}
                x2={CHART_X1}
                y2={(CHART_Y_TOP + CHART_Y_BOT) / 2}
                stroke="currentColor"
                opacity="0.08"
              />

              {/* Axes */}
              <line
                x1={CHART_X0}
                y1={CHART_Y_BOT}
                x2={CHART_X1}
                y2={CHART_Y_BOT}
                stroke="currentColor"
                opacity="0.35"
              />
              <line
                x1={CHART_X0}
                y1={CHART_Y_TOP}
                x2={CHART_X0}
                y2={CHART_Y_BOT}
                stroke="currentColor"
                opacity="0.35"
              />

              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                points={linePoints}
                className="text-primary"
              />
              {weeklyTrend.map((row, idx) => {
                const { x, y } = moodScorePointPx(
                  idx,
                  row.score,
                  weeklyTrend.length,
                  minScore,
                  maxScore,
                )
                return (
                  <g key={`${row.created_at ?? idx}-${idx}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="3.8"
                      className="cursor-crosshair fill-transparent"
                      stroke="transparent"
                      onMouseEnter={(e) => showTooltip(e, row)}
                      onMouseMove={(e) => showTooltip(e, row)}
                    />
                    <circle cx={x} cy={y} r="1.6" className="pointer-events-none fill-primary" />
                    <text
                      x={x}
                      y="38.9"
                      fontSize="2"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground"
                    >
                      {row.dayAxisLabel}
                    </text>
                  </g>
                )
              })}

              <text
                x="52"
                y="42.4"
                fontSize="2.2"
                textAnchor="middle"
                className="fill-muted-foreground"
              >
                Check-in day (submitted)
              </text>
            </svg>
          </div>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-foreground">Recent reflections</h3>
        {recentEntries.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-3">
            {recentEntries.map((entry, idx) => (
              <li
                key={`${entry.titleLine}-${idx}`}
                className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-8 w-8 shrink-0 rounded-full border border-border"
                      style={{ background: buildMiniPieBackground(entry.pieMix) }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {entry.titleLine}
                      </p>
                      {entry.emotionsLine ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{entry.emotionsLine}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                {entry.reflectionText ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {entry.reflectionText}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
            No check-ins yet. Submit your first entry above to start your history.
          </p>
        )}
      </div>
    </section>
  )
}
