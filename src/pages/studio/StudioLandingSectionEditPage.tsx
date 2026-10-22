import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm, type Control, type UseFormRegister } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

type Lang = 'kk' | 'ru'

interface LangText {
  description: string
  points: { value: string }[]
}

interface SectionForm {
  kk: LangText
  ru: LangText
}

const EMPTY: LangText = { description: '', points: [{ value: '' }] }

export function StudioLandingSectionEditPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [lang, setLang] = useState<Lang>('kk')

  const validSlug = isCourseSectionCategory(slug) ? slug : null

  const { data: sections, isLoading, isError } = useQuery({
    queryKey: ['landing-sections'],
    queryFn: () =>
      api.get<LandingSectionContent[]>(API.landingSections.list).then((r) => r.data),
    enabled: !!validSlug,
  })

  const section = sections?.find((s) => s.slug === validSlug)

  const { register, control, handleSubmit, reset, watch } = useForm<SectionForm>({
    defaultValues: { kk: EMPTY, ru: EMPTY },
  })

  useEffect(() => {
    if (!validSlug) return
    // Built-in translations prefill a language that was never filled in.
    const fallback = (lng: Lang): LangText => ({
      description: t(`landing.sections.${validSlug}.description`, { lng }),
      points: (
        t(`landing.sections.${validSlug}.points`, { lng, returnObjects: true }) as string[]
      ).map((value) => ({ value })),
    })
    const fromApi = (description: string, points: string[], lng: Lang): LangText =>
      description || points.length
        ? { description, points: (points.length ? points : ['']).map((value) => ({ value })) }
        : fallback(lng)

    reset({
      kk: section ? fromApi(section.descriptionKk, section.pointsKk, 'kk') : fallback('kk'),
      ru: section ? fromApi(section.description, section.points, 'ru') : fallback('ru'),
    })
  }, [section, validSlug, reset, t])

  const preview = watch(lang)

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: SectionForm) => {
      const clean = (p: { value: string }[]) => p.map((x) => x.value.trim()).filter(Boolean)
      return api.patch(API.landingSections.update(validSlug!), {
        description: data.ru.description.trim(),
        points: clean(data.ru.points),
        descriptionKk: data.kk.description.trim(),
        pointsKk: clean(data.kk.points),
      })
    },
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

      <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)} className="mb-6">
        <TabsList>
          <TabsTrigger value="kk">{t('studio.sections.langKk')}</TabsTrigger>
          <TabsTrigger value="ru">{t('studio.sections.langRu')}</TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="-mt-3 mb-6 text-xs text-muted-foreground">
        {t('studio.sections.langHint', {
          lang: lang === 'kk' ? t('studio.sections.langKk') : t('studio.sections.langRu'),
        })}
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit(
            (data) => save(data),
            // Show the language tab that has the empty field.
            (errors) => setLang(errors.kk ? 'kk' : 'ru'),
          )}
          className="flex flex-col gap-4"
        >
          {/* Both languages stay mounted so switching tabs keeps unsaved edits. */}
          {(['kk', 'ru'] as const).map((l) => (
            <div key={l} className={cn('flex flex-col gap-4', l !== lang && 'hidden')}>
              <LanguageFields lang={l} control={control} register={register} />
            </div>
          ))}

          <Button type="submit" disabled={isPending}>
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </form>

        <div className="rounded-xl border bg-muted/20 p-5" lang={lang === 'kk' ? 'kk' : 'ru'}>
          <p className="mb-3 text-sm font-medium">
            {t('studio.sections.preview')} ·{' '}
            {lang === 'kk' ? t('studio.sections.langKk') : t('studio.sections.langRu')}
          </p>
          <TextWithLinks
            as="p"
            className="text-sm leading-relaxed text-muted-foreground"
            text={preview?.description || '—'}
          />
          <ul className="mt-4 flex flex-col gap-2">
            {preview?.points
              ?.filter((p) => p.value.trim())
              .map((point, index) => (
                <li key={`${index}-${point.value}`} className="flex items-start gap-2 text-sm">
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

function LanguageFields({
  lang,
  control,
  register,
}: {
  lang: Lang
  control: Control<SectionForm>
  register: UseFormRegister<SectionForm>
}) {
  const { t } = useTranslation()
  const { fields, append, remove } = useFieldArray({ control, name: `${lang}.points` })

  return (
    <>
      <div>
        <Label>{t('common.description')}</Label>
        <Textarea
          {...register(`${lang}.description`, { required: true })}
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
                {...register(`${lang}.points.${index}.value` as const, { required: true })}
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
    </>
  )
}
