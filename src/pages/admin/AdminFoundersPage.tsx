import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { createFounderSchema, type FounderSchema } from '@/features/founders/schemas'
import type { CreateFounderPayload, Founder } from '@/features/founders/types'

const emptyForm: FounderSchema = {
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
  const founderSchema = useMemo(() => createFounderSchema(t), [t])

  const form = useForm<FounderSchema>({
    resolver: zodResolver(founderSchema),
    defaultValues: emptyForm,
  })

  const videoUrl = form.watch('videoUrl')
  const previewUrl = form.watch('previewUrl')

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['founders'] })

  const { mutate: saveFounder, isPending: saving } = useMutation({
    mutationFn: (data: FounderSchema) => {
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
      form.reset(emptyForm)
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
    form.reset(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(founder: Founder) {
    setEditing(founder)
    form.reset({
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

  function onSubmit(values: FounderSchema) {
    saveFounder(values)
  }

  function onInvalid() {
    toast.error(t('admin.founders.validation.fixForm'))
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditing(null)
            form.reset(emptyForm)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('admin.founders.editTitle') : t('admin.founders.createTitle')}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.founders.fullName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.founders.position')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.founders.description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.founders.order')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-input"
                        />
                      </FormControl>
                      {t('admin.founders.showOnLanding')}
                    </label>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.founders.video')}</FormLabel>
                    <input type="hidden" {...field} />
                    <div className="mt-2">
                      <MediaUploader
                        resourceType="video"
                        folder="founders/videos"
                        accept="video/mp4,video/webm,.mp4,.webm"
                        maxSizeMb={100}
                        label={t('admin.founders.uploadVideo')}
                        onUploaded={(result) => {
                          form.setValue('videoUrl', result.secure_url, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                          toast.success(t('admin.founders.videoUploaded'))
                        }}
                      />
                    </div>
                    {videoUrl && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{videoUrl}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="previewUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.founders.preview')}</FormLabel>
                    <input type="hidden" {...field} />
                    <div className="mt-2">
                      <MediaUploader
                        resourceType="image"
                        folder="founders/previews"
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                        maxSizeMb={5}
                        label={t('admin.founders.uploadPreview')}
                        onUploaded={(result) => {
                          form.setValue('previewUrl', result.secure_url, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
