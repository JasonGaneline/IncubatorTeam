/**
 * InlineNotice — small banner for success/info messages (dummy auth flow, future API toasts).
 * Pure presentation: type only changes colors via semantic tokens.
 */

const toneClasses = {
  success: 'border-border bg-success text-success-foreground',
  error: 'border-danger/40 bg-accent text-accent-foreground',
  info: 'border-border bg-secondary text-secondary-foreground',
}

export function InlineNotice({ children, tone = 'info' }) {
  if (!children) return null

  return (
    <p
      className={`rounded-xl border px-3 py-2 text-sm ${toneClasses[tone]}`}
      role="status"
    >
      {children}
    </p>
  )
}
