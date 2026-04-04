/**
 * ProfilePageSkeleton — loading placeholders while useProfileData resolves.
 */

export function ProfilePageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading profile">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-24 rounded-2xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 rounded-2xl bg-muted" />
        <div className="h-56 rounded-2xl bg-muted" />
      </div>
      <div className="h-64 rounded-2xl bg-muted" />
    </div>
  )
}
