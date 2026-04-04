import { AuthLayout } from '../../layouts/AuthLayout.jsx'
import { Button, InlineNotice, TextField } from '../../common/ui/index.js'
import { useSignupForm } from '../../hooks/useSignupForm.js'
import { MainNav } from '../../layouts/MainNav.jsx'

/**
 * SignupPage — mirrors LoginPage structure for consistency.
 * Validation rules live in useSignupForm; visuals live in shared UI components.
 */

export function SignupPage() {
  const { values, errors, statusMessage, isSubmitting, onChange, onSubmit } =
    useSignupForm()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MainNav />
      <AuthLayout
        useAppShell
        title="Create your account"
        subtitle="Join a gentle space for check-ins, learning, and community — on your terms."
        footerLink={{
          prefix: 'Already registered?',
          label: 'Log in instead',
          to: '/login',
        }}
      >
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <TextField
            id="displayName"
            label="Preferred name"
            type="text"
            value={values.displayName}
            onChange={onChange('displayName')}
            error={errors.displayName}
            autoComplete="nickname"
            placeholder="How should we greet you?"
            disabled={isSubmitting}
          />
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
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          <TextField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={values.confirmPassword}
            onChange={onChange('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          <InlineNotice tone="success">{statusMessage}</InlineNotice>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating your space…' : 'Sign up'}
          </Button>
        </form>
      </AuthLayout>
    </div>
  )
}
