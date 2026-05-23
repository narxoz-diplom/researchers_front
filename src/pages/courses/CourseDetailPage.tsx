import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
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
import type { Course, Lesson } from '@/shared/types'

interface CourseDetail extends Course {
  lessons: Lesson[]
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: course, isLoading, isError, refetch } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get<CourseDetail>(API.courses.byId(id!)).then((r) => r.data),
    enabled: !!id,
  })

  const { data: lessons } = useQuery({
    queryKey: ['lessons', id],
    queryFn: () =>
      api.get<Lesson[]>(API.lessons.byCourse(id!)).then((r) => r.data),
    enabled: !!id,
  })

  if (isLoading) return <CourseDetailSkeleton />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!course) return null

  const isOwner = user?.id === course.author.id || user?.role === 'ADMIN'

  return (
    <div className="pb-12">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-6 gap-1 text-muted-foreground"
        onClick={() => navigate('/catalog')}
      >
        <ArrowLeft className="h-4 w-4" />
        Каталог
      </Button>

      {/* Hero */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Cover */}
        <div className="relative lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
            {course.coverUrl ? (
              <img src={course.coverUrl} alt={course.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            {isOwner && (
              <div className="absolute top-3 left-3">
                <StatusBadge status={course.status} />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>

          {/* Author */}
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

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {course.lessonsCount} уроков
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(course.createdAt), 'd MMMM yyyy', { locale: ru })}
            </span>
          </div>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => navigate(`/studio/courses/${course.id}`)}>
                Редактировать
              </Button>
            </div>
          ) : user?.role === 'SUBSCRIBER' ? (
            <Button
              onClick={() => navigate(`/courses/${course.id}/lessons/${(lessons ?? [])[0]?.id}`)}
              disabled={!lessons?.length}
            >
              Начать обучение
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="lessons">
          <TabsList>
            <TabsTrigger value="lessons">Уроки</TabsTrigger>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-4">
            {!lessons?.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">В курсе пока нет уроков</p>
            ) : (
              <div className="flex flex-col gap-1">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => navigate(`/courses/${course.id}/lessons/${lesson.id}`)}
                    className="flex items-center gap-4 rounded-xl p-3 text-left hover:bg-muted transition-colors"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                    {user?.role === 'SUBSCRIBER' && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <p className="text-sm text-muted-foreground">
              {course.description ?? 'Описание не добавлено.'}
            </p>
          </TabsContent>
        </Tabs>
      </div>
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
