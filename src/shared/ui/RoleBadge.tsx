import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { Role } from '@/shared/types'

const ROLE_CLASS: Record<Role, string> = {
  ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  AUTHOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SUBSCRIBER: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

export function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation()

  return (
    <Badge variant="secondary" className={ROLE_CLASS[role]}>
      {t(`roles.${role}`)}
    </Badge>
  )
}
