import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandWordmark } from '@/shared/components/BrandWordmark'
import { NavbarSearch } from '@/shared/components/NavbarSearch'
import { LanguageToggle } from '@/shared/components/LanguageToggle'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PublicBrowseLayout() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <BrandWordmark to="/" iconClassName="h-7 w-7" textClassName="text-sm" />
          <NavbarSearch className="mx-auto hidden max-w-md flex-1 md:flex" />
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle className="h-8 border-0 bg-transparent shadow-none" />
            <ThemeToggle className="h-8 w-8" />
            {user ? (
              <Link to="/catalog" className={cn(buttonVariants({ size: 'sm' }), 'h-9')}>
                {t('landing.goToCatalog')}
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-9')}
                >
                  {t('landing.login')}
                </Link>
                <Link to="/auth/register" className={cn(buttonVariants({ size: 'sm' }), 'h-9')}>
                  {t('landing.start')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
