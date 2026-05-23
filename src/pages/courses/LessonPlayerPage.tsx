import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, Download, FileText, Lock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import ReactPlayer from 'react-player'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/shared/ui/ErrorState'
import { api, extractApiError } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { Lesson } from '@/shared/types'

interface CourseProgress {
  courseId: string
  totalLessons: number
  completedLessons: number
  percentage: number
  lastCompletedAt?: string
  lessons?: Array<{ lessonId: string; completedAt: string }>
}

export function LessonPlayerPage() {
  const { cid, lessonId } = useParams<{ cid: string; lessonId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [celebrate, setCelebrate] = useState(false)

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => api.get<Lesson>(API.lessons.byId(lessonId!)).then((r) => r.data),
    enabled: !!lessonId,
  })

  const { data: allLessons } = useQuery({
    queryKey: ['lessons', cid],
    queryFn: () => api.get<Lesson[]>(API.lessons.byCourse(cid!)).then((r) => r.data),
    enabled: !!cid,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress', cid],
    queryFn: () =>
      api
        .get<CourseProgress>(API.progress.my, { params: { courseId: cid } })
        .then((r) => r.data),
    enabled: !!cid && user?.role === 'SUBSCRIBER',
  })

  const completedIds = new Set(progress?.lessons?.map((l) => l.lessonId) ?? [])
  const isCompleted = completedIds.has(lessonId!)

  const { mutate: toggleComplete, isPending } = useMutation({
    mutationFn: () =>
      isCompleted
        ? api.delete(API.lessons.complete(lessonId!))
        : api.post(API.lessons.complete(lessonId!)),
    onSuccess: () => {
      const wasCompleted = isCompleted
      void qc.invalidateQueries({ queryKey: ['progress', cid] })
      if (wasCompleted) {
        toast.success('Отметка убрана')
      } else {
        setCelebrate(true)
        toast.success('Урок пройден!', {
          description: 'Так держать — двигайтесь к следующему',
        })
      }
    },
    onError: (err) => {
      const apiErr = extractApiError(err)
      if (apiErr?.message === 'SUBSCRIPTION_REQUIRED') {
        toast.error('Нужна активная подписка')
      } else {
        toast.error('Не удалось отметить урок')
      }
    },
  })

  useEffect(() => {
    if (!celebrate) return
    const timer = window.setTimeout(() => setCelebrate(false), 1800)
    return () => window.clearTimeout(timer)
  }, [celebrate])

  if (isLoading) return <LessonSkeleton />
  if (isError) return (
    <ErrorState message="Не удалось загрузить урок. Возможно, требуется подписка." />
  )
  if (!lesson) return null

  const currentIndex = allLessons?.findIndex((l) => l.id === lessonId) ?? -1
  const prevLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null
  const nextLesson = allLessons && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const mainVideo = lesson.videos[0]
  const showProgress = user?.role === 'SUBSCRIBER' && progress
  const courseDone = progress && progress.completedLessons >= progress.totalLessons && progress.totalLessons > 0

  return (
    <div className="pb-16">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-4 gap-1 text-muted-foreground"
        onClick={() => navigate(`/courses/${cid}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        К курсу
      </Button>

      {/* Course progress bar (subscribers only) */}
      {showProgress && progress && (
        <div className="mb-6 flex flex-col gap-2 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Прогресс курса</span>
            <span className="text-muted-foreground">
              {progress.completedLessons} из {progress.totalLessons} · {progress.percentage}%
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          {courseDone && (
            <div className="mt-1 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Курс пройден полностью!
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Video */}
          {mainVideo ? (
            <div className="overflow-hidden rounded-2xl bg-black aspect-video">
              <ReactPlayer
                src={mainVideo.url}
                width="100%"
                height="100%"
                controls
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted">
              <Lock className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Title & meta */}
          <div>
            <h1 className="text-2xl font-semibold">{lesson.title}</h1>
            {allLessons && (
              <p className="mt-1 text-sm text-muted-foreground">
                Урок {currentIndex + 1} из {allLessons.length}
              </p>
            )}
          </div>

          {/* Content */}
          {lesson.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>{lesson.content}</p>
            </div>
          )}

          {/* Materials */}
          {lesson.materials.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Материалы</h3>
              {lesson.materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(Number(m.sizeBytes) / 1024 / 1024).toFixed(2)} МБ
                    </p>
                  </div>
                  <a
                    href={m.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <Button
              variant="outline"
              disabled={!prevLesson}
              onClick={() => prevLesson && navigate(`/courses/${cid}/lessons/${prevLesson.id}`)}
            >
              ← Предыдущий
            </Button>

            {user?.role === 'SUBSCRIBER' && (
              <Button
                variant={isCompleted ? 'outline' : 'default'}
                className={
                  isCompleted
                    ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    : celebrate
                      ? 'animate-pulse bg-emerald-500 hover:bg-emerald-500 text-white'
                      : ''
                }
                disabled={isPending}
                onClick={() => toggleComplete()}
              >
                {isPending ? (
                  'Сохранение...'
                ) : isCompleted ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Пройден
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Отметить как пройденный
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              disabled={!nextLesson}
              onClick={() => nextLesson && navigate(`/courses/${cid}/lessons/${nextLesson.id}`)}
            >
              Следующий →
            </Button>
          </div>
        </div>

        {/* Sidebar — lesson list */}
        <aside className="hidden lg:flex flex-col gap-1">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Уроки курса
          </h3>
          {allLessons?.map((l, idx) => (
            <button
              key={l.id}
              onClick={() => navigate(`/courses/${cid}/lessons/${l.id}`)}
              className={`flex items-center gap-3 rounded-xl p-2.5 text-left text-sm transition-colors
                ${l.id === lessonId ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}
              `}
            >
              {l.id === lessonId && (
                <span className="absolute left-0 h-full w-0.5 bg-primary rounded-full" />
              )}
              <span className="shrink-0 text-xs text-muted-foreground w-5 text-right">{idx + 1}</span>
              <span className="truncate">{l.title}</span>
              {completedIds.has(l.id) && (
                <CheckCircle className="shrink-0 ml-auto h-4 w-4 text-emerald-500" />
              )}
            </button>
          ))}
        </aside>
      </div>
    </div>
  )
}

function LessonSkeleton() {
  return (
    <div className="pb-16">
      <Skeleton className="mt-4 mb-4 h-8 w-20" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Skeleton className="aspect-video rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="hidden lg:flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
