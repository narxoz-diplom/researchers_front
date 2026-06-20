import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/features/cart/store/cart.store'
import { useCartCheckout } from '@/features/cart/hooks/useCartCheckout'
import { formatPriceCents } from '@/lib/format-price'
import { cn } from '@/lib/utils'

interface Props {
  catalogHref: string
  className?: string
}

export function LandingCartButton({ catalogHref, className }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const bumpToken = useCartStore((s) => s.bumpToken)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const { checkout, isCheckingOut, isSubscriber, isLoggedIn } = useCartCheckout()

  const controls = useAnimation()
  const [open, setOpen] = useState(false)

  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)

  function handleCheckout() {
    if (!isLoggedIn) {
      setOpen(false)
      navigate('/auth/register')
      return
    }
    if (!isSubscriber) {
      setOpen(false)
      navigate(catalogHref)
      return
    }
    void checkout().then(() => setOpen(false))
  }

  useEffect(() => {
    if (bumpToken === 0) return
    void controls.start({
      scale: [1, 1.25, 0.95, 1.05, 1],
      rotate: [0, -8, 8, 0],
      transition: { duration: 0.55, ease: 'easeOut' },
    })
  }, [bumpToken, controls])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'relative shrink-0',
          className,
        )}
        aria-label={t('landing.cart.title')}
      >
        <motion.span animate={controls} className="inline-flex">
          <ShoppingCart className="h-5 w-5" />
        </motion.span>
        {items.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {items.length}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('landing.cart.title')}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-40" />
            <p className="text-sm">{t('landing.cart.empty')}</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-xl border bg-card p-3"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {formatPriceCents(item.priceCents, i18n.language)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={() => removeItem(item.id)}
                  aria-label={t('landing.cart.remove')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-3 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('landing.cart.total')}</span>
            <span className="text-lg font-bold">
              {formatPriceCents(totalCents, i18n.language)}
            </span>
          </div>
          <Button
            className="w-full"
            onClick={handleCheckout}
            disabled={isCheckingOut || items.length === 0}
          >
            {isCheckingOut
              ? t('landing.cart.checkoutProcessing')
              : !isLoggedIn
                ? t('landing.cart.checkoutRegister')
                : !isSubscriber
                  ? t('landing.cart.viewCatalog')
                  : t('landing.cart.checkout')}
          </Button>
          {items.length > 0 && (
            <Button variant="outline" className="w-full" onClick={() => clear()}>
              {t('landing.cart.clear')}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
