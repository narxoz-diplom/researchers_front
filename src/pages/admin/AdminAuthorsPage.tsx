import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { authorsApi } from '@/features/authors/api'
import type { AdminAuthor } from '@/features/authors/types'
import { getDateLocale } from '@/lib/date-locale'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import type { AuthorStatus } from '@/shared/types'

const FILTERS: (AuthorStatus | 'ALL')[] = ['ALL', 'APPROVED', 'PENDING', 'REJECTED']

const STATUS_STYLES: Record<AuthorStatus, string> = {
  PENDING: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  APPROVED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  REJECTED: 'border-destructive/40 bg-destructive/10 text-destructive',
}

export function AdminAuthorsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  // Authors are active from signup; the page is a directory, so it opens on everyone.
  const [filter, setFilter] = useState<AuthorStatus | 'ALL'>('ALL')
  const [rejecting, setRejecting] = useState<AdminAuthor | null>(null)
  const [note, setNote] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'authors', filter],
    queryFn: () => authorsApi.adminList(filter === 'ALL' ? undefined : filter),
  })

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'authors'] })

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (author: AdminAuthor) => authorsApi.approve(author.id),
    onSuccess: () => {
      invalidate()
      toast.success(t('admin.authors.approved'))
    },
    onError: () => {
      invalidate()
      toast.error(t('admin.authors.actionFailed'))
    },
  })

  const { mutate: reject, isPending: rejectingNow } = useMutation({
    mutationFn: ({ author, note }: { author: AdminAuthor; note: string }) =>
      authorsApi.reject(author.id, note),
    onSuccess: () => {
      invalidate()
      setRejecting(null)
      setNote('')
      toast.success(t('admin.authors.rejected'))
    },
    onError: () => {
      invalidate()
      toast.error(t('admin.authors.actionFailed'))
    },
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-12">
      <PageHeader title={t('admin.authors.title')} subtitle={t('admin.authors.subtitle')} />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? t('admin.authors.filterAll') : t(`authorStatus.status.${f}`)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : !data?.length ? (
        <EmptyState title={t('admin.authors.empty')} />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((author) => (
            <AuthorCard
              key={author.id}
              author={author}
              busy={approving || rejectingNow}
              onApprove={() => approve(author)}
              onReject={() => {
                setRejecting(author)
                setNote('')
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {rejecting?.status === 'APPROVED'
                ? t('admin.authors.revokeTitle')
                : t('admin.authors.rejectTitle')}
            </DialogTitle>
          </DialogHeader>
          {rejecting && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {rejecting.fullName} · {rejecting.email}
              </p>
              <div className="space-y-2">
                <Label>{t('admin.authors.noteLabel')}</Label>
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('admin.authors.notePlaceholder')}
                />
                <p className="text-xs text-muted-foreground">{t('admin.authors.noteHint')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={rejectingNow || note.trim().length < 3}
              onClick={() => rejecting && reject({ author: rejecting, note: note.trim() })}
            >
              {rejecting?.status === 'APPROVED' ? t('admin.authors.revoke') : t('common.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AuthorCard({
  author,
  busy,
  onApprove,
  onReject,
}: {
  author: AdminAuthor
  busy: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(author.status === 'PENDING')
  const app = author.application
  const dateLocale = getDateLocale(i18n.language)

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{author.fullName}</p>
            <Badge variant="outline" className={cn('w-fit', STATUS_STYLES[author.status])}>
              {t(`authorStatus.status.${author.status}`)}
            </Badge>
            {!author.emailVerified && (
              <Badge variant="outline" className="w-fit text-muted-foreground">
                {t('admin.authors.emailNotVerified')}
              </Badge>
            )}
          </div>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {author.email} · {format(new Date(author.createdAt), 'd MMM yyyy', { locale: dateLocale })}
            {' · '}
            {t('admin.authors.courses', { count: author.coursesCount })}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {author.status !== 'APPROVED' && (
            <Button size="sm" disabled={busy || !app} onClick={onApprove}>
              <Check className="mr-1 h-4 w-4" />
              {t('admin.authors.approve')}
            </Button>
          )}
          {author.status !== 'REJECTED' && (
            <Button size="sm" variant="outline" disabled={busy} onClick={onReject}>
              <X className="mr-1 h-4 w-4" />
              {author.status === 'APPROVED' ? t('admin.authors.revoke') : t('common.reject')}
            </Button>
          )}
          {app && (
            <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">{t('admin.authors.toggleOffer')}</span>
            </Button>
          )}
        </div>
      </div>

      {!app && <p className="mt-3 text-sm text-muted-foreground">{t('admin.authors.noOffer')}</p>}

      {app && open && (
        <div className="mt-4 grid gap-4 border-t pt-4 lg:grid-cols-2">
          <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[150px_1fr]">
            {(['legalName', 'iin', 'phone', 'city'] as const).map((key) => (
              <div key={key} className="contents">
                <dt className="text-muted-foreground">{t(`offer.fields.${key}`)}</dt>
                <dd className="break-words font-medium">{app[key]}</dd>
              </div>
            ))}
            <dt className="text-muted-foreground">{t('admin.authors.offerAccepted')}</dt>
            <dd>
              {format(new Date(app.acceptedAt), 'd MMM yyyy, HH:mm', { locale: dateLocale })} · v
              {app.offerVersion}
            </dd>
          </dl>
          <div className="text-sm">
            {app.reviewNote && (
              <p className="mt-3 rounded-lg bg-muted/50 p-3">
                <span className="font-medium">{t('authorStatus.adminNote')}: </span>
                {app.reviewNote}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
