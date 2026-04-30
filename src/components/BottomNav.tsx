import { NavLink } from 'react-router-dom'
import { Box, Car, Search, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { to: '/', label: 'Voitures', Icon: Car, exact: true },
  { to: '/clients', label: 'Clients', Icon: Users, exact: false },
  { to: '/stock', label: 'Stock', Icon: Box, exact: false },
  { to: '/recherche', label: 'Recherche', Icon: Search, exact: false },
] as const

export function BottomNav() {
  return (
    <nav className="flex flex-none border-t border-border bg-surface pb-1">
      {ITEMS.map(({ to, label, Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2',
              isActive ? 'text-accent' : 'text-fg-muted',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'rounded-2xl px-4 py-1 transition-colors',
                  isActive ? 'bg-accent-soft' : 'bg-transparent',
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
              </span>
              <span
                className={cn(
                  'text-[11px] tracking-[0.1px]',
                  isActive ? 'font-semibold' : 'font-medium',
                )}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
