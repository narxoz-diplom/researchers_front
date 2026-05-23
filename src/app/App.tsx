import { useEffect, useRef } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { authStorage } from '@/shared/api/auth-storage'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ToastProvider } from './providers/ToastProvider'

function AppInit() {
  const { login, setLoading } = useAuthStore()
  const startedRef = useRef(false)

  useEffect(() => {
    // Guard against StrictMode's double-invoke and any duplicate refresh
    // attempts that would race on a single-use refresh token.
    if (startedRef.current) return
    startedRef.current = true

    const rt = authStorage.getRefresh()
    if (!rt) {
      setLoading(false)
      return
    }

    authApi
      .refresh(rt)
      .then((data) => {
        login(data.user, data.accessToken, data.refreshToken)
        authStorage.setRefresh(data.refreshToken)
      })
      .catch(() => {
        authStorage.clear()
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <RouterProvider router={router} />
}

export function App() {
  return (
    <>
      <AppInit />
      <ToastProvider />
    </>
  )
}
