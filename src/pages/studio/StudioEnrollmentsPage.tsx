import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, MessageSquareWarning, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { formatPriceCents } from '@/lib/format-price'
import type { Course, CourseEnrollment, CourseEnrollmentStatus } from '@/shared/types'
import { format } from 'date-fns'
import { getDateLocale } from '@/lib/date-locale'

export function StudioEnrollmentsPage() {
  const { t, i18n } = useTranslation()
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const dateLocale = getDateLocale(i18n.language)
  const [moreDialog, setMoreDialog] = useState<CourseEnrollment | null>(null)
  const [moreNote, setMoreNote] = useState('')

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get<Course>(API.courses.byId(courseId!)).then((r) => r.data),
    enabled: !!courseId,
  })

  const { data: enrollments, isLoading, isError, refetch } = useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: () =>
      api.get<CourseEnrollment[]>(API.courses.enrollments(courseId!)).then((r) => r.data),
    enabled: !!courseId,
  })

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (enrollmentId: string) =>
      api.post(API.courses.enrollmentApprove(courseId!, enrollmentId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['enrollments', courseId] })
      toast.success(t('studio.accessGranted'))
    },
    onError: () => toast.error(t('studio.accessGrantFailed')),
  })

  const { mutate: reject } = useMutation({
    mutationFn: (enrollmentId: string) =>
      api.post(API.courses.enrollmentReject(courseId!, enrollmentId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['enrollments', courseId] })
      toast.success(t('studio.enrollmentRejected'))
    },
    onError: () => toast.error(t('studio.enrollmentRejectFailed')),
  })

  const { mutate: requestMore, isPending: requestingMore } = useMutation({
    mutationFn: ({ enrollmentId, note }: { enrollmentId: string; note: string }) =>
      api.post(API.courses.enrollmentRequestMore(courseId!, enrollmentId), { note }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['enrollments', courseId] })
      setMoreDialog(null)
      setMoreNote('')
      toast.success(t('admin.payments.moreRequested'))
    },
    onError: () => toast.error(t('admin.payments.moreRequestFailed')),
  })

  function formatPayment(row: CourseEnrollment) {
    if (!row.paidAmountCents) return '—'
    const expected = row.expectedAmountCents ?? course?.priceCents ?? 0
    return (
      <div>
        <div className="text-sm font-medium">
          {formatPriceCents(row.paidAmountCents, i18n.language)}
        </div>
        <div className="text-xs text-muted-foreground">
          {t('admin.payments.expected', {
            amount: formatPriceCents(expected, i18n.language),
          })}
        </div>
      </div>
    )
  }

  function renderActions(row: CourseEnrollment) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {row.status === 'PAID' && (
          <>
            <Button size="sm" className="w-full sm:w-auto" disabled={approving} onClick={() => approve(row.id)}>
              <Check className="h-4 w-4 mr-1" />
              {t('common.grantAccess')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
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
        {(row.status === 'PENDING' || row.status === 'PAID' || row.status === 'UNDERPAID') && (
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => reject(row.id)}
          >
            <X className="h-4 w-4 mr-1" />
            {t('common.reject')}
          </Button>
        )}
      </div>
    )
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-12">
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-4 gap-1 text-muted-foreground"
        onClick={() => navigate(`/studio/courses/${courseId}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.backToCourseEdit')}
      </Button>

      <PageHeader
        title={t('common.courseEnrollments')}
        subtitle={course?.title}
      />

      <p className="text-sm text-muted-foreground mb-6">
        {t('common.enrollmentHint')}
      </p>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : !enrollments?.length ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          {t('common.noEnrollments')}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {enrollments.map((row) => (
              <div key={row.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div>
                  <p className="font-medium">{row.user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{row.user?.email}</p>
                  {row.message && (
                    <p className="mt-2 text-xs text-muted-foreground">{row.message}</p>
                  )}
                  {row.adminPaymentNote && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{row.adminPaymentNote}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {t(`enrollmentStatuses.${row.status as CourseEnrollmentStatus}`)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(row.createdAt), 'd MMM yyyy', { locale: dateLocale })}
                  </span>
                </div>
                {formatPayment(row)}
                {renderActions(row)}
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.student')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('admin.payments.amount')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.user?.fullName}</div>
                      <div className="text-xs text-muted-foreground">{row.user?.email}</div>
                      {row.message && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{row.message}</p>
                      )}
                      {row.adminPaymentNote && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-xs">
                          {row.adminPaymentNote}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {t(`enrollmentStatuses.${row.status as CourseEnrollmentStatus}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPayment(row)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(row.createdAt), 'd MMM yyyy', { locale: dateLocale })}
                    </TableCell>
                    <TableCell className="text-right">{renderActions(row)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog open={!!moreDialog} onOpenChange={() => setMoreDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.payments.requestMoreTitle')}</DialogTitle>
          </DialogHeader>
          {moreDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{moreDialog.user?.fullName}</p>
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
                moreDialog && requestMore({ enrollmentId: moreDialog.id, note: moreNote.trim() })
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
