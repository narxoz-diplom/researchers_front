import { Fragment, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown, ChevronUp, MessageSquareWarning, Pencil, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdjustAmountDialog, type AdjustAmountTarget } from '@/features/enrollments/components/AdjustAmountDialog'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { formatPriceCents } from '@/lib/format-price'
import { getDateLocale } from '@/lib/date-locale'
import { cn } from '@/lib/utils'
import type {
  AdminEnrollment,
  AdminEnrollmentStats,
  CourseEnrollmentStatus,
  EnrollmentEvent,
  Meta,
  User,
} from '@/shared/types'

type Filter = CourseEnrollmentStatus | 'ALL'

// Order of the tabs: what needs the admin's attention first, history last.
const FILTERS: Filter[] = ['PAID', 'UNDERPAID', 'PENDING', 'APPROVED', 'CANCELLED', 'REJECTED', 'ALL']

const STATUS_CLASS: Record<CourseEnrollmentStatus, string> = {
  PENDING: 'bg-muted text-foreground',
  PAID: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  UNDERPAID: 'bg-orange-500/15 text-orange-800 dark:text-orange-300',
  APPROVED: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  REJECTED: 'bg-destructive/10 text-destructive',
  CANCELLED: 'bg-muted text-muted-foreground',
}

const PAGE_SIZE = 20

export function AdminPaymentsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const dateLocale = getDateLocale(i18n.language)
  const [filter, setFilter] = useState<Filter>('PAID')
  const [search, setSearch] = useState('')
  const [authorId, setAuthorId] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [moreDialog, setMoreDialog] = useState<AdminEnrollment | null>(null)
  const [moreNote, setMoreNote] = useState('')
  const [adjustTarget, setAdjustTarget] = useState<AdjustAmountTarget | null>(null)

  // Shared by the list and the stats, so the numbers describe what is on screen.
  const scope = {
    search: search.trim() || undefined,
    authorId: authorId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }
  const hasScope = !!(scope.search || scope.authorId || scope.dateFrom || scope.dateTo)

  const money = (cents: number) => formatPriceCents(cents, i18n.language)
  const when = (iso: string) => format(new Date(iso), 'd MMM yyyy HH:mm', { locale: dateLocale })

  const { data: authors } = useQuery({
    queryKey: ['admin', 'authors-for-filter'],
    queryFn: () =>
      api
        .get<{ data: User[] }>(API.users.list, { params: { role: 'AUTHOR', pageSize: 100 } })
        .then((r) => r.data.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['admin', 'enrollments', 'stats', scope],
    queryFn: () =>
      api.get<AdminEnrollmentStats>(API.adminEnrollments.stats, { params: scope }).then((r) => r.data),
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'enrollments', filter, scope, page],
    queryFn: () =>
      api
        .get<{ data: AdminEnrollment[]; meta: Meta }>(API.adminEnrollments.list, {
          params: {
            status: filter === 'ALL' ? undefined : filter,
            ...scope,
            page,
            pageSize: PAGE_SIZE,
          },
        })
        .then((r) => r.data),
  })

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['admin', 'enrollments'] })
    void qc.invalidateQueries({ queryKey: ['admin', 'payments'] })
  }

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (row: AdminEnrollment) =>
      api.post(API.courses.enrollmentApprove(row.courseId, row.id)),
    onSuccess: () => {
      invalidate()
      toast.success(t('admin.payments.approved'))
    },
    onError: () => {
      invalidate()
      toast.error(t('admin.payments.approveFailed'))
    },
  })

  const { mutate: reject } = useMutation({
    mutationFn: (row: AdminEnrollment) =>
      api.post(API.courses.enrollmentReject(row.courseId, row.id)),
    onSuccess: () => {
      invalidate()
      toast.success(t('admin.payments.rejected'))
    },
    onError: () => {
      invalidate()
      toast.error(t('admin.payments.rejectFailed'))
    },
  })

  const { mutate: requestMore, isPending: requestingMore } = useMutation({
    mutationFn: ({ row, note }: { row: AdminEnrollment; note: string }) =>
      api.post(API.courses.enrollmentRequestMore(row.courseId, row.id), { note }),
    onSuccess: () => {
      invalidate()
      setMoreDialog(null)
      setMoreNote('')
      toast.success(t('admin.payments.moreRequested'))
    },
    onError: () => {
      invalidate()
      toast.error(t('admin.payments.moreRequestFailed'))
    },
  })

  function selectFilter(next: Filter) {
    setFilter(next)
    setPage(1)
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function countFor(f: Filter): number | undefined {
    if (!stats) return undefined
    if (f === 'ALL') return Object.values(stats.counts).reduce((a, b) => a + b, 0)
    return stats.counts[f]
  }

  function renderStatus(status: CourseEnrollmentStatus) {
    return (
      <Badge variant="secondary" className={STATUS_CLASS[status]}>
        {t(`enrollmentStatuses.${status}`)}
      </Badge>
    )
  }

  function renderPayment(row: AdminEnrollment) {
    if (row.paidAmountCents == null) {
      return <span className="text-xs text-muted-foreground">{t('admin.payments.noPaymentYet')}</span>
    }
    const expected = row.expectedAmountCents ?? row.course.priceCents
    const overpaid = row.paidAmountCents - expected
    return (
      <div>
        <div className="text-sm font-medium">{money(row.paidAmountCents)}</div>
        <div className="text-xs text-muted-foreground">
          {t('admin.payments.expected', { amount: money(expected) })}
        </div>
        {overpaid > 0 && (
          <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
            {t('admin.payments.overpaid', { amount: money(overpaid) })}
          </div>
        )}
      </div>
    )
  }

  function openAdjust(row: AdminEnrollment) {
    setAdjustTarget({
      id: row.id,
      courseId: row.courseId,
      paidAmountCents: row.paidAmountCents,
      expectedAmountCents: row.expectedAmountCents,
      priceCents: row.course.priceCents,
      studentName: row.user?.fullName,
      courseTitle: row.course.title,
    })
  }

  function renderActions(row: AdminEnrollment) {
    const canDecide = row.status === 'PAID'
    const canAdjust = row.status === 'PAID' || row.status === 'UNDERPAID'
    const canReject = row.status === 'PENDING' || row.status === 'PAID' || row.status === 'UNDERPAID'
    return (
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {canDecide && (
          <>
            <Button size="sm" disabled={approving} onClick={() => approve(row)}>
              <Check className="h-4 w-4 mr-1" />
              {t('common.grantAccess')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMoreDialog(row)
                setMoreNote('')
              }}
            >
              <MessageSquareWarning className="h-4 w-4 mr-1" />
              {t('admin.payments.requestMore')}
            </Button>
          </>
        )}
        {canAdjust && (
          <Button size="sm" variant="outline" onClick={() => openAdjust(row)}>
            <Pencil className="h-4 w-4 mr-1" />
            {t('admin.payments.adjustAmount')}
          </Button>
        )}
        {canReject && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (window.confirm(t('admin.payments.rejectConfirm'))) reject(row)
            }}
          >
            <X className="h-4 w-4 mr-1" />
            {t('common.reject')}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => toggleExpanded(row.id)}>
          {expanded.has(row.id) ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          {expanded.has(row.id) ? t('admin.payments.hideHistory') : t('admin.payments.history')}
        </Button>
      </div>
    )
  }

  function renderHistory(events: EnrollmentEvent[]) {
    return (
      <ol className="flex flex-col gap-1.5 border-l-2 border-border pl-3 text-xs">
        {events.map((event) => (
          <li key={event.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-muted-foreground tabular-nums">{when(event.createdAt)}</span>
            <span className="font-medium">{t(`enrollmentEvents.${event.type}`)}</span>
            {event.actor && (
              <span className="text-muted-foreground">
                {t('admin.payments.eventBy', { name: event.actor.fullName })}
              </span>
            )}
            {event.amountCents != null && (
              <span className="text-emerald-700 dark:text-emerald-400">
                {t('admin.payments.eventAmount', { amount: money(event.amountCents) })}
              </span>
            )}
            {event.totalPaidCents != null && (
              <span className="text-muted-foreground">
                {t('admin.payments.eventTotal', { amount: money(event.totalPaidCents) })}
              </span>
            )}
            {event.note && <span className="text-amber-700 dark:text-amber-300">«{event.note}»</span>}
          </li>
        ))}
      </ol>
    )
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="pb-12">
      <PageHeader
        title={t('admin.payments.title')}
        subtitle={t('admin.payments.subtitle')}
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.payments.search')}
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        }
      />

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label={t('admin.payments.stat_sold')}
            value={String(stats.counts.APPROVED)}
            hint={`${t('admin.payments.stat_revenue')}: ${money(stats.soldRevenueCents)}`}
            tone="emerald"
          />
          <StatCard
            label={t('admin.payments.stat_awaiting')}
            value={String(stats.counts.PAID)}
            hint={t('admin.payments.stat_awaitingSum', { amount: money(stats.awaitingReviewCents) })}
            tone="amber"
          />
          <StatCard label={t('admin.payments.stat_underpaid')} value={String(stats.counts.UNDERPAID)} tone="orange" />
          <StatCard label={t('admin.payments.stat_cancelled')} value={String(stats.counts.CANCELLED)} />
        </div>
      )}

      <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(12rem,16rem)_auto_auto_auto] sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t('admin.payments.filterAuthor')}</Label>
          <Select
            value={authorId || 'ALL'}
            onValueChange={(v) => {
              setAuthorId(!v || v === 'ALL' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {authorId
                  ? (authors?.find((a) => a.id === authorId)?.fullName ?? '…')
                  : t('admin.payments.allAuthors')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('admin.payments.allAuthors')}</SelectItem>
              {authors?.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="date-from" className="text-xs text-muted-foreground">
            {t('admin.payments.dateFrom')}
          </Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="date-to" className="text-xs text-muted-foreground">
            {t('admin.payments.dateTo')}
          </Label>
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              setDateTo(e.target.value)
              setPage(1)
            }}
          />
        </div>
        {hasScope && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setAuthorId('')
              setDateFrom('')
              setDateTo('')
              setPage(1)
            }}
          >
            <X className="h-4 w-4 mr-1" />
            {t('admin.payments.resetFilters')}
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = countFor(f)
          return (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => selectFilter(f)}
            >
              {f === 'ALL' ? t('admin.payments.all') : t(`admin.payments.tab_${f}`)}
              {count !== undefined && (
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 text-[11px] tabular-nums',
                    filter === f ? 'bg-primary-foreground/20' : 'bg-muted',
                  )}
                >
                  {count}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('admin.payments.empty')}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 xl:hidden">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{row.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{row.user?.email}</p>
                    <p className="mt-1 text-sm">{row.course.title}</p>
                  </div>
                  {renderStatus(row.status)}
                </div>
                {renderPayment(row)}
                {row.adminPaymentNote && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">{row.adminPaymentNote}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('admin.payments.updatedAt')}: {when(row.updatedAt)}
                </p>
                {renderActions(row)}
                {expanded.has(row.id) && renderHistory(row.events)}
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border xl:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.student')}</TableHead>
                  <TableHead>{t('common.course')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('admin.payments.amount')}</TableHead>
                  <TableHead>{t('admin.payments.updatedAt')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow>
                      <TableCell>
                        <div className="font-medium">{row.user?.fullName}</div>
                        <div className="text-xs text-muted-foreground">{row.user?.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.course.title}
                        {row.adminPaymentNote && (
                          <p className="mt-1 max-w-xs text-xs text-amber-700 dark:text-amber-300">
                            {row.adminPaymentNote}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{renderStatus(row.status)}</TableCell>
                      <TableCell>{renderPayment(row)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {when(row.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">{renderActions(row)}</TableCell>
                    </TableRow>
                    {expanded.has(row.id) && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={6}>{renderHistory(row.events)}</TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {t('admin.payments.prev')}
              </Button>
              <span className="text-muted-foreground">{t('admin.payments.page', { page, pages })}</span>
              <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                {t('admin.payments.next')}
              </Button>
            </div>
          )}
        </>
      )}

      <AdjustAmountDialog
        target={adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onSaved={invalidate}
      />

      <Dialog open={!!moreDialog} onOpenChange={() => setMoreDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.payments.requestMoreTitle')}</DialogTitle>
          </DialogHeader>
          {moreDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {moreDialog.user?.fullName} · {moreDialog.course.title}
              </p>
              <div className="space-y-2">
                <Label>{t('admin.payments.noteLabel')}</Label>
                <Textarea
                  rows={3}
                  value={moreNote}
                  onChange={(e) => setMoreNote(e.target.value)}
                  placeholder={t('admin.payments.notePlaceholder')}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoreDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={requestingMore || moreNote.trim().length < 3}
              onClick={() =>
                moreDialog && requestMore({ row: moreDialog, note: moreNote.trim() })
              }
            >
              {t('common.send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'emerald' | 'amber' | 'orange'
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-700 dark:text-emerald-400'
      : tone === 'amber'
        ? 'text-amber-700 dark:text-amber-400'
        : tone === 'orange'
          ? 'text-orange-700 dark:text-orange-400'
          : 'text-foreground'
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', toneClass)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
