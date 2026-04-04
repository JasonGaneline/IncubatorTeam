/**
 * TextField — dumb input wrapper for consistent auth and form screens.
 * All visual state comes from props; no internal useState here.
 */

export function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  disabled = false,
}) {
  return (
    <div className="flex w-full flex-col gap-1 text-left">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-surface-foreground shadow-sm transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-danger' : 'border-border'
        }`}
      />
      {/* Friendly inline validation — parent passes message when something looks off */}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
