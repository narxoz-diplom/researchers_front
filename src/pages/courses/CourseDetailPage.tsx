import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Lock, XCircle } from 'lucide-react'
import { BookMarkIcon, BrandIcon } from '@/shared/components/BrandIcon'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { TextWithLinks } from '@/shared/ui/TextWithLinks'
import { cn } from '@/lib/utils'
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
    // Enrollment status is changed by the author/admin elsewhere — always show the latest one.
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const { mutate: cancelEnrollment, isPending: cancelling } = useMutation({
    mutationFn: () => api.post(API.courses.enrollmentCancel(id!)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['course', id] })
      void qc.invalidateQueries({ queryKey: ['my-enrollments'] })
      toast.success(t('enrollment.cancelled'))
    },
    onError: () => {
      void qc.invalidateQueries({ queryKey: ['course', id] })
      toast.error(t('enrollment.cancelFailed'))
    },
  })

  if (isLoading) return <CourseDetailSkeleton />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!course) return null

  const isOwner = user?.id === course.author.id || user?.role === 'ADMIN'
  const isSubscriber = user?.role === 'SUBSCRIBER'
  const lessons = course.lessons
  const firstLessonId = lessons[0]?.id
  const enrollment = course.myEnrollment
  const dateLocale = getDateLocale(i18n.language)

  // Lessons are paid content: the program is visible, opening a lesson needs access.
  const canOpenLessons = course.hasAccess

  return (
    <div className="pb-12">
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-6 gap-1 text-muted-foreground"
        onClick={() => navigate('/catalog')}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.catalog')}
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
            <TextWithLinks
              as="p"
              className="text-sm text-muted-foreground leading-relaxed"
              text={course.description}
            />
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
              enrollment={enrollment}
              hasAccess={course.hasAccess}
              firstLessonId={firstLessonId}
              onCheckout={() => navigate(`/checkout?courseId=${course.id}`)}
              onStart={() => navigate(`/courses/${course.id}/lessons/${firstLessonId}`)}
              onCancel={() => {
                if (window.confirm(t('enrollment.cancelConfirm'))) cancelEnrollment()
              }}
              cancelling={cancelling}
            />
          ) : !user ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auth/login"
                state={{ from: { pathname: `/courses/${course.id}` } }}
                className={cn(buttonVariants({ variant: 'default' }), 'w-full sm:w-auto')}
              >
                {t('landing.login')}
              </Link>
              <Link
                to="/auth/register"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full sm:w-auto')}
              >
                {t('landing.start')}
              </Link>
            </div>
          ) : course.hasAccess ? (
            firstLessonId ? (
              <Button onClick={() => navigate(`/courses/${course.id}/lessons/${firstLessonId}`)}>
                {t('common.startLearning')}
              </Button>
            ) : (
              <p className="max-w-md text-sm text-muted-foreground">{t('course.noLessonsForStudent')}</p>
            )
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
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      if (!canOpenLessons) return
                      navigate(`/courses/${course.id}/lessons/${lesson.id}`)
                    }}
                    disabled={!canOpenLessons}
                    className="flex items-center gap-4 rounded-xl p-3 text-left transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                    {!canOpenLessons && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <p className="text-sm text-muted-foreground">
              <TextWithLinks
                as="p"
                className="text-sm leading-relaxed text-muted-foreground"
                text={course.description ?? t('common.noDescription')}
              />
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SubscriberActions({
  course,
  enrollment,
  hasAccess,
  firstLessonId,
  onCheckout,
  onStart,
  onCancel,
  cancelling,
}: {
  course: CourseDetail
  enrollment?: MyEnrollment | null
  hasAccess: boolean
  firstLessonId?: string
  onCheckout: () => void
  onStart: () => void
  onCancel: () => void
  cancelling: boolean
}) {
  const { t, i18n } = useTranslation()
  const price = formatPriceCents(course.priceCents, i18n.language)

  // Until access is granted the student may withdraw the request or payment.
  const cancelButton = (
    <Button
      variant="outline"
      className="w-full sm:w-auto"
      disabled={cancelling}
      onClick={onCancel}
    >
      <XCircle className="mr-1.5 h-4 w-4" />
      {t('enrollment.cancel')}
    </Button>
  )

  if (hasAccess) {
    if (!firstLessonId) {
      return (
        <p className="max-w-md rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
          {t('course.noLessonsForStudent')}
        </p>
      )
    }
    return (
      <Button className="w-full sm:w-auto" onClick={onStart}>
        {t('common.startLearning')}
      </Button>
    )
  }

  if (enrollment?.status === 'UNDERPAID') {
    const dueCents = Math.max(
      0,
      (enrollment.expectedAmountCents ?? course.priceCents) - (enrollment.paidAmountCents ?? 0),
    )
    const duePrice = formatPriceCents(dueCents, i18n.language)
    return (
      <div className="flex flex-col gap-3 max-w-md">
        <Badge variant="outline" className="w-fit gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <Lock className="h-3.5 w-3.5" />
          {t('enrollmentStatuses.UNDERPAID')}
        </Badge>
        {enrollment.adminPaymentNote && (
          <p className="text-sm text-amber-800 dark:text-amber-200 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            {enrollment.adminPaymentNote}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="w-full sm:w-auto" onClick={onCheckout}>
            {t('checkout.payAgain', { amount: duePrice })}
          </Button>
          {cancelButton}
        </div>
        <p className="text-xs text-muted-foreground">{t('checkout.payAgainHint')}</p>
      </div>
    )
  }

  if (enrollment?.status === 'CANCELLED') {
    return (
      <div className="flex flex-col gap-3 max-w-md">
        <Badge variant="outline" className="w-fit gap-1.5">
          <XCircle className="h-3.5 w-3.5" />
          {t('enrollment.cancelledBadge')}
        </Badge>
        <p className="text-xs text-muted-foreground">{t('enrollment.cancelledHint')}</p>
        <Button className="w-full sm:w-auto" onClick={onCheckout}>
          {t('common.pay', { price })}
        </Button>
        <Link to="/requests" className="text-xs text-primary hover:underline">
          {t('requests.viewHistory')}
        </Link>
      </div>
    )
  }

  if (enrollment?.status === 'REJECTED') {
    return (
      <div className="flex flex-col gap-3 max-w-md">
        <Badge variant="outline" className="w-fit gap-1.5 border-destructive/40 bg-destructive/10 text-destructive">
          <Lock className="h-3.5 w-3.5" />
          {t('enrollment.rejectedBadge')}
        </Badge>
        <p className="text-xs text-muted-foreground">{t('enrollment.rejectedHint')}</p>
        <Button className="w-full sm:w-auto" onClick={onCheckout}>
          {t('common.pay', { price })}
        </Button>
        <Link to="/requests" className="text-xs text-primary hover:underline">
          {t('requests.viewHistory')}
        </Link>
      </div>
    )
  }

  // PENDING = the request exists but no payment was submitted yet, so it must stay payable.
  if (enrollment?.status === 'PENDING') {
    return (
      <div className="flex flex-col gap-3 max-w-md">
        <Badge variant="outline" className="w-fit gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <Lock className="h-3.5 w-3.5" />
          {t('enrollment.pendingBadge')}
        </Badge>
        <p className="text-xs text-muted-foreground">{t('enrollment.pendingHint')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="w-full sm:w-auto" onClick={onCheckout}>
            {t('common.pay', { price })}
          </Button>
          {cancelButton}
        </div>
        <Link to="/requests" className="text-xs text-primary hover:underline">
          {t('requests.viewHistory')}
        </Link>
      </div>
    )
  }

  if (enrollment?.status === 'PAID') {
    return (
      <div className="flex flex-col gap-2 max-w-md">
        <Badge variant="outline" className="w-fit gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <Lock className="h-3.5 w-3.5" />
          {t('common.paidAwaitingAuthor')}
        </Badge>
        <p className="text-xs text-muted-foreground">{t('common.authorWillConfirm')}</p>
        {cancelButton}
        <Link to="/requests" className="text-xs text-primary hover:underline">
          {t('requests.viewHistory')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Button className="w-full sm:w-auto" onClick={onCheckout}>
        {t('common.pay', { price })}
      </Button>
      <p className="text-xs text-muted-foreground">{t('common.payCourseHint')}</p>
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
