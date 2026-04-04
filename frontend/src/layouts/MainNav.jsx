import { NavLink } from 'react-router-dom'

/**
 * MainNav — simple top bar so feature pages feel connected while auth ships separately.
 */

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-primary/15 text-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`

export function MainNav() {
  return (
    <nav
      className="border-b border-border bg-surface/90 backdrop-blur-sm"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 py-3 sm:gap-2 sm:px-6">
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>
        <NavLink to="/check-in" className={linkClass}>
          Check-in
        </NavLink>
        <NavLink to="/community" className={linkClass}>
          Forum
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          Profile
        </NavLink>
        <span
          className="mx-1 hidden h-6 w-px bg-border sm:inline-block"
          aria-hidden
        />
        <NavLink to="/login" className={linkClass}>
          Log in
        </NavLink>
        <NavLink to="/signup" className={linkClass}>
          Sign up
        </NavLink>
      </div>
    </nav>
  )
}
