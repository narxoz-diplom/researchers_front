import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCartStore } from '@/features/cart/store/cart.store'

export function useCartCheckout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const items = useCartStore((s) => s.items)

  function checkout() {
    if (!user) {
      navigate('/auth/register')
      return
    }

    if (user.role !== 'SUBSCRIBER') {
      toast.error(t('landing.cart.subscribersOnly'))
      return
    }

    if (items.length === 0) return

    navigate('/checkout')
  }

  return {
    checkout,
    isCheckingOut: false,
    isSubscriber: user?.role === 'SUBSCRIBER',
    isLoggedIn: !!user,
  }
}
