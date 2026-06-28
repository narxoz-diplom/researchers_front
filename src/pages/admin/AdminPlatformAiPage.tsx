import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PlatformSubscriberChatKeyForm } from '@/features/admin/components/PlatformSubscriberChatKeyForm'

export function AdminPlatformAiPage() {
  const { t } = useTranslation()

  return (
    <div>
      <PageHeader
        title={t('admin.ai.pageTitle')}
        subtitle={t('admin.ai.pageSubtitle')}
      />
      <PlatformSubscriberChatKeyForm />
    </div>
  )
}
