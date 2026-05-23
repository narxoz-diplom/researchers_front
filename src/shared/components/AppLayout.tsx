import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  Menu,
  Shield,
  Users,
  Video,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import type { Role } from '@/shared/types'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/catalog', label: 'Каталог', icon: <BookOpen className="h-4 w-4" />, roles: ['SUBSCRIBER', 'AUTHOR', 'ADMIN'] },
  { href: '/studio', label: 'Studio', icon: <Video className="h-4 w-4" />, roles: ['AUTHOR', 'ADMIN'] },
  { href: '/admin/users', label: 'Пользователи', icon: <Users className="h-4 w-4" />, roles: ['ADMIN'] },
  { href: '/admin/subscriptions', label: 'Подписки', icon: <Shield className="h-4 w-4" />, roles: ['ADMIN'] },
  { href: '/profile', label: 'Профиль', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['SUBSCRIBER', 'AUTHOR', 'ADMIN'] },
]

function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const role = useAuthStore((s) => s.user?.role)
  if (!role) return null

  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/catalog" className="flex items-center gap-2 font-semibold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>researchers</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <div className="flex h-14 items-center border-b px-4">
                <Link
                  to="/catalog"
                  className="flex items-center gap-2 font-semibold text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>researchers</span>
                </Link>
              </div>
              <div className="p-3">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo (mobile) */}
          <Link
            to="/catalog"
            className="flex items-center gap-2 font-semibold text-foreground md:hidden"
          >
            <BookOpen className="h-5 w-5 text-primary" />
            <span>researchers</span>
          </Link>

          <div className="flex-1" />

          <ThemeToggle />
          <UserMenu />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
