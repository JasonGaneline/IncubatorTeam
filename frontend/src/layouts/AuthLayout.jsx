import { Link } from 'react-router-dom'

/**
 * AuthLayout — dumb layout wrapper shared by Login and Signup.
 * It only arranges spacing and background; no auth logic lives here.
 *
 * When `useAppShell` is true, use a tighter vertical rhythm (bottom nav is global in App).
 */

export function AuthLayout({
  title,
  subtitle,
  children,
  footerLink,
  useAppShell = false,
}) {
  const outer = useAppShell
    ? 'flex flex-1 flex-col bg-gradient-to-b from-secondary/70 via-background to-background px-4 py-8 sm:px-6 sm:py-10'
    : 'flex min-h-svh flex-col bg-gradient-to-b from-secondary via-background to-background px-4 py-10 sm:px-6'

  return (
    <div className={outer}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Nest &amp; Nurture
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg shadow-foreground/5 sm:p-8">
          {children}
        </div>

        {footerLink ? (
          <p className="text-center text-sm text-muted-foreground">
            {footerLink.prefix}{' '}
            <Link
              to={footerLink.to}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {footerLink.label}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  )
}
