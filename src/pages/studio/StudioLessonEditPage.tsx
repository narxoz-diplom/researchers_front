import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileText, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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

  useEffect(() => {
    formInitializedRef.current = false
  }, [lessonId])

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
      toast.success(t('studio.lessonSaved'))
    },
    onError: () => toast.error(t('studio.lessonSaveFailed')),
  })

  const { mutate: deleteLesson } = useMutation({
    mutationFn: () => api.delete(API.lessons.delete(lessonId!)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lessons', id] })
      navigate(`/studio/courses/${id}`)
      toast.success(t('studio.lessonDeleted'))
    },
  })

  const invalidateLesson = () => void qc.invalidateQueries({ queryKey: ['lesson', lessonId] })

  const mediaFolder = `courses/${id}/lessons/${lessonId}`

  if (isLoading) return <Skeleton className="h-96 rounded-2xl mt-8" />
  if (isError || !lesson) return <ErrorState />

  return (
    <div className="pb-16">
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-4 gap-1 text-muted-foreground"
        onClick={() => navigate(`/studio/courses/${id}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.backToCourse')}
      </Button>

      <form onSubmit={handleSubmit((d) => updateLesson(d))} className="flex flex-col gap-6">
        <div>
          <Input
            {...register('title')}
            className="text-2xl font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
            placeholder={t('common.lessonTitle')}
          />
        </div>

        <div>
          <Label>{t('common.lessonContent')}</Label>
          <Textarea
            {...register('content')}
            rows={10}
            className="mt-1 resize-y font-mono text-sm"
            placeholder={t('common.lessonContentPlaceholder')}
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">{t('common.video')}</h3>
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
                        toast.success(t('studio.videoDeleted'))
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
            label={t('common.uploadVideo')}
            hint={t('common.videoHint')}
            onUploaded={async (result, file) => {
              const title = file.name.replace(/\.[^.]+$/, '') || t('studio.defaultVideoTitle')
              await api.post(API.videos.attach(lessonId!), {
                title,
                cloudinaryPublicId: result.public_id,
                url: result.secure_url,
                durationSeconds: Math.round(result.duration ?? 0),
                sizeBytes: result.bytes,
              })
              invalidateLesson()
              toast.success(t('studio.videoAttached'))
            }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">{t('common.materials')}</h3>
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
                      {(Number(m.sizeBytes) / 1024 / 1024).toFixed(2)} {t('common.mb')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() =>
                      api.delete(API.materials.delete(m.id)).then(() => {
                        invalidateLesson()
                        toast.success(t('studio.materialDeleted'))
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
            label={t('common.attachFile')}
            hint={t('common.materialHint')}
            onUploaded={async (result, file) => {
              await api.post(API.materials.attach(lessonId!), {
                title: file.name,
                cloudinaryPublicId: result.public_id,
                url: result.secure_url,
                mimeType: file.type || 'application/octet-stream',
                sizeBytes: result.bytes,
              })
              invalidateLesson()
              toast.success(t('studio.materialAttached'))
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteLesson()}
          >
            {t('common.deleteLesson')}
          </Button>
        </div>
      </form>
    </div>
  )
}
