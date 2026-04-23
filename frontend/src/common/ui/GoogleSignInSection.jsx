import { GoogleLogin } from '@react-oauth/google'

import { InlineNotice } from './InlineNotice.jsx'

const missingClientIdMessage =
  'Add VITE_GOOGLE_CLIENT_ID to your frontend environment before using Google sign-in.'

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        or continue with
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  )
}

/**
 * GoogleSignInSection is a presentational wrapper around the library button.
 * The hook owns the side effects; this component only renders the OAuth area.
 */
export function GoogleSignInSection({
  title,
  isLoading,
  error,
  statusMessage,
  onSuccess,
  onError,
}) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isConfigured = Boolean(googleClientId)

  return (
    <section className="space-y-4">
      <Divider />

      <div className="rounded-2xl border border-border bg-muted/60 p-4 shadow-sm shadow-foreground/5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Google handles the popup. Our backend still verifies the credential before
            we trust the sign-in.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {isConfigured ? (
            <div
              className={`overflow-hidden rounded-xl border border-border bg-white p-1 ${
                isLoading ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>
          ) : (
            <InlineNotice tone="error">{missingClientIdMessage}</InlineNotice>
          )}

          {isLoading ? (
            <InlineNotice tone="info">
              Finishing Google sign-in and waiting for the backend to verify your
              account…
            </InlineNotice>
          ) : null}

          <InlineNotice tone="error">{error}</InlineNotice>
          <InlineNotice tone="success">{statusMessage}</InlineNotice>
        </div>
      </div>
    </section>
  )
}
