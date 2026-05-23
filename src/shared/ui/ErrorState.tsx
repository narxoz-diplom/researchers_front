import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface Props {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">{t('errors.title')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message ?? t('errors.default')}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
