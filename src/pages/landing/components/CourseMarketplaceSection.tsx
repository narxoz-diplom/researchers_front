import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceCourses } from '@/features/courses/hooks/useMarketplaceCourses'
import { cn } from '@/lib/utils'
import { MarketplaceCourseCard } from './MarketplaceCourseCard'

function MarketplaceSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-video rounded-2xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

// Same breakpoints as the grid below: 1 / sm:2 / lg:3 / xl:4 columns.
const COLUMN_QUERIES: [string, number][] = [
  ['(min-width: 1280px)', 4],
  ['(min-width: 1024px)', 3],
  ['(min-width: 640px)', 2],
]

function currentColumns(): number {
  if (typeof window === 'undefined') return 4
  return COLUMN_QUERIES.find(([q]) => window.matchMedia(q).matches)?.[1] ?? 1
}

/** Number of grid columns at the current viewport width. */
function useGridColumns(): number {
  const [columns, setColumns] = useState(currentColumns)
  useEffect(() => {
    const lists = COLUMN_QUERIES.map(([q]) => window.matchMedia(q))
    const update = () => setColumns(currentColumns())
    lists.forEach((l) => l.addEventListener('change', update))
    return () => lists.forEach((l) => l.removeEventListener('change', update))
  }, [])
  return columns
}

interface Props {
  catalogHref: string
  search?: string
}

export function CourseMarketplaceSection({ catalogHref, search = '' }: Props) {
  const { t } = useTranslation()
  const { data: courses, isLoading, isError } = useMarketplaceCourses(8, search)
  const columns = useGridColumns()
  const [expanded, setExpanded] = useState(false)
  // Only the first row is shown until the visitor asks for more; search results show in full.
  const showAll = expanded || search.trim().length > 0
  const visible = courses ? (showAll ? courses : courses.slice(0, columns)) : []
  const hiddenCount = (courses?.length ?? 0) - columns

  return (
    <section id="courses" className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
            {t('landing.marketplace.badge')}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('landing.marketplace.title')}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t('landing.marketplace.description')}
          </p>
        </div>
        <Link
          to={catalogHref}
          className={cn(buttonVariants({ variant: 'outline' }), 'gap-2 shrink-0 w-full sm:w-auto')}
        >
          {t('landing.marketplace.viewAll')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {isLoading && <MarketplaceSkeleton />}

      {isError && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('landing.marketplace.loadError')}
        </p>
      )}

      {!isLoading && !isError && courses && courses.length > 0 && (
        <>
          <div id="courses-grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((course, index) => (
              <MarketplaceCourseCard key={course.id} course={course} index={index % columns} />
            ))}
          </div>

          {!search.trim() && hiddenCount > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls="courses-grid"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {expanded
                  ? t('landing.marketplace.showLess')
                  : t('landing.marketplace.showMore', { count: hiddenCount })}
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && courses?.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('landing.marketplace.empty')}
        </p>
      )}
    </section>
  )
}
