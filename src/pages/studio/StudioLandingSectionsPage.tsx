import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { TextWithLinks } from '@/shared/ui/TextWithLinks'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { COURSE_SECTION_CATEGORIES } from '@/features/courses/course-categories'
import type { LandingSectionContent } from '@/features/landing-sections/hooks/useLandingSections'
import { cn } from '@/lib/utils'

export function StudioLandingSectionsPage() {
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['landing-sections'],
    queryFn: () =>
      api.get<LandingSectionContent[]>(API.landingSections.list).then((r) => r.data),
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-16">
      <PageHeader
        title={t('studio.sections.title')}
        subtitle={t('studio.sections.subtitle')}
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {COURSE_SECTION_CATEGORIES.map((slug) => {
            const section = data?.find((s) => s.slug === slug)
            return (
              <div
                key={slug}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{t(`landing.nav.${slug}`)}</h3>
                  <TextWithLinks
                    as="p"
                    className="mt-2 line-clamp-2 text-sm text-muted-foreground"
                    text={
                      section?.description ??
                      t(`landing.sections.${slug}.description`)
                    }
                  />
                </div>
                <Link
                  to={`/studio/sections/${slug}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 gap-2')}
                >
                  <Pencil className="h-4 w-4" />
                  {t('common.edit')}
                </Link>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{t('studio.sections.linkHintTitle')}</p>
        <p className="mt-1">{t('studio.sections.linkHint')}</p>
        <code className="mt-2 block rounded-lg bg-background px-3 py-2 text-xs">
          {t('studio.sections.linkExample')}
        </code>
      </div>
    </div>
  )
}
