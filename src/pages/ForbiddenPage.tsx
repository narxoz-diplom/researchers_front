import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ForbiddenState } from '@/shared/ui/ForbiddenState'

export function ForbiddenPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return (
    <ForbiddenState
      title={t('errors.forbiddenTitle')}
      description={t('errors.forbiddenDescription')}
      action={{
        label: t(user ? 'common.backToCatalog' : 'common.backToHome'),
        onClick: () => navigate(user ? '/catalog' : '/'),
      }}
    />
  )
}
