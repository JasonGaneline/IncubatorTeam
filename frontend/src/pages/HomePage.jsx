import { Link } from 'react-router-dom'

import { MainNav } from '../layouts/MainNav.jsx'

/**
 * HomePage - lightweight landing route.
 */

export function HomePage() {
  return (
    <div className="min-h-svh bg-background">
      <MainNav />
      <div className="mx-auto flex max-w-3xl flex-col justify-center gap-10 px-4 py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pregnancy support
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">
            You are building something beautiful.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore check-in, community, and profile using real authentication and
            database data. Use the nav bar on any screen to move between sections.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/check-in"
            className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            Mental health check-in
          </Link>
          <Link
            to="/community"
            className="inline-flex rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-surface-foreground"
          >
            Community forum
          </Link>
          <Link
            to="/profile"
            className="inline-flex rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-surface-foreground"
          >
            Profile
          </Link>
          <Link
            to="/login"
            className="inline-flex rounded-xl border border-dashed border-border px-5 py-3 text-sm font-semibold text-muted-foreground"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex rounded-xl border border-dashed border-border px-5 py-3 text-sm font-semibold text-muted-foreground"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
