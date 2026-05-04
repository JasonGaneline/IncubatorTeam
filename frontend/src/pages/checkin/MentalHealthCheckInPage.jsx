import {
  Button,
  InlineNotice,
  MoodHistorySection,
  MoodSelector,
  ReflectionTextArea,
} from '../../common/ui/index.js'
import { useMentalHealthCheckIn } from '../../hooks/useMentalHealthCheckIn.js'

/**
 * MentalHealthCheckInPage is backed by the real check-in API and history.
 */

export function MentalHealthCheckInPage() {
  const {
    moodOptions,
    selectedMoodId,
    selectMood,
    reflection,
    setReflectionText,
    submit,
    isSubmitting,
    statusMessage,
    error,
    history,
    historyError,
    isHistoryLoading,
    refetchHistory,
  } = useMentalHealthCheckIn()

  return (
    <div className="min-h-svh bg-background pb-24">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Mental health
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Daily check-in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Name what you feel, reflect if you want, and build a real history over time.
          </p>
        </header>

        <form
          className="flex flex-col gap-8 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8"
          onSubmit={submit}
          noValidate
        >
          <MoodSelector
            options={moodOptions}
            selectedId={selectedMoodId}
            onSelect={selectMood}
            disabled={isSubmitting}
          />

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <ReflectionTextArea
            value={reflection}
            onChange={setReflectionText}
            disabled={isSubmitting}
          />

          <InlineNotice tone="success">{statusMessage}</InlineNotice>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving your check-in…' : 'Submit check-in'}
          </Button>
        </form>

        <div className="mt-10">
          {historyError ? (
            <div className="rounded-2xl border border-danger/30 bg-accent/20 p-6">
              <p className="text-sm text-accent-foreground">{historyError}</p>
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                fullWidth={false}
                onClick={() => refetchHistory()}
              >
                Try again
              </Button>
            </div>
          ) : isHistoryLoading ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
              Loading your check-in history…
            </div>
          ) : (
            <MoodHistorySection data={history} />
          )}
        </div>
      </div>
    </div>
  )
}
