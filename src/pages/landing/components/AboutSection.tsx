import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { useFounders } from '@/features/founders/hooks/useFounders'
import type { Founder } from '@/features/founders/types'
import { cn } from '@/lib/utils'
import { LANDING_SECTION_ANCHOR, LANDING_SECTION_HEADER } from '../landing-layout'
import { AboutPortraitVideoCard } from './AboutPortraitVideoCard'
import { AboutVideoModal } from './AboutVideoModal'

interface AboutPart {
  title: string
  description: string
  points: string[]
}

function AboutSkeleton() {
  return (
    <div className="grid gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-10">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-5">
          <Skeleton className="aspect-[9/16] w-full max-w-[220px] rounded-2xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  )
}

export function AboutSection() {
  const { t } = useTranslation()
  const { data: founders, isLoading } = useFounders()
  const [selected, setSelected] = useState<Founder | null>(null)

  const fallbackParts = t('landing.about.parts', { returnObjects: true }) as AboutPart[]

  const columns = useMemo(() => {
    const fromApi = (founders ?? [])
      .filter((f) => f.isPublished)
      .sort((a, b) => a.orderNumber - b.orderNumber)
      .slice(0, 3)

    if (fromApi.length > 0) {
      return fromApi.map((founder) => ({ kind: 'founder' as const, founder }))
    }

    return fallbackParts.map((part) => ({ kind: 'fallback' as const, part }))
  }, [founders, fallbackParts])

  return (
    <section id="about" className={cn(LANDING_SECTION_ANCHOR, 'overflow-x-clip')}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <p className={LANDING_SECTION_HEADER.badge}>{t('landing.about.badge')}</p>
        <h2 className={LANDING_SECTION_HEADER.title}>{t('landing.about.title')}</h2>
        <p className={cn(LANDING_SECTION_HEADER.description, 'mx-auto')}>
          {t('landing.about.description')}
        </p>
      </motion.div>

      {isLoading && <AboutSkeleton />}

      {!isLoading && (
        <div className="grid gap-10 px-2 py-4 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {columns.map((column, index) => {
            const isFounder = column.kind === 'founder'
            const founder = isFounder ? column.founder : undefined
            const part = !isFounder ? column.part : undefined
            const title = founder?.fullName ?? part?.title ?? ''
            const subtitle = founder?.position
            const description = founder?.description ?? part?.description ?? ''
            const points = !founder ? (part?.points ?? []) : []

            return (
              <motion.div
                key={founder?.id ?? part?.title ?? index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <AboutPortraitVideoCard
                  index={index}
                  video={
                    founder
                      ? {
                          id: founder.id,
                          videoUrl: founder.videoUrl,
                          previewUrl: founder.previewUrl,
                          label: founder.fullName,
                        }
                      : undefined
                  }
                  onOpen={() => founder && setSelected(founder)}
                />

                <div className="flex w-full flex-col gap-3 px-1">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  {subtitle && <p className="text-sm font-medium text-primary">{subtitle}</p>}
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  {points.length > 0 && (
                    <ul className="mx-auto flex max-w-xs flex-col gap-1.5 text-left">
                      {points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AboutVideoModal
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.fullName ?? ''}
        subtitle={selected?.position}
        description={selected?.description}
        videoUrl={selected?.videoUrl}
      />
    </section>
  )
}
