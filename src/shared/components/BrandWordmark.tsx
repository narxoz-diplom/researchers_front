import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { cn } from '@/lib/utils'

interface Props {
  to?: string
  className?: string
  iconClassName?: string
  textClassName?: string
  showText?: boolean
  onClick?: () => void
}

export function BrandWordmark({
  to,
  className,
  iconClassName = 'h-8 w-8',
  textClassName,
  showText = true,
  onClick,
}: Props) {
  const { t } = useTranslation()

  const content = (
    <>
      <BrandIcon className={iconClassName} />
      {showText && (
        <span className={cn('font-semibold tracking-tight', textClassName)}>
          {t('landing.brand')}
        </span>
      )}
    </>
  )

  const classes = cn('flex items-center gap-2.5 text-foreground', className)

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={cn(classes, 'transition-opacity hover:opacity-80')}>
        {content}
      </Link>
    )
  }

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
      {content}
    </div>
  )
}
