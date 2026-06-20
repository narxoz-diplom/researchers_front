import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { MediaUploader } from '@/shared/ui/MediaUploader'
import { foundersApi } from '@/features/founders/api'
import { useAdminFounders } from '@/features/founders/hooks/useFounders'
import type { CreateFounderPayload, Founder } from '@/features/founders/types'

interface FounderForm extends CreateFounderPayload {
  orderNumber: number
  isPublished: boolean
}

const emptyForm: FounderForm = {
  fullName: '',
  position: '',
  description: '',
  videoUrl: '',
  previewUrl: '',
  orderNumber: 0,
  isPublished: true,
}

export function AdminFoundersPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: founders, isLoading, isError, refetch } = useAdminFounders()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Founder | null>(null)

  const { register, handleSubmit, reset, setValue, watch } = useForm<FounderForm>({
    defaultValues: emptyForm,
  })

  const videoUrl = watch('videoUrl')
  const previewUrl = watch('previewUrl')
  const isPublished = watch('isPublished')

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['founders'] })

  const { mutate: saveFounder, isPending: saving } = useMutation({
    mutationFn: (data: FounderForm) => {
      const payload: CreateFounderPayload = {
        fullName: data.fullName.trim(),
        position: data.position.trim(),
        description: data.description.trim(),
        videoUrl: data.videoUrl.trim(),
        previewUrl: data.previewUrl?.trim() || null,
        orderNumber: Number(data.orderNumber) || 0,
        isPublished: data.isPublished,
      }
      return editing
        ? foundersApi.update(editing.id, payload)
        : foundersApi.create(payload)
    },
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
      reset(emptyForm)
      toast.success(t('admin.founders.saved'))
    },
    onError: () => toast.error(t('admin.founders.saveFailed')),
  })

  const { mutate: removeFounder } = useMutation({
    mutationFn: (id: string) => foundersApi.delete(id),
    onSuccess: () => {
      invalidate()
      toast.success(t('admin.founders.deleted'))
    },
    onError: () => toast.error(t('admin.founders.deleteFailed')),
  })

  function openCreate() {
    setEditing(null)
    reset(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(founder: Founder) {
    setEditing(founder)
    reset({
      fullName: founder.fullName,
      position: founder.position,
      description: founder.description,
      videoUrl: founder.videoUrl,
      previewUrl: founder.previewUrl ?? '',
      orderNumber: founder.orderNumber,
      isPublished: founder.isPublished,
    })
    setDialogOpen(true)
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-12">
      <PageHeader
        title={t('admin.founders.title')}
        subtitle={t('admin.founders.subtitle')}
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('admin.founders.add')}
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !founders?.length ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('admin.founders.empty')}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {founders.map((founder) => (
            <div
              key={founder.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                {founder.previewUrl ? (
                  <img src={founder.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{founder.fullName}</p>
                <p className="text-sm text-primary">{founder.position}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {founder.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {founder.isPublished ? t('admin.founders.published') : t('admin.founders.hidden')}
                  {' · '}
                  #{founder.orderNumber}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(founder)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeFounder(founder.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('admin.founders.editTitle') : t('admin.founders.createTitle')}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((data) => saveFounder(data))}
            className="flex flex-col gap-4"
          >
            <div>
              <Label>{t('admin.founders.fullName')}</Label>
              <Input {...register('fullName', { required: true })} className="mt-1" />
            </div>
            <div>
              <Label>{t('admin.founders.position')}</Label>
              <Input {...register('position', { required: true })} className="mt-1" />
            </div>
            <div>
              <Label>{t('admin.founders.description')}</Label>
              <Textarea {...register('description', { required: true })} rows={4} className="mt-1" />
            </div>
            <div>
              <Label>{t('admin.founders.order')}</Label>
              <Input
                {...register('orderNumber', { valueAsNumber: true })}
                type="number"
                min={0}
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setValue('isPublished', e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              {t('admin.founders.showOnLanding')}
            </label>

            <div>
              <Label>{t('admin.founders.video')}</Label>
              <input type="hidden" {...register('videoUrl', { required: true })} />
              <div className="mt-2">
                <MediaUploader
                  resourceType="video"
                  folder="founders/videos"
                  accept="video/mp4,video/webm,.mp4,.webm"
                  maxSizeMb={100}
                  label={t('admin.founders.uploadVideo')}
                  onUploaded={(result) => {
                    setValue('videoUrl', result.secure_url, { shouldDirty: true })
                    toast.success(t('admin.founders.videoUploaded'))
                  }}
                />
              </div>
              {videoUrl && (
                <p className="mt-1 truncate text-xs text-muted-foreground">{videoUrl}</p>
              )}
            </div>

            <div>
              <Label>{t('admin.founders.preview')}</Label>
              <input type="hidden" {...register('previewUrl')} />
              <div className="mt-2">
                <MediaUploader
                  resourceType="image"
                  folder="founders/previews"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  maxSizeMb={5}
                  label={t('admin.founders.uploadPreview')}
                  onUploaded={(result) => {
                    setValue('previewUrl', result.secure_url, { shouldDirty: true })
                    toast.success(t('admin.founders.previewUploaded'))
                  }}
                />
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt=""
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
