import { Badge } from '@/components/ui/badge'
import type { Role } from '@/shared/types'

const CONFIG: Record<Role, { label: string; className: string }> = {
  ADMIN: { label: 'Администратор', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  AUTHOR: { label: 'Автор', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  SUBSCRIBER: { label: 'Подписчик', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, className } = CONFIG[role]
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
