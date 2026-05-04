const EMOTION_COLORS = {
  overwhelmed: '#3b82f6', // blue (raindrops)
  low: '#c2410c', // dark orange
  okay: '#fb923c', // light orange
  calm: '#22c55e', // leaf green
  grateful: '#f9a8d4', // light pink
  joyful: '#8b5cf6', // purple
}

function buildPieBackground(selectedOptions, intensities) {
  if (!selectedOptions.length) return 'transparent'
  const total = selectedOptions.reduce(
    (sum, opt) => sum + Math.max(0, Number(intensities?.[opt.id] ?? 1)),
    0,
  )
  if (total <= 0) return 'transparent'
  let cursor = 0
  const parts = selectedOptions.map((opt, idx) => {
    const raw = Math.max(0, Number(intensities?.[opt.id] ?? 1))
    const pct = (raw / total) * 100
    const start = cursor
    const end = Math.min(100, cursor + pct)
    cursor = end
    const color = EMOTION_COLORS[opt.id] || '#94a3b8'
    return `${color} ${start}% ${end}%`
  })
  if (cursor < 100) {
    parts.push(`#cbd5e1 ${cursor}% 100%`)
  }
  return `conic-gradient(${parts.join(', ')})`
}

export function MoodSelector({
  options,
  selectedIds,
  onToggle,
  intensities,
  onIntensityChange,
  scoreMap,
  disabled = false,
  label = 'How are you feeling right now? (Pick 1 or more)',
}) {
  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id))

  return (
    <fieldset className="flex w-full flex-col gap-3 text-left" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const isActive = selectedIds.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-4 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                  : 'border-border bg-surface hover:border-primary/40 hover:bg-muted'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span className="text-3xl" aria-hidden>
                {opt.emoji}
              </span>
              <span className="text-xs font-semibold text-surface-foreground break-words">
                {opt.label}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Score: {scoreMap[opt.id]}
              </span>
            </button>
          )
        })}
      </div>

      {selectedOptions.length > 0 ? (
        <div className="mt-2 rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center justify-center">
              <div
                className="h-28 w-28 rounded-full border border-border"
                style={{ background: buildPieBackground(selectedOptions, intensities) }}
                role="img"
                aria-label="Mood composition pie chart"
              />
            </div>
            <div className="w-full space-y-3">
              {selectedOptions.map((opt) => (
                <div key={opt.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {opt.emoji} {opt.label}
                    </span>
                    <span className="text-muted-foreground">
                      x{(intensities[opt.id] ?? 1).toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.125}
                    value={intensities[opt.id] ?? 1}
                    onChange={(e) => onIntensityChange(opt.id, Number(e.target.value))}
                    className="w-full"
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </fieldset>
  )
}
