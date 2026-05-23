import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ImageOff, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Course, Lesson } from '@/shared/types'

interface CourseForm {
  title: string
  description: string
  coverUrl: string
  priceRub: string
}

export function StudioCourseEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get<Course>(API.courses.byId(id!)).then((r) => r.data),
    enabled: !!id,
  })

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', id],
    queryFn: () => api.get<Lesson[]>(API.lessons.byCourse(id!)).then((r) => r.data),
    enabled: !!id,
  })

  const { register, handleSubmit, reset, watch } = useForm<CourseForm>({
    defaultValues: { title: '', description: '', coverUrl: '', priceRub: '' },
  })

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description ?? '',
        coverUrl: course.coverUrl ?? '',
        priceRub: String((course.priceCents ?? 0) / 100),
      })
    }
  }, [course, reset])

  const coverPreview = watch('coverUrl')

  const { mutate: updateCourse, isPending: saving } = useMutation({
    mutationFn: (data: CourseForm) => {
      const priceRub = Number.parseFloat(data.priceRub.replace(',', '.'))
      const priceCents = Number.isFinite(priceRub) ? Math.round(priceRub * 100) : 0
      return api.patch(API.courses.update(id!), {
        title: data.title,
        description: data.description,
        coverUrl: data.coverUrl.trim() || null,
        priceCents,
      })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['course', id] })
      void qc.invalidateQueries({ queryKey: ['courses', 'mine'] })
      toast.success('Сохранено')
    },
    onError: () => toast.error('Не удалось сохранить курс'),
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: (action: 'publish' | 'archive') =>
      api.post(action === 'publish' ? API.courses.publish(id!) : API.courses.archive(id!)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['course', id] })
      toast.success('Статус обновлён')
    },
    onError: () => toast.error('Не удалось изменить статус'),
  })

  const { mutate: createLesson, isPending: creatingLesson } = useMutation({
    mutationFn: () => {
      const nextOrderNumber =
        (lessons ?? []).reduce((max, l) => Math.max(max, l.orderNumber), 0) + 1
      return api
        .post<Lesson>(API.lessons.create(id!), {
          title: 'Новый урок',
          content: '',
          orderNumber: nextOrderNumber,
        })
        .then((r) => r.data)
    },
    onSuccess: (lesson) => {
      void qc.invalidateQueries({ queryKey: ['lessons', id] })
      navigate(`/studio/courses/${id}/lessons/${lesson.id}`)
    },
    onError: () => toast.error('Не удалось создать урок'),
  })

  if (isLoading) return <Skeleton className="h-96 rounded-2xl mt-8" />
  if (isError || !course) return <ErrorState />

  return (
    <div className="pb-16">
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-4 gap-1 text-muted-foreground"
        onClick={() => navigate('/studio')}
      >
        <ArrowLeft className="h-4 w-4" />
        Studio
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left — metadata form */}
        <div className="lg:col-span-2">
          <PageHeader title="Курс" />
          <form onSubmit={handleSubmit((d) => updateCourse(d))} className="flex flex-col gap-4">
            <div>
              <Label>Название</Label>
              <Input {...register('title')} className="mt-1" />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea {...register('description')} rows={4} className="mt-1 resize-none" />
            </div>

            <div>
              <Label>Цена (₽)</Label>
              <Input
                {...register('priceRub')}
                className="mt-1"
                type="number"
                min={0}
                step="0.01"
                placeholder="4990"
              />
            </div>

            <div>
              <Label>Обложка (URL)</Label>
              <Input
                {...register('coverUrl')}
                className="mt-1"
                placeholder="https://example.com/cover.jpg"
                type="url"
              />
              <div className="mt-2 aspect-video overflow-hidden rounded-xl border bg-muted">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Обложка"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Статус</Label>
              <Select
                value={course.status}
                onValueChange={(v) =>
                  changeStatus(v === 'PUBLISHED' ? 'publish' : 'archive')
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Черновик</SelectItem>
                  <SelectItem value="PUBLISHED">Опубликован</SelectItem>
                  <SelectItem value="ARCHIVED">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </form>
        </div>

        <Separator orientation="vertical" className="hidden lg:block" />

        {/* Right — lessons list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">Уроки</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/studio/courses/${id}/enrollments`)}
              >
                Заявки студентов
              </Button>
            <Button size="sm" onClick={() => createLesson()} disabled={creatingLesson}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить урок
            </Button>
            </div>
          </div>

          {lessonsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : !lessons?.length ? (
            <p className="text-sm text-muted-foreground">Уроков пока нет</p>
          ) : (
            <div className="flex flex-col gap-1">
              {lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/studio/courses/${id}/lessons/${lesson.id}`)}
                  className="flex items-center gap-3 rounded-xl p-3 text-left hover:bg-muted transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium truncate">{lesson.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
