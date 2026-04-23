import { AuthLayout } from '../../layouts/AuthLayout.jsx'
import {
  Button,
  GoogleSignInSection,
  InlineNotice,
  TextField,
} from '../../common/ui/index.js'
import { useGoogleAuth } from '../../hooks/useGoogleAuth.js'
import { useSignupForm } from '../../hooks/useSignupForm.js'
import { MainNav } from '../../layouts/MainNav.jsx'

/**
 * SignupPage mirrors LoginPage so auth screens stay predictable for the team.
 */

export function SignupPage() {
  const {
    values,
    errors,
    statusMessage,
    errorMessage,
    isSubmitting,
    roleOptions,
    requiresPregnancyWeek,
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
    <div className="flex min-h-svh flex-col bg-background">
      <MainNav />
      <AuthLayout
        useAppShell
        title="Create your account"
        subtitle="Join a gentle space for check-ins, learning, and community - on your terms."
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

          <fieldset className="rounded-2xl border border-border bg-muted/30 p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Which best describes you?
            </legend>
            <p className="mt-1 text-sm text-muted-foreground">
              We use this to personalize the app around your situation.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-sm"
                >
                  <input
                    type="radio"
                    name="userRole"
                    value={option.value}
                    checked={values.userRole === option.value}
                    onChange={(event) => {
                      resetFeedback()
                      onChange('userRole')(event)
                    }}
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="block font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="block text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <InlineNotice tone="error">{errors.userRole}</InlineNotice>
          </fieldset>

          {requiresPregnancyWeek ? (
            <TextField
              id="pregnancyWeek"
              label="Current pregnancy week"
              type="number"
              value={values.pregnancyWeek}
              onChange={(event) => {
                resetFeedback()
                onChange('pregnancyWeek')(event)
              }}
              error={errors.pregnancyWeek}
              placeholder="Example: 24"
              disabled={isSubmitting || isGoogleSubmitting}
            />
          ) : null}

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
