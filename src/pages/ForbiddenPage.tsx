import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-8xl font-bold text-muted-foreground/30 select-none">403</span>
        <h1 className="text-2xl font-semibold">{t('errors.forbiddenTitle')}</h1>
        <p className="text-muted-foreground max-w-sm">{t('errors.forbiddenDescription')}</p>
      </div>
      <Button onClick={() => navigate('/catalog')}>{t('common.backToCatalog')}</Button>
    </div>
  )
}
