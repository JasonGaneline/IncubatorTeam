/**
 * Fallback baby-size copy when the API returns only `pregnancyWeek`.
 */

export function getBabySizeFromWeek(week) {
  const w = Math.min(Math.max(Number(week) || 0, 4), 42)

  const tiers = [
    { max: 7, headline: 'Your baby is about the size of a blueberry', emoji: '🫐' },
    { max: 11, headline: 'Your baby is about the size of a lemon', emoji: '🍋' },
    { max: 15, headline: 'Your baby is about the size of an apple', emoji: '🍎' },
    { max: 19, headline: 'Your baby is about the size of a bell pepper', emoji: '🫑' },
    { max: 23, headline: 'Your baby is about the size of a mango', emoji: '🥭' },
    { max: 27, headline: 'Your baby is about the size of a head of lettuce', emoji: '🥬' },
    { max: 31, headline: 'Your baby is about the size of a coconut', emoji: '🥥' },
    { max: 35, headline: 'Your baby is about the size of a honeydew melon', emoji: '🍈' },
    { max: 42, headline: 'Your baby is about the size of a small watermelon', emoji: '🍉' },
  ]

  const match = tiers.find((t) => w <= t.max) ?? tiers[tiers.length - 1]

  return {
    weekReferenced: w,
    headline: match.headline,
    supportingCopy:
      'This comparison is a playful guide — your care team has the clinical details.',
    emoji: match.emoji,
    illustrationUrl: null,
    illustrationAlt: 'Placeholder for baby size illustration',
  }
}
