/**
 * ForumFeed — presentational shell for the community list (title + spacing + column width).
 * Parents pass mapped PostCard elements as `children` so this file stays layout-only.
 */

export function ForumFeed({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Community
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  )
}
