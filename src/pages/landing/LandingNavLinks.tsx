import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, scrollToSection } from './landing-nav'

export function LandingNavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <nav className={cn('flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1', className)}>
      {NAV_ITEMS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            scrollToSection(id)
            onNavigate?.()
          }}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon className="h-4 w-4 shrink-0" />
          {t(`landing.nav.${id}`)}
        </button>
      ))}
    </nav>
  )
}
