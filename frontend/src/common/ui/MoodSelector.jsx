/**
 * MoodSelector — pick how you feel today using emoji cards.
 * Fully controlled: parent (via hook) owns `selectedId` and `onSelect`.
 */

export function MoodSelector({
  options,
  selectedId,
  onSelect,
  disabled = false,
  label = 'How are you feeling right now?',
}) {
  return (
    <fieldset className="flex w-full flex-col gap-3 text-left" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const isActive = opt.id === selectedId
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
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
              <span className="text-xs font-semibold text-surface-foreground">
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
