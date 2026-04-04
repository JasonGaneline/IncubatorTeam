import { AuthLayout } from '../../layouts/AuthLayout.jsx'
import { Button, InlineNotice, TextField } from '../../common/ui/index.js'
import { useLoginForm } from '../../hooks/useLoginForm.js'
import { MainNav } from '../../layouts/MainNav.jsx'

/**
 * LoginPage — composes dumb UI + smart hook.
 * Beginners: if you need to tweak layout, edit AuthLayout or the JSX here.
 * If you need to change validation or API calls, edit useLoginForm only.
 */

export function LoginPage() {
  const { values, errors, statusMessage, isSubmitting, onChange, onSubmit } =
    useLoginForm()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MainNav />
      <AuthLayout
        useAppShell
        title="Welcome back"
        subtitle="Sign in to continue your journey — your space for calm, clarity, and community."
        footerLink={{
          prefix: 'New here?',
          label: 'Create an account',
          to: '/signup',
        }}
      >
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <TextField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={onChange('email')}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={onChange('password')}
            error={errors.password}
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          <InlineNotice tone="success">{statusMessage}</InlineNotice>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing you in…' : 'Log in'}
          </Button>
        </form>
      </AuthLayout>
    </div>
  )
}
