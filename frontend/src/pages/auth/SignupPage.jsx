import { AuthLayout } from '../../layouts/AuthLayout.jsx'
import {
  Button,
  GoogleSignInSection,
  InlineNotice,
  TextField,
} from '../../common/ui/index.js'
import { useGoogleAuth } from '../../hooks/useGoogleAuth.js'
import { useSignupForm } from '../../hooks/useSignupForm.js'

/**
 * SignupPage — email/password or Google. Account type is chosen next on /onboarding.
 */
export function SignupPage() {
  const {
    values,
    errors,
    statusMessage,
    errorMessage,
    isSubmitting,
    onChange,
    onSubmit,
  } = useSignupForm()
  const {
    isSubmitting: isGoogleSubmitting,
    error: googleError,
    statusMessage: googleStatusMessage,
    handleGoogleSuccess,
    handleGoogleError,
    resetFeedback,
  } = useGoogleAuth()

  return (
    <div className="flex min-h-svh flex-col bg-background pb-24">
      <AuthLayout
        useAppShell
        title="Create your account"
        subtitle="After you sign up, you will pick how you use the app (including the professional path with NPI verification) on the next screen."
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
            onChange={(event) => {
              resetFeedback()
              onChange('displayName')(event)
            }}
            error={errors.displayName}
            autoComplete="nickname"
            placeholder="How should we greet you?"
            disabled={isSubmitting || isGoogleSubmitting}
          />
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
            autoComplete="new-password"
            disabled={isSubmitting || isGoogleSubmitting}
          />
          <TextField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={values.confirmPassword}
            onChange={(event) => {
              resetFeedback()
              onChange('confirmPassword')(event)
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isSubmitting || isGoogleSubmitting}
          />

          <InlineNotice tone="error">{errorMessage}</InlineNotice>
          <InlineNotice tone="success">{statusMessage}</InlineNotice>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isSubmitting ? 'Creating your space...' : 'Sign up'}
          </Button>
        </form>

        <GoogleSignInSection
          title="Start with Google"
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
