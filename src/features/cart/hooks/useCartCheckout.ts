import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api, extractApiError } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCartStore } from '@/features/cart/store/cart.store'

export function useCartCheckout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  async function checkout() {
    if (!user) {
      navigate('/auth/register')
      return
    }

    if (user.role !== 'SUBSCRIBER') {
      toast.error(t('landing.cart.subscribersOnly'))
      return
    }

    if (items.length === 0) return

    setIsCheckingOut(true)
    let successCount = 0

    try {
      for (const item of items) {
        try {
          await api.post(API.courses.enrollmentRequest(item.id))
        } catch (err) {
          const code = extractApiError(err)?.message
          if (code !== 'ENROLLMENT_EXISTS') {
            throw err
          }
        }

        try {
          await api.post(API.courses.enrollmentPurchase(item.id))
        } catch (err) {
          const code = extractApiError(err)?.message
          if (code !== 'ENROLLMENT_INVALID_STATUS') {
            throw err
          }
        }

        successCount += 1
      }

      clear()
      toast.success(t('landing.cart.checkoutSuccess', { count: successCount }))
      navigate('/catalog')
    } catch {
      toast.error(t('landing.cart.checkoutFailed'))
    } finally {
      setIsCheckingOut(false)
    }
  }

  return {
    checkout,
    isCheckingOut,
    isSubscriber: user?.role === 'SUBSCRIBER',
    isLoggedIn: !!user,
  }
}
