import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Lock } from 'lucide-react'
import { BookMarkIcon, BrandIcon } from '@/shared/components/BrandIcon'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ErrorState } from '@/shared/ui/ErrorState'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { formatPriceCents } from '@/lib/format-price'
import { getDateLocale } from '@/lib/date-locale'
import type { Course, LessonSummary, MyEnrollment } from '@/shared/types'

interface CourseDetail extends Course {
  hasAccess: boolean
  myEnrollment?: MyEnrollment | null
  lessons: LessonSummary[]
}

export function CourseDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const { data: course, isLoading, isError, refetch } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get<CourseDetail>(API.courses.byId(id!)).then((r) => r.data),
    enabled: !!id,
  })

  const { mutate: purchaseEnrollment, isPending: purchasing } = useMutation({
    mutationFn: () => api.post<MyEnrollment>(API.courses.enrollmentPurchase(id!)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['course', id] })
      void qc.invalidateQueries({ queryKey: ['library', 'mine'] })
      toast.success(t('course.paymentAccepted'))
    },
    onError: () => toast.error(t('course.purchaseFailed')),
  })

  if (isLoading) return <CourseDetailSkeleton />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!course) return null

  const isOwner = user?.id === course.author.id || user?.role === 'ADMIN'
  const isSubscriber = user?.role === 'SUBSCRIBER'
  const lessons = course.lessons
  const firstLessonId = lessons[0]?.id
  const dateLocale = getDateLocale(i18n.language)

  return (
    <div className="pb-12">
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-6 gap-1 text-muted-foreground"
        onClick={() => navigate(user?.role === 'SUBSCRIBER' ? '/my-learning' : '/catalog')}
      >
        <ArrowLeft className="h-4 w-4" />
        {t(user?.role === 'SUBSCRIBER' ? 'nav.myLearning' : 'common.catalog')}
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
            {course.coverUrl ? (
              <img src={course.coverUrl} alt={course.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BrandIcon className="h-16 w-16 opacity-50" />
              </div>
            )}
            {isOwner && (
              <div className="absolute top-3 left-3">
                <StatusBadge status={course.status} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{course.title}</h1>

          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {course.author.fullName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{course.author.fullName}</span>
          </div>

          {course.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <BookMarkIcon className="h-3 w-3" />
              {t('common.lessonsCount', { count: course.lessonsCount })}
            </Badge>
            <Badge variant="outline">{formatPriceCents(course.priceCents, i18n.language)}</Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(course.createdAt), 'd MMMM yyyy', { locale: dateLocale })}
            </span>
          </div>

          {isOwner ? (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => navigate(`/studio/courses/${course.id}`)}>
                {t('common.edit')}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/studio/courses/${course.id}/enrollments`)}>
                {t('common.studentEnrollments')}
              </Button>
            </div>
          ) : isSubscriber ? (
            <SubscriberActions
              course={course}
              hasAccess={course.hasAccess}
              firstLessonId={firstLessonId}
              onPurchase={() => purchaseEnrollment()}
              onStart={() => navigate(`/courses/${course.id}/lessons/${firstLessonId}`)}
              purchasing={purchasing}
            />
          ) : course.hasAccess ? (
            <Button
              onClick={() => navigate(`/courses/${course.id}/lessons/${firstLessonId}`)}
              disabled={!firstLessonId}
            >
              {t('common.startLearning')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-10">
        <Tabs defaultValue="lessons">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="lessons" className="flex-1 sm:flex-none">
              {t('common.lessons')}
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">
              {t('common.overview')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-4">
            {!lessons.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t('common.noLessonsInCourse')}</p>
            ) : (
              <div className="flex flex-col gap-1">
                {lessons.map((lesson, index) => {
                  const isPreviewLesson = !course.hasAccess && index === 0
                  const isLocked = lesson.locked ?? (!course.hasAccess && index > 0)

                  return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      if (isLocked) return
                      navigate(`/courses/${course.id}/lessons/${lesson.id}`)
                    }}
                    disabled={isLocked}
                    className="flex items-center gap-4 rounded-xl p-3 text-left transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                    {isPreviewLesson && (
                      <span className="text-xs font-medium text-primary">{t('course.preview')}</span>
                    )}
                    {isLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <p className="text-sm text-muted-foreground">
              {course.description ?? t('common.noDescription')}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SubscriberActions({
  course,
  hasAccess,
  firstLessonId,
  onPurchase,
  onStart,
  purchasing,
}: {
  course: CourseDetail
  hasAccess: boolean
  firstLessonId?: string
  onPurchase: () => void
  onStart: () => void
  purchasing: boolean
}) {
  const { t, i18n } = useTranslation()
  const price = formatPriceCents(course.priceCents, i18n.language)

  if (hasAccess) {
    return (
      <Button className="w-full sm:w-auto" onClick={onStart} disabled={!firstLessonId}>
        {t('common.startLearning')}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Button className="w-full sm:w-auto" onClick={onPurchase} disabled={purchasing}>
        {purchasing ? t('common.processing') : t('common.pay', { price })}
      </Button>
      <p className="text-xs text-muted-foreground">{t('common.instantAccessHint')}</p>
    </div>
  )
}

function CourseDetailSkeleton() {
  return (
    <div className="pb-12">
      <Skeleton className="mt-4 mb-6 h-8 w-24" />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Skeleton className="aspect-video rounded-2xl" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  )
}
