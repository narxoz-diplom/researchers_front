import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { BrandWordmark } from '@/shared/components/BrandWordmark'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center no-underline">
          <BrandWordmark iconClassName="h-9 w-9" textClassName="text-xl" />
        </Link>

        <Outlet />

        <div className="mt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>{t('auth.footerCourses')}</span>
            <span aria-hidden>·</span>
            <span>{t('auth.footerAccess')}</span>
            <span aria-hidden>·</span>
            <span>{t('auth.footerProgress')}</span>
          </div>
          <div className="mt-3 flex justify-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
