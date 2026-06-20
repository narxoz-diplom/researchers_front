import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ALL_NAV_ITEMS, scrollToSection } from './landing-nav'

type Variant = 'pills' | 'menu'

export function LandingNavLinks({
  onNavigate,
  className,
  variant = 'menu',
}: {
  onNavigate?: () => void
  className?: string
  variant?: Variant
}) {
  const { t } = useTranslation()

  if (variant === 'pills') {
    return (
      <nav className={cn('flex items-center gap-1', className)}>
        {ALL_NAV_ITEMS.map(({ id }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              scrollToSection(id)
              onNavigate?.()
            }}
            className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t(`landing.nav.${id}`)}
          </button>
        ))}
      </nav>
    )
  }

  return (
    <nav className={cn('flex flex-col gap-0.5', className)}>
      {ALL_NAV_ITEMS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            scrollToSection(id)
            onNavigate?.()
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {t(`landing.nav.${id}`)}
        </button>
      ))}
    </nav>
  )
}
