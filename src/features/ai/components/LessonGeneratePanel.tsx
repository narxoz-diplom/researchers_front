import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { extractApiError } from '@/shared/api/axios'
import { showAiErrorToast, translateAiError } from '../utils/ai-errors'
import type {
  GenerateLessonContentResponse,
  LessonGenerationJobStatus,
  LessonOutputLanguage,
} from '../types'
import type { LessonVectorIndexStatus } from '@/shared/types'
import { useAiModels } from '../hooks/useAiModels'
import { useAuthorAiSettings } from '../hooks/useAuthorAiSettings'
import { useGenerateLessonContent } from '../hooks/useGenerateLessonContent'
import { useLatestLessonGenerationJob } from '../hooks/useLatestLessonGenerationJob'
import {
  getConsumedGenerationJobId,
  markGenerationJobConsumed,
} from '../utils/generation-session'
import { LessonMarkdownPreview } from './LessonMarkdownPreview'

const DEFAULT_MODEL_ID = 'gemini-2.5-flash'

type WizardStep = 'form' | 'outline-edit' | 'preview'

function createGenerateSchema(t: (key: string) => string) {
  return z.object({
    language: z.enum(['ru', 'en', 'kz']),
    brief: z
      .string()
      .trim()
      .min(3, t('ai.generate.briefMinError'))
      .max(4000, t('ai.generate.briefMaxError')),
    llmModelId: z.string().min(1, t('ai.generate.modelRequired')),
    outputFormat: z.enum(['structured', 'lecture', 'seminar', 'expert_brief']),
    targetAudience: z.enum(['school', 'bachelor', 'pro']),
    depth: z.enum(['shallow', 'medium', 'deep']),
  })
}

type GenerateFormValues = z.infer<ReturnType<typeof createGenerateSchema>>

function defaultLanguage(appLanguage: string): LessonOutputLanguage {
  if (appLanguage === 'kk') return 'kz'
  if (appLanguage === 'ru') return 'ru'
  return 'en'
}

interface LessonGeneratePanelProps {
  lessonId: string
  defaultBrief?: string
  vectorIndexStatus?: LessonVectorIndexStatus
  vectorIndexJobId?: string | null
  onInsert: (payload: { content: string; title?: string }) => void
}

export function LessonGeneratePanel({
  lessonId,
  defaultBrief,
  vectorIndexStatus,
  vectorIndexJobId,
  onInsert,
}: LessonGeneratePanelProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const schema = useMemo(() => createGenerateSchema(t), [t])
  const [open, setOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState<WizardStep>('form')
  const [preview, setPreview] = useState<GenerateLessonContentResponse | null>(null)
  const [outlineDraft, setOutlineDraft] = useState<{ title?: string; content: string } | null>(null)
  const [consumedJobId, setConsumedJobId] = useState<string | null>(() =>
    getConsumedGenerationJobId(lessonId),
  )

  const { data: latestJob } = useLatestLessonGenerationJob(lessonId)
  const { data: settings, isLoading: settingsLoading } = useAuthorAiSettings(open)
  const { data: modelsData, isLoading: modelsLoading } = useAiModels(open && !!settings?.hasApiKey)
  const { mutate: generate, isPending: generating } = useGenerateLessonContent(lessonId)

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      language: defaultLanguage(i18n.language),
      brief: defaultBrief ?? '',
      llmModelId: DEFAULT_MODEL_ID,
      outputFormat: 'lecture',
      targetAudience: 'bachelor',
      depth: 'medium',
    },
  })

  const applyJobToWizard = useCallback(
    (job: LessonGenerationJobStatus) => {
      if (job.status !== 'completed' || !job.content?.trim()) return

      if (job.outputFormat) {
        form.setValue('outputFormat', job.outputFormat as GenerateFormValues['outputFormat'])
      }

      if (job.generationPhase === 'outline') {
        setOutlineDraft({ title: job.title, content: job.content })
        setPreview(null)
        setWizardStep('outline-edit')
        return
      }

      setPreview({
        content: job.content,
        title: job.title,
        usage: job.usage,
        requestId: job.requestId,
      })
      setWizardStep('preview')
    },
    [form],
  )

  const hasRecoverableDraft =
    latestJob?.status === 'completed' &&
    latestJob.jobId !== consumedJobId &&
    !!latestJob.content?.trim()

  const isProcessingRemote = latestJob?.status === 'processing'

  function resetWizardForm() {
    form.reset({
      language: defaultLanguage(i18n.language),
      brief: defaultBrief ?? '',
      llmModelId: modelsData?.models[0]?.id ?? DEFAULT_MODEL_ID,
      outputFormat: 'lecture',
      targetAudience: 'bachelor',
      depth: 'medium',
    })
    setPreview(null)
    setOutlineDraft(null)
    setWizardStep('form')
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      if (hasRecoverableDraft && latestJob) {
        applyJobToWizard(latestJob)
      } else {
        resetWizardForm()
      }
    }
    setOpen(next)
    if (!next) {
      form.clearErrors()
    }
  }

  function runGenerate(
    values: GenerateFormValues,
    phase: 'outline' | 'content',
    approvedOutline?: string,
  ) {
    generate(
      {
        language: values.language,
        brief: values.brief,
        llmModelId: values.llmModelId,
        outputFormat: values.outputFormat,
        targetAudience: values.targetAudience,
        depth: values.depth,
        phase,
        approvedOutline: approvedOutline?.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          if (!result.content?.trim()) {
            form.setError('root', { message: t('ai.generate.emptyResult') })
            return
          }
          if (phase === 'outline') {
            setOutlineDraft({ title: result.title, content: result.content })
            setPreview(null)
            setWizardStep('outline-edit')
            return
          }
          setPreview(result)
          setWizardStep('preview')
        },
        onError: (err) => {
          const apiErr = extractApiError(err)
          const translated = translateAiError(apiErr?.message, t)
          if (translated) {
            showAiErrorToast(err, t)
            form.setError('root', { message: translated })
            return
          }
          form.setError('root', { message: apiErr?.message ?? t('ai.generate.failed') })
        },
      },
    )
  }

  function onSubmitOutline(values: GenerateFormValues) {
    runGenerate(values, 'outline')
  }

  function onSubmitFull(values: GenerateFormValues) {
    runGenerate(values, 'content')
  }

  function onExpandOutline() {
    if (!outlineDraft?.content.trim()) return
    runGenerate(form.getValues(), 'content', outlineDraft.content)
  }

  function handleInsert() {
    if (!preview?.content?.trim()) return
    onInsert({ content: preview.content, title: preview.title })
    const jobId = latestJob?.jobId
    if (jobId) {
      markGenerationJobConsumed(lessonId, jobId)
      setConsumedJobId(jobId)
    }
    setPreview(null)
    setOutlineDraft(null)
    setWizardStep('form')
    handleOpenChange(false)
  }

  const usage = preview?.usage
  const models = modelsData?.models ?? []
  const outputFormat = useWatch({ control: form.control, name: 'outputFormat' })
  const targetAudience = useWatch({ control: form.control, name: 'targetAudience' })
  const depth = useWatch({ control: form.control, name: 'depth' })
  const llmModelId = useWatch({ control: form.control, name: 'llmModelId' })

  const briefPlaceholderKey =
    outputFormat === 'expert_brief'
      ? 'ai.generate.briefPlaceholderExpert'
      : outputFormat === 'seminar'
        ? 'ai.generate.briefPlaceholderSeminar'
        : outputFormat === 'structured'
          ? 'ai.generate.briefPlaceholderStructured'
          : 'ai.generate.briefPlaceholderLecture'

  const showQualityHint =
    (targetAudience === 'pro' || depth === 'deep') &&
    llmModelId?.includes('flash-lite')

  const showRecommendPro =
    (targetAudience === 'pro' || depth === 'deep') &&
    llmModelId &&
    !llmModelId.includes('pro')

  const showForm = settings?.hasApiKey && wizardStep === 'form' && !isProcessingRemote
  const showRemoteProcessing = settings?.hasApiKey && wizardStep === 'form' && isProcessingRemote
  const showOutlineEdit = settings?.hasApiKey && wizardStep === 'outline-edit'
  const showPreview = settings?.hasApiKey && wizardStep === 'preview' && !!preview
  const showKeyCta = !settingsLoading && !settings?.hasApiKey

  const generateButtonLabel = isProcessingRemote
    ? t('ai.generate.generating')
    : hasRecoverableDraft
      ? t('ai.generate.draftReady')
      : t('ai.generate.open')

  const indexBlocking =
    vectorIndexStatus === 'INDEXING' ||
    vectorIndexStatus === 'PENDING' ||
    vectorIndexStatus === 'FAILED'
  const indexBlockMessage =
    vectorIndexStatus === 'FAILED'
      ? t('ai.index.generateBlockedFailed', { jobId: vectorIndexJobId ?? '—' })
      : vectorIndexStatus === 'INDEXING' || vectorIndexStatus === 'PENDING'
        ? t('ai.index.generateBlockedIndexing')
        : null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={indexBlocking}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        {generateButtonLabel}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('ai.generate.title')}</DialogTitle>
            <DialogDescription>{t('ai.generate.description')}</DialogDescription>
          </DialogHeader>

          {indexBlockMessage ? (
            <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
              {indexBlockMessage}
            </div>
          ) : settingsLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : showKeyCta ? (
            <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-sm">
              <p className="font-medium">{t('ai.generate.keyRequired')}</p>
              <p className="mt-2 text-muted-foreground">{t('ai.generate.keyRequiredHint')}</p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => {
                  setOpen(false)
                  void navigate('/profile?tab=ai')
                }}
              >
                {t('ai.generate.openSettings')}
              </Button>
            </div>
          ) : showRemoteProcessing ? (
            <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-sm">
              <p className="font-medium">{t('ai.generate.resumeGenerating')}</p>
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ) : showOutlineEdit ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{t('ai.generate.outlineEditHint')}</p>
              {outlineDraft?.title ? (
                <div>
                  <p className="text-xs text-muted-foreground">{t('ai.generate.previewTitle')}</p>
                  <p className="mt-1 text-sm font-medium">{outlineDraft.title}</p>
                </div>
              ) : null}
              <Textarea
                value={outlineDraft?.content ?? ''}
                onChange={(e) =>
                  setOutlineDraft((prev) =>
                    prev ? { ...prev, content: e.target.value } : { content: e.target.value },
                  )
                }
                rows={12}
                className="resize-y font-mono text-sm"
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOutlineDraft(null)
                    setWizardStep('form')
                  }}
                >
                  {t('ai.generate.backToForm')}
                </Button>
                <Button type="button" onClick={onExpandOutline} disabled={generating || isProcessingRemote}>
                  {generating || isProcessingRemote
                    ? t('ai.generate.generating')
                    : t('ai.generate.expandOutline')}
                </Button>
              </DialogFooter>
            </div>
          ) : showPreview ? (
            <div className="flex flex-col gap-4">
              {preview.title ? (
                <div>
                  <p className="text-xs text-muted-foreground">{t('ai.generate.previewTitle')}</p>
                  <p className="mt-1 text-sm font-medium">{preview.title}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('ai.generate.previewDraft')}</p>
                <div className="max-h-[min(50vh,24rem)] overflow-y-auto rounded-xl border bg-muted/20 p-4">
                  <LessonMarkdownPreview
                    content={preview.content}
                    structured={outputFormat === 'structured'}
                  />
                </div>
              </div>
              {usage ? (
                <p className="text-xs text-muted-foreground">
                  {t('ai.generate.usage', {
                    input: usage.inputTokens ?? '—',
                    output: usage.outputTokens ?? '—',
                    total: usage.totalTokens ?? '—',
                  })}
                </p>
              ) : null}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreview(null)
                    setWizardStep(outlineDraft ? 'outline-edit' : 'form')
                  }}
                >
                  {t('ai.generate.backToForm')}
                </Button>
                <Button type="button" onClick={handleInsert}>
                  {t('ai.generate.insert')}
                </Button>
              </DialogFooter>
            </div>
          ) : showForm ? (
            <Form {...form}>
              <form className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ai.generate.language')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ru">{t('ai.generate.languageRu')}</SelectItem>
                          <SelectItem value="kz">{t('ai.generate.languageKz')}</SelectItem>
                          <SelectItem value="en">{t('ai.generate.languageEn')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="outputFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ai.generate.outputFormat')}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lecture">{t('ai.generate.formatLecture')}</SelectItem>
                            <SelectItem value="expert_brief">{t('ai.generate.formatExpertBrief')}</SelectItem>
                            <SelectItem value="seminar">{t('ai.generate.formatSeminar')}</SelectItem>
                            <SelectItem value="structured">{t('ai.generate.formatStructured')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{t('ai.generate.outputFormatHint')}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ai.generate.targetAudience')}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="school">{t('ai.generate.audienceSchool')}</SelectItem>
                            <SelectItem value="bachelor">{t('ai.generate.audienceBachelor')}</SelectItem>
                            <SelectItem value="pro">{t('ai.generate.audiencePro')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ai.generate.depth')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full sm:max-w-xs">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="shallow">{t('ai.generate.depthShallow')}</SelectItem>
                          <SelectItem value="medium">{t('ai.generate.depthMedium')}</SelectItem>
                          <SelectItem value="deep">{t('ai.generate.depthDeep')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brief"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ai.generate.brief')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder={t(briefPlaceholderKey)}
                          className="resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="llmModelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ai.generate.model')}</FormLabel>
                      {modelsLoading ? (
                        <Skeleton className="h-8 w-full rounded-lg" />
                      ) : (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t('ai.generate.modelPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {models.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.label}
                                {model.recommendedForQuality
                                  ? ` (${t('ai.generate.modelRecommended')})`
                                  : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showRecommendPro ? (
                  <p className="text-xs text-muted-foreground">{t('ai.generate.modelRecommendHint')}</p>
                ) : null}

                {showQualityHint ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t('ai.generate.modelQualityHint')}
                  </p>
                ) : null}

                {form.formState.errors.root ? (
                  <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                ) : null}

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={generating || modelsLoading || isProcessingRemote}
                    onClick={form.handleSubmit(onSubmitOutline)}
                  >
                    {generating ? t('ai.generate.generating') : t('ai.generate.submitOutline')}
                  </Button>
                  <Button
                    type="button"
                    disabled={generating || modelsLoading || isProcessingRemote}
                    onClick={form.handleSubmit(onSubmitFull)}
                  >
                    {generating ? t('ai.generate.generating') : t('ai.generate.submitFull')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
