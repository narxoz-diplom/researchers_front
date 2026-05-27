import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { AppLanguage } from '@/i18n'
import { KzFlagIcon, RuFlagIcon } from '@/shared/components/FlagIcons'

const LANGUAGES: {
  code: AppLanguage
  labelKey: 'common.languageRu' | 'common.languageKk'
  Flag: typeof KzFlagIcon
}[] = [
  { code: 'kk', labelKey: 'common.languageKk', Flag: KzFlagIcon },
  { code: 'ru', labelKey: 'common.languageRu', Flag: RuFlagIcon },
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
      {LANGUAGES.map(({ code, labelKey, Flag }) => (
        <button
          key={code}
          type="button"
          aria-pressed={active === code}
          aria-label={t(labelKey)}
          onClick={() => void i18n.changeLanguage(code)}
          className={cn(
            'flex min-w-11 items-center justify-center px-2.5 transition-colors',
            active === code
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-muted/70',
          )}
        >
          <Flag
            className={cn(
              'rounded-[2px] border border-black/15 shadow-inner',
              code === 'kk' ? 'h-5 w-10' : 'h-5 w-[1.875rem]',
            )}
          />
        </button>
      ))}
    </div>
  )
}
