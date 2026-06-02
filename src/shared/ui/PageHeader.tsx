import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 py-5 sm:py-6 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && (
        <div
          className={cn(
            'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:shrink-0',
            '[&_input]:w-full sm:[&_input]:w-56',
            '[&_button]:w-full sm:[&_button]:w-auto',
          )}
        >
          {actions}
        </div>
      )}
    </div>
  )
}
