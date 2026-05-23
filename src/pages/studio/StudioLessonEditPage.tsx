import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ErrorState } from '@/shared/ui/ErrorState'
import { MediaUploader } from '@/shared/ui/MediaUploader'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Lesson } from '@/shared/types'

interface LessonForm {
  title: string
  content: string
}

export function StudioLessonEditPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => api.get<Lesson>(API.lessons.byId(lessonId!)).then((r) => r.data),
    enabled: !!lessonId,
  })

  const { register, handleSubmit, reset } = useForm<LessonForm>({
    defaultValues: { title: '', content: '' },
  })
  const formInitializedRef = useRef(false)

  // Allow re-initialization when navigating to another lesson
  useEffect(() => {
    formInitializedRef.current = false
  }, [lessonId])

  // Initialize form once per lesson — do NOT reset on every React Query refetch
  useEffect(() => {
    if (!lesson || lesson.id !== lessonId || formInitializedRef.current) return
    formInitializedRef.current = true
    reset({ title: lesson.title, content: lesson.content ?? '' })
  }, [lesson, lessonId, reset])

  const { mutate: updateLesson, isPending: saving } = useMutation({
    mutationFn: (data: LessonForm) => api.patch(API.lessons.update(lessonId!), data),
    onSuccess: (_data, variables) => {
      reset(variables)
      void qc.invalidateQueries({ queryKey: ['lessons', id] })
      toast.success('Урок сохранён')
    },
    onError: () => toast.error('Не удалось сохранить урок'),
  })

  const { mutate: deleteLesson } = useMutation({
    mutationFn: () => api.delete(API.lessons.delete(lessonId!)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lessons', id] })
      navigate(`/studio/courses/${id}`)
      toast.success('Урок удалён')
    },
  })

  const invalidateLesson = () => void qc.invalidateQueries({ queryKey: ['lesson', lessonId] })

  const mediaFolder = `courses/${id}/lessons/${lessonId}`

  if (isLoading) return <Skeleton className="h-96 rounded-2xl mt-8" />
  if (isError || !lesson) return <ErrorState />

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-4 gap-1 text-muted-foreground"
        onClick={() => navigate(`/studio/courses/${id}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        К курсу
      </Button>

      <form onSubmit={handleSubmit((d) => updateLesson(d))} className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <Input
            {...register('title')}
            className="text-2xl font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
            placeholder="Название урока"
          />
        </div>

        {/* Content */}
        <div>
          <Label>Текст урока</Label>
          <Textarea
            {...register('content')}
            rows={10}
            className="mt-1 resize-y font-mono text-sm"
            placeholder="Напишите содержимое урока в Markdown..."
          />
        </div>

        <Separator />

        {/* Videos */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Видео</h3>
          {lesson.videos.length > 0 && (
            <div className="flex flex-col gap-2">
              {lesson.videos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-black">
                    <video
                      src={v.url}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.title}</p>
                    {v.durationSeconds > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(v.durationSeconds / 60)}:
                        {String(v.durationSeconds % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() =>
                      api.delete(API.videos.delete(v.id)).then(() => {
                        invalidateLesson()
                        toast.success('Видео удалено')
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <MediaUploader
            resourceType="video"
            folder={`${mediaFolder}/videos`}
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
            maxSizeMb={500}
            label="Загрузить видео"
            hint="MP4, MOV, WebM — до 500 МБ"
            onUploaded={async (result, file) => {
              const title = file.name.replace(/\.[^.]+$/, '') || 'Видео'
              await api.post(API.videos.attach(lessonId!), {
                title,
                cloudinaryPublicId: result.public_id,
                url: result.secure_url,
                durationSeconds: Math.round(result.duration ?? 0),
                sizeBytes: result.bytes,
              })
              invalidateLesson()
              toast.success('Видео прикреплено')
            }}
          />
        </div>

        {/* Materials */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Материалы</h3>
          {lesson.materials.length > 0 && (
            <div className="flex flex-col gap-2">
              {lesson.materials.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(Number(m.sizeBytes) / 1024 / 1024).toFixed(2)} МБ
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() =>
                      api.delete(API.materials.delete(m.id)).then(() => {
                        invalidateLesson()
                        toast.success('Материал удалён')
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <MediaUploader
            resourceType="raw"
            folder={`${mediaFolder}/materials`}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxSizeMb={50}
            label="Прикрепить файл"
            hint="PDF, DOC, DOCX — до 50 МБ"
            onUploaded={async (result, file) => {
              await api.post(API.materials.attach(lessonId!), {
                title: file.name,
                cloudinaryPublicId: result.public_id,
                url: result.secure_url,
                mimeType: file.type || 'application/octet-stream',
                sizeBytes: result.bytes,
              })
              invalidateLesson()
              toast.success('Материал прикреплён')
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteLesson()}
          >
            Удалить урок
          </Button>
        </div>
      </form>
    </div>
  )
}
