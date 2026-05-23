import { Badge } from '@/components/ui/badge'
import type { CourseStatus, SubscriptionStatus } from '@/shared/types'

type Status = CourseStatus | SubscriptionStatus

const CONFIG: Record<Status, { label: string; className: string }> = {
  DRAFT: { label: 'Черновик', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  PUBLISHED: { label: 'Опубликован', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ARCHIVED: { label: 'Архив', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  ACTIVE: { label: 'Активна', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  EXPIRED: { label: 'Истекла', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  REVOKED: { label: 'Отозвана', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = CONFIG[status]
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
