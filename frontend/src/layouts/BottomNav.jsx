import { NavLink } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const coreItems = [
  { path: '/check-in', label: 'Check-in', icon: '💭' },
  { path: '/community', label: 'Forum', icon: '💬' },
  { path: '/messages', label: 'Inbox', icon: '✉️' },
]

/**
 * BottomNav — primary app navigation on every screen.
 * When logged out, the right slot shows Log in / Sign up (replacing Profile).
 * When logged in, that slot is Profile. Sign out is only from the profile screen.
 */
export function BottomNav() {
  const { isAuthenticated } = useAuth()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {coreItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition ${
                isActive
                  ? 'text-primary border-t-2 border-primary -mt-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        {isAuthenticated ? (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition ${
                isActive
                  ? 'text-primary border-t-2 border-primary -mt-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <span className="text-lg" aria-hidden>
              👤
            </span>
            Profile
          </NavLink>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `rounded-md px-2 py-0.5 transition ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `rounded-md px-2 py-0.5 transition ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Sign up
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
