import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { BrandWordmark } from '@/shared/components/BrandWordmark'
import { NavbarSearch } from '@/shared/components/NavbarSearch'
import { buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LanguageToggle } from '@/shared/components/LanguageToggle'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { UserMenu } from '@/shared/components/UserMenu'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { getAccountHomeLabelKey, getAccountHomePath } from '@/shared/utils/account-home'
import { cn } from '@/lib/utils'
import { LandingNavLinks } from './LandingNavLinks'
import { scrollToSection } from './landing-nav'
import { LandingCartButton } from './components/LandingCartButton'

interface Props {
  courseSearch: string
  onCourseSearchChange: (value: string) => void
  catalogHref: string
  loginHref: string
}

export function LandingHeader({
  courseSearch,
  onCourseSearchChange,
  catalogHref,
  loginHref,
}: Props) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [mobileOpen, setMobileOpen] = useState(false)
  const accountHref = getAccountHomePath(user?.role)
  const accountLabelKey = getAccountHomeLabelKey(user?.role)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-[4.25rem] items-center gap-3 lg:gap-5">
          <BrandWordmark to="/" iconClassName="h-8 w-8" textClassName="hidden text-[15px] sm:inline" />

          <NavbarSearch
            variant="landing"
            value={courseSearch}
            onChange={onCourseSearchChange}
            onSubmit={() => scrollToSection('courses')}
            className="mx-auto hidden min-w-0 flex-1 md:flex lg:max-w-sm xl:max-w-md"
          />

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-0.5 shadow-sm">
              <LandingCartButton catalogHref={catalogHref} className="h-8 w-8 rounded-lg" />
              <LanguageToggle className="h-8 border-0 bg-transparent shadow-none" />
              <ThemeToggle className="h-8 w-8 rounded-lg" />
            </div>

            {user && (
              <div className="sm:hidden">
                <UserMenu />
              </div>
            )}

            <div className="hidden items-center gap-2 sm:flex">
              {!user ? (
                <Link
                  to={loginHref}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-9 px-4')}
                >
                  {t('landing.login')}
                </Link>
              ) : (
                <>
                  <Link
                    to={accountHref}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-9 px-4')}
                  >
                    {t(accountLabelKey)}
                  </Link>
                  <UserMenu />
                </>
              )}
              <Link
                to={catalogHref}
                className={cn(buttonVariants({ size: 'sm' }), 'h-9 px-4 shadow-sm')}
              >
                {t('landing.goToCatalog')}
              </Link>
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'icon' }),
                  'h-9 w-9 shrink-0 lg:hidden',
                )}
                aria-label={t('landing.menu')}
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
                <SheetHeader className="border-b px-6 py-5 text-left">
                  <SheetTitle>
                    <BrandWordmark iconClassName="h-6 w-6" textClassName="text-base" />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
                  <NavbarSearch
                    variant="landing"
                    value={courseSearch}
                    onChange={onCourseSearchChange}
                    onSubmit={() => {
                      scrollToSection('courses')
                      setMobileOpen(false)
                    }}
                    className="max-w-none"
                  />

                  <div>
                    <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t('landing.menuSections')}
                    </p>
                    <LandingNavLinks
                      variant="menu"
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-2 border-t bg-muted/20 p-6">
                  {!user ? (
                    <Link
                      to={loginHref}
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({ variant: 'outline', className: 'w-full' })}
                    >
                      {t('landing.login')}
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={accountHref}
                        onClick={() => setMobileOpen(false)}
                        className={buttonVariants({ className: 'w-full' })}
                      >
                        {t(accountLabelKey)}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className={buttonVariants({ variant: 'outline', className: 'w-full' })}
                      >
                        {t('nav.profile')}
                      </Link>
                    </>
                  )}
                  <Link
                    to={catalogHref}
                    onClick={() => setMobileOpen(false)}
                    className={buttonVariants({ variant: user ? 'outline' : 'default', className: 'w-full' })}
                  >
                    {t('landing.goToCatalog')}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <nav
          aria-label={t('landing.menuSections')}
          className="hidden border-t border-border/50 bg-muted/20 lg:block"
        >
          <div className="flex items-center justify-center gap-0.5 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <LandingNavLinks variant="pills" />
          </div>
        </nav>
      </div>
    </header>
  )
}
