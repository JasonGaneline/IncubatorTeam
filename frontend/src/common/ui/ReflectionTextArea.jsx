/**
 * ReflectionTextArea — optional journaling space after mood selection.
 * Styling matches TextField so forms feel consistent across the app.
 */

export function ReflectionTextArea({
  id = 'reflection',
  label = 'Anything you want to reflect on? (optional)',
  value,
  onChange,
  placeholder = 'A sentence or two is enough — this space is just for you.',
  disabled = false,
  maxLength = 2000,
  rows = 4,
}) {
  return (
    <div className="flex w-full flex-col gap-1 text-left">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-surface-foreground shadow-sm transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxLength} characters
      </p>
    </div>
  )
}
