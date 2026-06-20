import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useMarketplaceCourses } from '@/features/courses/hooks/useMarketplaceCourses'
import { cn } from '@/lib/utils'
import { LandingHeader } from '@/pages/landing/LandingHeader'
import { MarketplaceCourseCard } from '@/pages/landing/components/MarketplaceCourseCard'

function CatalogSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
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

export function CatalogPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [categoryId, setCategoryId] = useState<string | null>(
    () => searchParams.get('categoryId'),
  )

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '')
    setCategoryId(searchParams.get('categoryId'))
  }, [searchParams])

  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: courses, isLoading, isError } = useMarketplaceCourses(
    50,
    search,
    categoryId,
  )

  function updateFilters(nextSearch: string, nextCategoryId: string | null) {
    setSearch(nextSearch)
    setCategoryId(nextCategoryId)
    const params = new URLSearchParams()
    if (nextSearch.trim()) params.set('search', nextSearch.trim())
    if (nextCategoryId) params.set('categoryId', nextCategoryId)
    setSearchParams(params, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader
        courseSearch={search}
        onCourseSearchChange={(value) => updateFilters(value, categoryId)}
        catalogHref="/catalog"
        loginHref="/auth/login"
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/#courses"
          className="mb-6 inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {t('common.backToHome')}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('catalog.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('catalog.publicSubtitle')}</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('catalog.searchPlaceholder')}
              className="pl-9"
              value={search}
              onChange={(e) => updateFilters(e.target.value, categoryId)}
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilters(search, null)}
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
              onClick={() => updateFilters(search, category.id)}
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

        {isLoading && <CatalogSkeleton />}

        {isError && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('landing.marketplace.loadError')}
          </p>
        )}

        {!isLoading && !isError && courses && courses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, index) => (
              <MarketplaceCourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        )}

        {!isLoading && !isError && courses?.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('catalog.emptyTitle')}
          </p>
        )}
      </main>

      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <BrandIcon className="h-6 w-6" />
            {t('landing.brand')}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('landing.footer', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  )
}
