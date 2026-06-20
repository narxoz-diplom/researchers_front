import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Play, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useCoursePreview } from '@/features/courses/hooks/useCoursePreview'
import { useCartStore, type CartItem } from '@/features/cart/store/cart.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type {
  CoursePreview,
  CoursePreviewLesson,
} from '@/features/courses/types/course-preview'
import { formatPriceCents } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import { LandingHeader } from './LandingHeader'

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function CoursePreviewPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const addItem = useCartStore((s) => s.addItem)
  const hasItem = useCartStore((s) => s.hasItem)
  const [courseSearch, setCourseSearch] = useState('')

  const catalogHref = '/catalog'
  const loginHref = '/auth/login'
  const accessHref = user?.role === 'SUBSCRIBER' ? '/my-learning' : user ? '/catalog' : '/auth/register'

  const { data: preview, isLoading, isError, refetch } = useCoursePreview(id ?? null)

  function addToCart(item: CartItem, label: string) {
    const added = addItem(item)
    if (added) {
      toast.success(t('landing.marketplace.addedToCart', { title: label }))
    }
  }

  function handleAddCourse() {
    if (!preview || hasItem('course', preview.id)) return

    addToCart(
      {
        type: 'course',
        id: preview.id,
        courseId: preview.id,
        title: preview.title,
        coverUrl: preview.coverUrl,
        priceCents: preview.priceCents,
        category: preview.category ?? t('landing.marketplace.defaultCategory'),
      },
      preview.title,
    )
  }

  function handleAddLesson(lesson: CoursePreviewLesson) {
    if (!preview || lesson.priceCents == null || hasItem('lesson', lesson.id)) return

    addToCart(
      {
        type: 'lesson',
        id: lesson.id,
        courseId: preview.id,
        title: lesson.title,
        coverUrl: preview.coverUrl,
        priceCents: lesson.priceCents,
        category: preview.category ?? t('landing.marketplace.defaultCategory'),
      },
      lesson.title,
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader
        courseSearch={courseSearch}
        onCourseSearchChange={setCourseSearch}
        catalogHref={catalogHref}
        loginHref={loginHref}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/#courses"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToHome')}
        </Link>

        {isLoading && <CoursePreviewSkeleton />}
        {isError && <ErrorState onRetry={() => void refetch()} message={t('landing.marketplace.previewLoadError')} />}
        {!isLoading && !isError && preview && (
          <PreviewContent
            preview={preview}
            language={i18n.language}
            courseInCart={hasItem('course', preview.id)}
            hasItem={hasItem}
            onAddCourse={handleAddCourse}
            onAddLesson={handleAddLesson}
            accessHref={accessHref}
            t={t}
          />
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

function PreviewContent({
  preview,
  language,
  courseInCart,
  hasItem,
  onAddCourse,
  onAddLesson,
  accessHref,
  t,
}: {
  preview: CoursePreview
  language: string
  courseInCart: boolean
  hasItem: (type: CartItem['type'], id: string) => boolean
  onAddCourse: () => void
  onAddLesson: (lesson: CoursePreviewLesson) => void
  accessHref: string
  t: ReturnType<typeof useTranslation>['t']
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        {preview.previewVideo ? (
          <div className="overflow-hidden rounded-2xl border bg-black shadow-sm">
            <div className="aspect-video w-full">
              <video
                key={preview.previewVideo.url}
                src={preview.previewVideo.url}
                controls
                playsInline
                poster={preview.coverUrl}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t bg-card px-4 py-3 text-sm">
              <span className="font-medium">{preview.previewVideo.lessonTitle}</span>
              {preview.previewVideo.durationSeconds > 0 && (
                <span className="text-muted-foreground">
                  {formatDuration(preview.previewVideo.durationSeconds)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
            {preview.coverUrl ? (
              <img src={preview.coverUrl} alt={preview.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BrandIcon className="h-16 w-16 opacity-50" />
              </div>
            )}
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-6 text-sm text-white">
              {t('landing.marketplace.previewUnavailable')}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:col-span-2">
        <div>
          <Badge variant="secondary" className="mb-3">
            {preview.category ?? t('landing.marketplace.defaultCategory')}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{preview.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {preview.author.fullName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{preview.author.fullName}</span>
        </div>

        {preview.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{preview.description}</p>
        )}

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('landing.marketplace.fullCourse')}
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatPriceCents(preview.priceCents, language)}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              className="sm:flex-1"
              variant={courseInCart ? 'secondary' : 'default'}
              disabled={courseInCart}
              onClick={onAddCourse}
            >
              {courseInCart ? t('landing.marketplace.inCart') : t('landing.marketplace.addCourseToCart')}
            </Button>
            <Link
              to={accessHref}
              className={cn(buttonVariants({ variant: 'outline' }), 'sm:flex-1')}
            >
              {t('landing.marketplace.getAccess')}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold">{t('landing.marketplace.lessons')}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{t('landing.marketplace.buySeparately')}</p>
          {!preview.lessons.length ? (
            <p className="text-sm text-muted-foreground">{t('common.noLessonsInCourse')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {preview.lessons.map((lesson, index) => {
                const lessonInCart = hasItem('lesson', lesson.id)
                const canBuyLesson = lesson.locked && lesson.priceCents != null

                return (
                  <li key={lesson.id} className="rounded-xl border bg-background p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{lesson.title}</span>
                          {lesson.priceCents != null && lesson.priceCents > 0 && (
                            <span className="text-sm font-semibold text-primary">
                              {formatPriceCents(lesson.priceCents, language)}
                            </span>
                          )}
                          {!lesson.locked && (
                            <Badge variant="outline" className="text-primary">
                              {t('landing.marketplace.previewFree')}
                            </Badge>
                          )}
                        </div>

                        {canBuyLesson && (
                          <Button
                            size="sm"
                            variant={lessonInCart ? 'secondary' : 'outline'}
                            disabled={lessonInCart}
                            onClick={() => onAddLesson(lesson)}
                            className="mt-2 h-8 gap-1.5"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {lessonInCart
                              ? t('landing.marketplace.inCart')
                              : t('landing.marketplace.addLessonToCart')}
                          </Button>
                        )}

                        {(lesson.videos ?? []).length > 0 && (
                          <ul className="mt-3 space-y-2 border-t pt-3">
                            {(lesson.videos ?? []).map((video) => (
                              <li
                                key={video.id}
                                className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
                              >
                                <Play className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{video.title}</span>
                                <span className="text-xs">
                                  {formatDuration(video.durationSeconds)}
                                </span>
                                {!video.locked && (
                                  <span className="text-xs text-primary">
                                    {t('landing.marketplace.previewFree')}
                                  </span>
                                )}
                                {video.locked && (
                                  <span className="flex items-center gap-1 text-xs">
                                    <Lock className="h-3 w-3" />
                                    {t('landing.marketplace.locked')}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function CoursePreviewSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Skeleton className="aspect-video rounded-2xl lg:col-span-3" />
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  )
}
