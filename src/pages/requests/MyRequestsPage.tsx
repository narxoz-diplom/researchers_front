import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ArrowRight, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { formatPriceCents } from '@/lib/format-price'
import { getDateLocale } from '@/lib/date-locale'
import type { CourseEnrollmentStatus, MyEnrollmentWithCourse } from '@/shared/types'

function canPay(status: CourseEnrollmentStatus) {
  return status === 'PENDING' || status === 'UNDERPAID' || status === 'REJECTED'
}

export function MyRequestsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const dateLocale = getDateLocale(i18n.language)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () =>
      api.get<MyEnrollmentWithCourse[]>(API.enrollments.mine).then((r) => r.data),
  })

  function dueAmount(row: MyEnrollmentWithCourse) {
    const expected = row.expectedAmountCents ?? row.course.priceCents
    return Math.max(0, expected - (row.paidAmountCents ?? 0))
  }

  function renderPayButton(row: MyEnrollmentWithCourse, className?: string) {
    if (!canPay(row.status)) return null
    const due = dueAmount(row)
    const label =
      row.status === 'UNDERPAID'
        ? t('checkout.payAgain', { amount: formatPriceCents(due, i18n.language) })
        : t('common.pay', { price: formatPriceCents(due || row.course.priceCents, i18n.language) })
    return (
      <Button
        size="sm"
        className={className}
        onClick={() => navigate(`/checkout?courseId=${row.course.id}`)}
      >
        <Wallet className="h-4 w-4 mr-1" />
        {label}
      </Button>
    )
  }

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-12">
      <PageHeader title={t('requests.title')} subtitle={t('requests.subtitle')} />

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : !data?.length ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">{t('requests.empty')}</p>
          <Button variant="outline" onClick={() => navigate('/catalog')}>
            {t('common.catalog')}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {data.map((row) => (
              <div key={row.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {row.course.coverUrl ? (
                      <img src={row.course.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{row.course.title}</p>
                    <Badge variant="secondary" className="mt-1">
                      {t(`enrollmentStatuses.${row.status}`)}
                    </Badge>
                  </div>
                </div>
                {row.paidAmountCents != null && (
                  <p className="text-sm">
                    {t('requests.paid', {
                      amount: formatPriceCents(row.paidAmountCents, i18n.language),
                    })}
                  </p>
                )}
                {row.adminPaymentNote && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">{row.adminPaymentNote}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(row.createdAt ?? Date.now()), 'd MMM yyyy HH:mm', { locale: dateLocale })}
                </p>
                <div className="flex flex-col gap-2">
                  {renderPayButton(row, 'w-full')}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/courses/${row.course.id}`)}
                  >
                    {t('requests.openCourse')}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.course')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('admin.payments.amount')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.course.title}</div>
                      {row.adminPaymentNote && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-xs">
                          {row.adminPaymentNote}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t(`enrollmentStatuses.${row.status}`)}</Badge>
                    </TableCell>
                    <TableCell>
                      {row.paidAmountCents != null ? (
                        <div>
                          <div className="text-sm font-medium">
                            {formatPriceCents(row.paidAmountCents, i18n.language)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('admin.payments.expected', {
                              amount: formatPriceCents(
                                row.expectedAmountCents ?? row.course.priceCents,
                                i18n.language,
                              ),
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.createdAt
                        ? format(new Date(row.createdAt), 'd MMM yyyy HH:mm', { locale: dateLocale })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {renderPayButton(row)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/courses/${row.course.id}`)}
                        >
                          {t('requests.openCourse')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
