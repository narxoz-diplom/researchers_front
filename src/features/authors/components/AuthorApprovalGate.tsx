import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, FileText, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { authorsApi } from '../api'
import {
  createAuthorApplicationSchema,
  EMPTY_AUTHOR_APPLICATION,
  type AuthorApplicationSchema,
} from '../schemas'
import type { MyAuthorApplication } from '../types'
import { AuthorOfferFields } from './AuthorOfferFields'

/**
 * Studio routes for authors: content only after an admin approved the offer.
 * The status is fetched live, so an approval shows up without signing in again.
 */
export function AuthorApprovalGate() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthor = user?.role === 'AUTHOR'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['author-application'],
    queryFn: authorsApi.mine,
    enabled: isAuthor,
    refetchOnWindowFocus: true,
  })

  // Keep the cached user in sync (navigation and course actions read it).
  useEffect(() => {
    if (user && data && user.authorStatus !== data.status) {
      setUser({ ...user, authorStatus: data.status })
    }
  }, [data, user, setUser])

  if (!isAuthor) return <Outlet />
  if (isLoading) return <Skeleton className="mt-8 h-72 rounded-2xl" />
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />
  if (data.status === 'APPROVED') return <Outlet />

  return <AuthorApplicationStatus application={data} />
}

function AuthorApplicationStatus({ application }: { application: MyAuthorApplication }) {
  const { t } = useTranslation()
  const rejected = application.status === 'REJECTED'
  const [editing, setEditing] = useState(rejected)

  return (
    <div className="pb-16">
      <PageHeader title={t('nav.studio')} subtitle={t('authorStatus.subtitle')} />

      <div className="flex max-w-2xl flex-col gap-6">
        <div
          className={
            rejected
              ? 'rounded-2xl border border-destructive/30 bg-destructive/5 p-5'
              : 'rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5'
          }
        >
          <div className="flex items-start gap-3">
            {rejected ? (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            ) : (
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            )}
            <div className="flex flex-col gap-2">
              <Badge
                variant="outline"
                className={
                  rejected
                    ? 'w-fit border-destructive/40 text-destructive'
                    : 'w-fit border-amber-500/40 text-amber-700 dark:text-amber-400'
                }
              >
                {t(`authorStatus.status.${application.status}`)}
              </Badge>
              <p className="text-sm leading-relaxed">
                {rejected ? t('authorStatus.rejectedText') : t('authorStatus.pendingText')}
              </p>
              {rejected && application.application?.reviewNote && (
                <p className="rounded-lg bg-background/60 p-3 text-sm">
                  <span className="font-medium">{t('authorStatus.adminNote')}: </span>
                  {application.application.reviewNote}
                </p>
              )}
            </div>
          </div>
        </div>

        {editing ? (
          <ResubmitForm application={application} onDone={() => setEditing(false)} />
        ) : (
          application.application && (
            <div className="rounded-2xl border p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  {t('authorStatus.submitted')}
                </p>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  {t('authorStatus.edit')}
                </Button>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-[180px_1fr]">
                {(['legalName', 'iin', 'phone', 'city'] as const).map((key) => (
                  <div key={key} className="contents">
                    <dt className="text-muted-foreground">{t(`offer.fields.${key}`)}</dt>
                    <dd className="break-words">{application.application?.[key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function ResubmitForm({
  application,
  onDone,
}: {
  application: MyAuthorApplication
  onDone: () => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const schema = useMemo(() => createAuthorApplicationSchema(t), [t])
  const current = application.application

  const form = useForm<AuthorApplicationSchema>({
    resolver: zodResolver(schema),
    defaultValues: current
      ? {
          legalName: current.legalName,
          iin: current.iin,
          phone: current.phone,
          city: current.city,
          acceptOffer: false,
        }
      : EMPTY_AUTHOR_APPLICATION,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: authorsApi.resubmit,
    onSuccess: (data) => {
      qc.setQueryData(['author-application'], data)
      toast.success(t('authorStatus.resubmitted'))
      onDone()
    },
    onError: () => toast.error(t('offer.submitInvalid')),
  })

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutate(values))}
        className="flex flex-col gap-4 rounded-2xl border p-5"
      >
        <p className="text-sm font-semibold">{t('authorStatus.formTitle')}</p>
        <AuthorOfferFields<AuthorApplicationSchema> />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? t('common.saving') : t('authorStatus.resubmit')}
          </Button>
          {application.status !== 'REJECTED' && (
            <Button type="button" variant="ghost" onClick={onDone}>
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
