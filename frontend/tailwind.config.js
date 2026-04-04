/**
 * ============================================================================
 * MATERNITY SUPPORT APP — DESIGN TOKENS (COLOR SYSTEM)
 * ============================================================================
 *
 * Welcome! This file is the single source of truth for our semantic colors.
 *
 * HOW TO CHANGE THE LOOK OF THE APP (for designers & frontend beginners):
 * 1. Scroll down to the `theme.extend.colors` section below.
 * 2. Replace ONLY the hex values there (e.g. "#f4eef8") — do not edit JSX files
 *    to change colors. Components use names like `bg-primary` and `text-muted`.
 * 3. Save the file and refresh the dev server. Tailwind will rebuild utilities.
 *
 * RULE FOR THE TEAM:
 * - Never put hex codes (like #ff00aa) directly inside React components.
 * - Always use semantic Tailwind classes: `bg-background`, `text-primary`, etc.
 * - If you need a new color role (e.g. "warning"), add it HERE first, then use
 *   `bg-warning` / `text-warning` in components.
 *
 * NAMING CHEAT SHEET (what each token is for):
 * - background / foreground     → page canvas and default body text
 * - primary / primary-foreground → main buttons, key highlights, links accent
 * - secondary / secondary-foreground → calmer supporting actions
 * - surface / surface-foreground   → cards, panels, elevated areas
 * - border                    → dividers and input outlines
 * - muted / muted-foreground  → helper text, placeholders, less important copy
 * - accent                    → soft highlights (badges, gentle fills)
 * - danger / danger-foreground    → errors, destructive actions
 * - success / success-foreground  → positive confirmations (saved, sent, etc.)
 *
 * ============================================================================
 */

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        /* Page-level base colors */
        background: '#faf7fc',
        foreground: '#1e1a24',

        /* Brand & actions */
        primary: {
          DEFAULT: '#7c5cbf',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#e8dff5',
          foreground: '#3d3550',
        },

        /* Cards & elevated surfaces */
        surface: {
          DEFAULT: '#ffffff',
          foreground: '#1e1a24',
        },

        /* Structure */
        border: '#e4dcef',
        muted: {
          DEFAULT: '#f3eef9',
          foreground: '#6b6378',
        },

        /* Gentle emphasis (tags, info chips) */
        accent: {
          DEFAULT: '#fce8f1',
          foreground: '#7a2d52',
        },

        /* Validation & alerts */
        danger: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#ecfdf3',
          foreground: '#166534',
        },
      },
      fontFamily: {
        /* Swap these if the team picks a Google Font later */
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
}
