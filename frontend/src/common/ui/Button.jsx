/**
 * Button — a "dumb" presentational component.
 * It only renders markup + Tailwind classes. It does not know about APIs or auth.
 * Parent components (or hooks) decide what happens on click via `onClick` / form `type`.
 */

const variantClasses = {
  /* Filled main action — sign in, submit check-in, etc. */
  primary:
    'bg-primary text-primary-foreground shadow-sm hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60',
  /* Softer supporting action — "Maybe later", secondary navigation */
  secondary:
    'bg-secondary text-secondary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-60',
  /* Outlined — ghost actions on tinted backgrounds */
  outline:
    'border border-border bg-surface text-surface-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border disabled:cursor-not-allowed disabled:opacity-60',
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  /** When false, the button shrinks to its content (e.g. reply actions inside a card). */
  fullWidth = true,
}) {
  const base = `inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
    fullWidth ? 'w-full' : 'w-auto min-w-[7rem]'
  }`

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  )
}
