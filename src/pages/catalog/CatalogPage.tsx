import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Course, Meta } from '@/shared/types'
import { CourseCard } from '@/features/courses/components/CourseCard'
import {
  COURSE_SECTION_CATEGORIES,
  isCourseSectionCategory,
  type CourseSectionCategory,
} from '@/features/courses/course-categories'
import { cn } from '@/lib/utils'

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-video rounded-2xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export function CatalogPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''

  const categoryParam = searchParams.get('category')
  const activeCategory = isCourseSectionCategory(categoryParam) ? categoryParam : undefined

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', { search: search || undefined, category: activeCategory }],
    queryFn: () =>
      api
        .get<{ data: Course[]; meta: Meta }>(API.courses.list, {
          params: {
            search: search || undefined,
            category: activeCategory,
            pageSize: 50,
          },
        })
        .then((r) => r.data),
  })

  function updateParams(next: { search?: string; category?: CourseSectionCategory | null }) {
    const params: Record<string, string> = {}
    const nextSearch = next.search !== undefined ? next.search : search
    const nextCategory = next.category !== undefined ? next.category : activeCategory

    if (nextSearch.trim()) params.search = nextSearch.trim()
    if (nextCategory) params.category = nextCategory

    setSearchParams(params, { replace: true })
  }

  function handleSearchChange(value: string) {
    updateParams({ search: value })
  }

  function handleCategoryChange(category: CourseSectionCategory | null) {
    updateParams({ category })
  }

  return (
    <div>
      <PageHeader
        title={t('catalog.title')}
        subtitle={data ? t('common.coursesCount', { count: data.meta.total }) : undefined}
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('catalog.searchPlaceholder')}
              className="pl-9 w-full sm:w-64"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange(null)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm transition-colors',
            !activeCategory
              ? 'border-primary bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {t('catalog.categoryAll')}
        </button>
        {COURSE_SECTION_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handleCategoryChange(category)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              activeCategory === category
                ? 'border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {t(`landing.nav.${category}`)}
          </button>
        ))}
      </div>

      {isError && <ErrorState onRetry={() => void refetch()} />}

      {isLoading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              title={t('catalog.emptyTitle')}
              description={t('catalog.emptyDescription')}
            />
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.data.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => navigate(`/courses/${course.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
