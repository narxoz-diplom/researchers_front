import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, MessageSquareWarning, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import { format } from 'date-fns'
import { getDateLocale } from '@/lib/date-locale'
import type { PaymentEnrollment } from '@/shared/types'

export function AdminPaymentsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const dateLocale = getDateLocale(i18n.language)
  const [moreDialog, setMoreDialog] = useState<PaymentEnrollment | null>(null)
  const [moreNote, setMoreNote] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: () =>
      api.get<PaymentEnrollment[]>(API.adminEnrollments.pendingPayments).then((r) => r.data),
  })

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'payments'] })

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (row: PaymentEnrollment) =>
      api.post(API.courses.enrollmentApprove(row.courseId, row.id)),
    onSuccess: () => {
      invalidate()
      toast.success(t('admin.payments.approved'))
    },
    onError: () => toast.error(t('admin.payments.approveFailed')),
  })

  const { mutate: reject } = useMutation({
    mutationFn: (row: PaymentEnrollment) =>
      api.post(API.courses.enrollmentReject(row.courseId, row.id)),
    onSuccess: () => {
      invalidate()
      toast.success(t('admin.payments.rejected'))
    },
    onError: () => toast.error(t('admin.payments.rejectFailed')),
  })

  const { mutate: requestMore, isPending: requestingMore } = useMutation({
    mutationFn: ({ row, note }: { row: PaymentEnrollment; note: string }) =>
      api.post(API.courses.enrollmentRequestMore(row.courseId, row.id), { note }),
    onSuccess: () => {
      invalidate()
      setMoreDialog(null)
      setMoreNote('')
      toast.success(t('admin.payments.moreRequested'))
    },
    onError: () => toast.error(t('admin.payments.moreRequestFailed')),
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-12">
      <PageHeader
        title={t('admin.payments.title')}
        subtitle={t('admin.payments.subtitle')}
      />

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : !data?.length ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t('admin.payments.empty')}
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.student')}</TableHead>
                <TableHead>{t('common.course')}</TableHead>
                <TableHead>{t('admin.payments.amount')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.user?.fullName}</div>
                    <div className="text-xs text-muted-foreground">{row.user?.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{row.course.title}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatPriceCents(row.paidAmountCents ?? 0, i18n.language)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('admin.payments.expected', {
                        amount: formatPriceCents(
                          row.expectedAmountCents ?? row.course.priceCents,
                          i18n.language,
                        ),
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.paidAt
                      ? format(new Date(row.paidAt), 'd MMM yyyy HH:mm', { locale: dateLocale })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
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
                      <Button size="sm" variant="outline" onClick={() => reject(row)}>
                        <X className="h-4 w-4 mr-1" />
                        {t('common.reject')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
