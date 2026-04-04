/**
 * BabySizeVisualization — fruit/veg comparison + illustration placeholder.
 * When `illustrationUrl` is set later, swap the dashed box for a real <img>.
 */

export function BabySizeVisualization({ babySize }) {
  if (!babySize) return null

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary/80 to-background p-5 shadow-sm sm:p-8"
      aria-labelledby="baby-size-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="min-w-0 flex-1">
          <h2
            id="baby-size-heading"
            className="text-base font-semibold text-foreground sm:text-lg"
          >
            Baby size this week
          </h2>
          <p className="mt-3 text-lg font-medium leading-snug text-foreground sm:text-xl">
            {babySize.headline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {babySize.supportingCopy}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Week {babySize.weekReferenced} · comparison is approximate
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-4 lg:w-72">
          <span
            className="flex h-24 w-24 items-center justify-center rounded-2xl bg-surface text-5xl shadow-inner sm:h-28 sm:w-28 sm:text-6xl"
            aria-hidden
          >
            {babySize.emoji}
          </span>

          {babySize.illustrationUrl ? (
            <img
              src={babySize.illustrationUrl}
              alt={babySize.illustrationAlt}
              className="h-48 w-full max-w-xs rounded-2xl border border-border object-cover"
            />
          ) : (
            <div
              className="flex h-48 w-full max-w-xs flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface/80 px-4 text-center"
              role="img"
              aria-label={babySize.illustrationAlt}
            >
              <span className="text-sm font-medium text-muted-foreground">
                Illustration placeholder
              </span>
              <span className="mt-2 text-xs text-muted-foreground">
                Drop an image URL from the API into{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                  illustrationUrl
                </code>{' '}
                when assets are ready.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
