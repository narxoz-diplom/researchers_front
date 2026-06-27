import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  icon?: ReactNode
}

export function ForbiddenState({ title, description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon ?? <ShieldAlert className="h-8 w-8" />}
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  )
}
