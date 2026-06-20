import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Menu, Shield, Tags, UserCircle, Users, Video, GraduationCap } from 'lucide-react'
import { BookMarkIcon } from '@/shared/components/BrandIcon'
import { BrandWordmark } from '@/shared/components/BrandWordmark'
import { buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { NavbarSearch } from './NavbarSearch'
import { UserMenu } from './UserMenu'
import type { Role } from '@/shared/types'

interface NavItem {
  href: string
  labelKey: 'nav.myLearning' | 'nav.catalog' | 'nav.studio' | 'nav.users' | 'nav.subscriptions' | 'nav.founders' | 'nav.categories' | 'nav.profile'
  icon: React.ReactNode
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/my-learning', labelKey: 'nav.myLearning', icon: <GraduationCap className="h-4 w-4" />, roles: ['SUBSCRIBER'] },
  { href: '/catalog', labelKey: 'nav.catalog', icon: <BookMarkIcon className="h-4 w-4" />, roles: ['AUTHOR', 'ADMIN'] },
  { href: '/studio', labelKey: 'nav.studio', icon: <Video className="h-4 w-4" />, roles: ['AUTHOR', 'ADMIN'] },
  { href: '/admin/users', labelKey: 'nav.users', icon: <Users className="h-4 w-4" />, roles: ['ADMIN'] },
  { href: '/admin/subscriptions', labelKey: 'nav.subscriptions', icon: <Shield className="h-4 w-4" />, roles: ['ADMIN'] },
  { href: '/admin/founders', labelKey: 'nav.founders', icon: <UserCircle className="h-4 w-4" />, roles: ['ADMIN'] },
  { href: '/admin/categories', labelKey: 'nav.categories', icon: <Tags className="h-4 w-4" />, roles: ['ADMIN'] },
  { href: '/profile', labelKey: 'nav.profile', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['SUBSCRIBER', 'AUTHOR', 'ADMIN'] },
]

function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { t } = useTranslation()
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
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-dvh h-dvh bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <BrandWordmark to="/" iconClassName="h-7 w-7" textClassName="text-sm" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[4.25rem] shrink-0 items-center gap-3 border-b border-border/60 bg-card/80 px-3 backdrop-blur-xl sm:gap-4 sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <div className="flex h-14 items-center border-b px-4">
                <BrandWordmark
                  to="/"
                  iconClassName="h-7 w-7"
                  textClassName="text-sm"
                  onClick={() => setMobileOpen(false)}
                />
              </div>
              <div className="p-3">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <BrandWordmark to="/" iconClassName="h-7 w-7" textClassName="text-sm md:hidden" />

          <div className="flex min-w-0 flex-1 items-center justify-center px-1 sm:px-4">
            <NavbarSearch className="w-full max-w-lg" />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-0.5 shadow-sm">
              <LanguageToggle className="h-8 border-0 bg-transparent shadow-none" />
              <ThemeToggle className="h-8 w-8 rounded-lg" />
            </div>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
