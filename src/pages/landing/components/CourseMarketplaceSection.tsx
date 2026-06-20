import { Link } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useMarketplaceCourses } from '@/features/courses/hooks/useMarketplaceCourses'
import { cn } from '@/lib/utils'
import { LANDING_SECTION_ANCHOR, LANDING_SECTION_HEADER } from '../landing-layout'
import { MarketplaceCourseCard } from './MarketplaceCourseCard'

function marketplaceGridClass(count: number) {
  if (count <= 1) return 'mx-auto max-w-sm grid-cols-1'
  if (count === 2) return 'mx-auto max-w-2xl sm:grid-cols-2'
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

function MarketplaceSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
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

interface Props {
  search: string
  onSearchChange: (value: string) => void
  categoryId: string | null
  onCategoryChange: (value: string | null) => void
}

export function CourseMarketplaceSection({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
}: Props) {
  const { t } = useTranslation()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: courses, isLoading, isError } = useMarketplaceCourses(8, search, categoryId)

  return (
    <section id="courses" className={LANDING_SECTION_ANCHOR}>
      <div className="mb-10">
        <p className={LANDING_SECTION_HEADER.badge}>{t('landing.marketplace.badge')}</p>
        <h2 className={LANDING_SECTION_HEADER.title}>{t('landing.marketplace.title')}</h2>
        <p className={LANDING_SECTION_HEADER.description}>
          {t('landing.marketplace.description')}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('landing.marketplace.searchPlaceholder')}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm transition-colors',
            categoryId === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted',
          )}
        >
          {t('landing.marketplace.allCategories')}
        </button>
        {categoriesLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        {categories?.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              categoryId === category.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted',
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading && <MarketplaceSkeleton />}

      {isError && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('landing.marketplace.loadError')}
        </p>
      )}

      {!isLoading && !isError && courses && courses.length > 0 && (
        <div className={cn('grid gap-6', marketplaceGridClass(courses.length))}>
          {courses.map((course, index) => (
            <MarketplaceCourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      )}

      {!isLoading && !isError && courses && courses.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Link to="/catalog" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'gap-2')}>
            {t('landing.marketplace.viewFullCatalog')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!isLoading && !isError && courses?.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('landing.marketplace.empty')}
        </p>
      )}
    </section>
  )
}
