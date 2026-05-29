import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  src: string
  alt: string
  icon?: ComponentType<{ className?: string }>
  className?: string
  priority?: boolean
}

export function LandingPhoto({ src, alt, icon: Icon, className, priority }: Props) {
  return (
    <div
      className={cn(
        'group relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-sm',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      {Icon && (
        <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background/90 text-primary shadow-md backdrop-blur-sm">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}
