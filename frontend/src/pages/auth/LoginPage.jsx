import { AuthLayout } from '../../layouts/AuthLayout.jsx'
import {
  Button,
  GoogleSignInSection,
  InlineNotice,
  TextField,
} from '../../common/ui/index.js'
import { useGoogleAuth } from '../../hooks/useGoogleAuth.js'
import { useLoginForm } from '../../hooks/useLoginForm.js'
import { MainNav } from '../../layouts/MainNav.jsx'

/**
 * LoginPage composes presentational pieces with the login hook.
 * The hook owns API behavior; this component owns layout and wiring.
 */

export function LoginPage() {
  const {
    values,
    errors,
    statusMessage,
    errorMessage,
    isSubmitting,
    onChange,
    onSubmit,
  } = useLoginForm()
  const {
    isSubmitting: isGoogleSubmitting,
    error: googleError,
    statusMessage: googleStatusMessage,
    handleGoogleSuccess,
    handleGoogleError,
    resetFeedback,
  } = useGoogleAuth()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MainNav />
      <AuthLayout
        useAppShell
        title="Welcome back"
        subtitle="Sign in to continue your journey - your space for calm, clarity, and community."
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
            onChange={(event) => {
              resetFeedback()
              onChange('email')(event)
            }}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting || isGoogleSubmitting}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={(event) => {
              resetFeedback()
              onChange('password')(event)
            }}
            error={errors.password}
            autoComplete="current-password"
            disabled={isSubmitting || isGoogleSubmitting}
          />

          <InlineNotice tone="error">{errorMessage}</InlineNotice>
          <InlineNotice tone="success">{statusMessage}</InlineNotice>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isSubmitting ? 'Signing you in...' : 'Log in'}
          </Button>
        </form>

        <GoogleSignInSection
          title="Use your Google account"
          isLoading={isGoogleSubmitting}
          error={googleError}
          statusMessage={googleStatusMessage}
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </AuthLayout>
    </div>
  )
}
