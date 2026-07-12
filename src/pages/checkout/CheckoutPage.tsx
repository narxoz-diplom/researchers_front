import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCartStore } from '@/features/cart/store/cart.store'
import { formatPriceCents } from '@/lib/format-price'
import type { Course, MyEnrollment } from '@/shared/types'

interface CheckoutLine {
  id: string
  title: string
  coverUrl?: string
  priceCents: number
  alreadyPaidCents: number
}

interface CourseDetailCheckout extends Course {
  myEnrollment?: MyEnrollment | null
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('courseId')
  const user = useAuthStore((s) => s.user)
  const cartItems = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const qc = useQueryClient()
  const [submitting, setSubmitting] = useState(false)
  const [amountTenge, setAmountTenge] = useState('')

  const { data: singleCourse, isLoading: loadingCourse } = useQuery({
    queryKey: ['checkout-course', courseId],
    queryFn: () =>
      api.get<CourseDetailCheckout>(API.courses.byId(courseId!)).then((r) => r.data),
    enabled: !!courseId,
  })

  const lines: CheckoutLine[] = useMemo(() => {
    if (courseId && singleCourse) {
      const enrollment = singleCourse.myEnrollment
      const expected = enrollment?.expectedAmountCents ?? singleCourse.priceCents
      const alreadyPaid = enrollment?.paidAmountCents ?? 0
      return [
        {
          id: singleCourse.id,
          title: singleCourse.title,
          coverUrl: singleCourse.coverUrl,
          priceCents: expected,
          alreadyPaidCents: alreadyPaid,
        },
      ]
    }
    return cartItems.map((item) => ({
      id: item.id,
      title: item.title,
      coverUrl: item.coverUrl,
      priceCents: item.priceCents,
      alreadyPaidCents: 0,
    }))
  }, [courseId, singleCourse, cartItems])

  const dueCents = lines.reduce(
    (sum, line) => sum + Math.max(0, line.priceCents - line.alreadyPaidCents),
    0,
  )

  const defaultAmountTenge = dueCents > 0 ? String(Math.round(dueCents / 100)) : ''

  const displayAmount = amountTenge || defaultAmountTenge

  async function handleSubmit() {
    if (!user) {
      navigate('/auth/register')
      return
    }
    if (user.role !== 'SUBSCRIBER') {
      toast.error(t('landing.cart.subscribersOnly'))
      return
    }
    if (lines.length === 0) return

    const paidTotalCents = Math.round(Number(displayAmount.replace(',', '.')) * 100)
    if (!paidTotalCents || paidTotalCents < 1) {
      toast.error(t('checkout.invalidAmount'))
      return
    }

    setSubmitting(true)
    try {
      let remaining = paidTotalCents

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineDue = Math.max(0, line.priceCents - line.alreadyPaidCents)
        const isLast = i === lines.length - 1
        const linePayment = isLast ? remaining : Math.min(lineDue, remaining)
        remaining -= linePayment

        if (linePayment <= 0) continue

        await api.post(API.courses.enrollmentPurchase(line.id), {
          paidAmountCents: linePayment,
        })
      }

      if (!courseId) clearCart()
      void qc.invalidateQueries({ queryKey: ['my-enrollments'] })
      toast.success(t('checkout.submitted'))
      navigate('/catalog')
    } catch {
      toast.error(t('checkout.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (courseId && loadingCourse) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{t('checkout.empty')}</p>
        <Button onClick={() => navigate('/catalog')}>{t('common.catalog')}</Button>
      </div>
    )
  }

  const underpaidNote = singleCourse?.myEnrollment?.adminPaymentNote

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 gap-1 text-muted-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.backToCatalog')}
      </Button>

      <h1 className="text-2xl font-semibold mb-2">{t('checkout.title')}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t('checkout.instructions')}</p>

      {underpaidNote && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
          <p className="font-medium mb-1">{t('checkout.underpaidTitle')}</p>
          <p>{underpaidNote}</p>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-4 mb-6">
        <img
          src="/kaspi-qr.png"
          alt="Kaspi QR"
          className="mx-auto w-full max-w-xs rounded-xl"
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t('checkout.qrHint')}
        </p>
      </div>

      <div className="mb-6 space-y-3">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-3 rounded-xl border bg-card p-3">
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {line.coverUrl ? (
                <img src={line.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{line.title}</p>
              {line.alreadyPaidCents > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('checkout.alreadyPaid', {
                    amount: formatPriceCents(line.alreadyPaidCents, i18n.language),
                  })}
                </p>
              )}
              <p className="text-sm font-semibold text-primary">
                {t('checkout.due', {
                  amount: formatPriceCents(
                    Math.max(0, line.priceCents - line.alreadyPaidCents),
                    i18n.language,
                  ),
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">{t('checkout.totalDue')}</span>
        <span className="text-lg font-bold">{formatPriceCents(dueCents, i18n.language)}</span>
      </div>

      <div className="mb-6 space-y-2">
        <Label htmlFor="paid-amount">{t('checkout.amountSent')}</Label>
        <Input
          id="paid-amount"
          type="number"
          min={1}
          inputMode="decimal"
          placeholder={defaultAmountTenge}
          value={amountTenge}
          onChange={(e) => setAmountTenge(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t('checkout.amountHint')}</p>
      </div>

      <Button className="w-full" disabled={submitting} onClick={() => void handleSubmit()}>
        {submitting ? t('checkout.submitting') : t('checkout.submit')}
      </Button>
    </div>
  )
}
