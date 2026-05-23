import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { CourseStatus, SubscriptionStatus } from '@/shared/types'

type Status = CourseStatus | SubscriptionStatus

const STATUS_CLASS: Record<Status, string> = {
  DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  EXPIRED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  REVOKED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation()

  return (
    <Badge variant="secondary" className={STATUS_CLASS[status]}>
      {t(`statuses.${status}`)}
    </Badge>
  )
}
