import { Outlet } from 'react-router-dom'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2 text-foreground no-underline">
          <BrandIcon className="h-9 w-9" />
          <span className="text-xl font-semibold">researchers</span>
        </div>

        <Outlet />

        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>{t('auth.footerCourses')}</span>
            <span>·</span>
            <span>{t('auth.footerAccess')}</span>
            <span>·</span>
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
