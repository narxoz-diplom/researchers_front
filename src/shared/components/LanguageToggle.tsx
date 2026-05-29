import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { AppLanguage } from '@/i18n'

const LANGUAGES: {
  code: AppLanguage
  labelKey: 'common.languageRu' | 'common.languageKk'
  emoji: string
}[] = [
  { code: 'kk', labelKey: 'common.languageKk', emoji: '🇰🇿' },
  { code: 'ru', labelKey: 'common.languageRu', emoji: '🇷🇺' },
]

export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const resolved = i18n.resolvedLanguage ?? i18n.language
  const active: AppLanguage = resolved.startsWith('kk') ? 'kk' : 'ru'

  return (
    <div
      role="group"
      aria-label={t('common.languageToggle')}
      className="inline-flex h-9 overflow-hidden rounded-md border border-border bg-background shadow-sm"
    >
      {LANGUAGES.map(({ code, labelKey, emoji }) => (
        <button
          key={code}
          type="button"
          aria-pressed={active === code}
          aria-label={t(labelKey)}
          onClick={() => void i18n.changeLanguage(code)}
          className={cn(
            'flex min-w-11 items-center justify-center px-2.5 text-lg leading-none transition-colors',
            active === code
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-muted/70',
          )}
        >
          <span aria-hidden>{emoji}</span>
        </button>
      ))}
    </div>
  )
}
