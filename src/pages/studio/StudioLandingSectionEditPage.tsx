import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { TextWithLinks } from '@/shared/ui/TextWithLinks'
import { cn } from '@/lib/utils'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import {
  COURSE_SECTION_CATEGORIES,
  isCourseSectionCategory,
} from '@/features/courses/course-categories'
import type { LandingSectionContent } from '@/features/landing-sections/hooks/useLandingSections'

interface SectionForm {
  description: string
  points: { value: string }[]
}

export function StudioLandingSectionEditPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const validSlug = isCourseSectionCategory(slug) ? slug : null

  const { data: sections, isLoading, isError } = useQuery({
    queryKey: ['landing-sections'],
    queryFn: () =>
      api.get<LandingSectionContent[]>(API.landingSections.list).then((r) => r.data),
    enabled: !!validSlug,
  })

  const section = sections?.find((s) => s.slug === validSlug)

  const { register, control, handleSubmit, reset, watch } = useForm<SectionForm>({
    defaultValues: { description: '', points: [{ value: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'points' })

  useEffect(() => {
    if (!validSlug) return

    const fallbackPoints = t(`landing.sections.${validSlug}.points`, {
      returnObjects: true,
    }) as string[]

    reset({
      description: section?.description ?? t(`landing.sections.${validSlug}.description`),
      points: (section?.points ?? fallbackPoints).map((value) => ({ value })),
    })
  }, [section, validSlug, reset, t])

  const descriptionPreview = watch('description')
  const pointsPreview = watch('points')

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: SectionForm) =>
      api.patch(API.landingSections.update(validSlug!), {
        description: data.description.trim(),
        points: data.points.map((p) => p.value.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['landing-sections'] })
      toast.success(t('studio.sections.saved'))
      navigate('/studio/sections')
    },
    onError: () => toast.error(t('studio.sections.saveFailed')),
  })

  if (!validSlug || !COURSE_SECTION_CATEGORIES.includes(validSlug)) {
    return <ErrorState />
  }

  if (isLoading) return <Skeleton className="mt-8 h-96 rounded-2xl" />
  if (isError) return <ErrorState />

  return (
    <div className="pb-16">
      <Link
        to="/studio/sections"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'mt-4 mb-4 inline-flex gap-1 text-muted-foreground',
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('studio.sections.title')}
      </Link>

      <PageHeader title={t(`landing.nav.${validSlug}`)} subtitle={t('studio.sections.editSubtitle')} />

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit((data) => save(data))}
          className="flex flex-col gap-4"
        >
          <div>
            <Label>{t('common.description')}</Label>
            <Textarea
              {...register('description', { required: true })}
              rows={5}
              className="mt-1 resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t('studio.sections.linkHint')}</p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>{t('studio.sections.points')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: '' })}
                disabled={fields.length >= 10}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('studio.sections.addPoint')}
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`points.${index}.value` as const, { required: true })}
                    placeholder={t('studio.sections.pointPlaceholder')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </form>

        <div className="rounded-xl border bg-muted/20 p-5">
          <p className="mb-3 text-sm font-medium">{t('studio.sections.preview')}</p>
          <TextWithLinks
            as="p"
            className="text-sm leading-relaxed text-muted-foreground"
            text={descriptionPreview || '—'}
          />
          <ul className="mt-4 flex flex-col gap-2">
            {pointsPreview
              ?.filter((p) => p.value.trim())
              .map((point) => (
                <li key={point.value} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <TextWithLinks text={point.value} />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
