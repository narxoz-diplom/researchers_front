import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCartStore, cartItemKey } from '@/features/cart/store/cart.store'
import type { CheckoutResponse } from '@/features/courses/types/course-preview'
import { formatPriceCents } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { LandingHeader } from './LandingHeader'

export function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const qc = useQueryClient()
  const [courseSearch, setCourseSearch] = useState('')
  const [results, setResults] = useState<CheckoutResponse['results'] | null>(null)

  const catalogHref = '/catalog'
  const loginHref = '/auth/login'
  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)

  const { mutate: checkout, isPending } = useMutation({
    mutationFn: () =>
      api
        .post<CheckoutResponse>(API.purchases.checkout, {
          items: items.map((item) => ({ type: item.type, id: item.id })),
        })
        .then((r) => r.data),
    onSuccess: (data) => {
      setResults(data.results)
      for (const result of data.results) {
        if (result.success) {
          removeItem(result.type, result.id)
        }
      }
      void qc.invalidateQueries({ queryKey: ['library', 'mine'] })
      const failed = data.results.filter((r) => !r.success).length
      if (failed === 0) {
        toast.success(t('landing.checkout.success'))
      } else {
        toast.error(t('landing.checkout.partialError', { count: failed }))
      }
    },
    onError: () => toast.error(t('landing.checkout.error')),
  })

  if (isLoading) return null

  if (!user) {
    return <Navigate to="/auth/register" state={{ from: '/checkout' }} replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader
        courseSearch={courseSearch}
        onCourseSearchChange={setCourseSearch}
        catalogHref={catalogHref}
        loginHref={loginHref}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToHome')}
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">{t('landing.checkout.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('landing.checkout.description')}</p>

        {items.length === 0 && !results ? (
          <div className="mt-10 rounded-2xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('landing.cart.empty')}</p>
            <Link to="/#courses" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
              {t('landing.checkout.backToCourses')}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {(items.length > 0 ? items : []).map((item) => {
              const result = results?.find((r) => r.type === item.type && r.id === item.id)
              return (
                <div key={cartItemKey(item.type, item.id)} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {t(`landing.cart.itemType.${item.type}`)}
                      </p>
                      <p className="mt-1 font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <p className="shrink-0 font-semibold text-primary">
                      {formatPriceCents(item.priceCents, i18n.language)}
                    </p>
                  </div>
                  {result && (
                    <div
                      className={cn(
                        'mt-3 flex items-center gap-2 text-sm',
                        result.success ? 'text-emerald-600' : 'text-destructive',
                      )}
                    >
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {result.success
                        ? t('landing.checkout.itemSuccess')
                        : (result.message ?? t('landing.checkout.itemFailed'))}
                    </div>
                  )}
                </div>
              )
            })}

            {results?.map((result) => {
              const stillInCart = items.some(
                (item) => item.type === result.type && item.id === result.id,
              )
              if (stillInCart || !result.success) return null
              return (
                <div
                  key={`done-${result.type}-${result.id}`}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400"
                >
                  {t('landing.checkout.itemSuccess')}
                </div>
              )
            })}

            {items.length > 0 && (
              <>
                <div className="flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">{t('landing.cart.total')}</span>
                  <span className="text-lg font-bold">
                    {formatPriceCents(totalCents, i18n.language)}
                  </span>
                </div>

                {user.role !== 'SUBSCRIBER' ? (
                  <p className="text-sm text-muted-foreground">{t('landing.checkout.subscriberOnly')}</p>
                ) : (
                  <Button className="w-full" disabled={isPending} onClick={() => checkout()}>
                    {isPending ? t('landing.checkout.processing') : t('landing.checkout.pay')}
                  </Button>
                )}
              </>
            )}

            {items.length === 0 && results && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link to="/my-learning" className={cn(buttonVariants(), 'sm:flex-1')}>
                  {t('myLearning.title')}
                </Link>
                <Button variant="outline" className="sm:flex-1" onClick={() => setResults(null)}>
                  {t('landing.checkout.backToCourses')}
                </Button>
              </div>
            )}

            {items.length > 0 && (
              <Button variant="outline" className="w-full" onClick={() => clear()}>
                {t('landing.cart.clear')}
              </Button>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <BrandIcon className="h-6 w-6" />
            {t('landing.brand')}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('landing.footer', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  )
}
