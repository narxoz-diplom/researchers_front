import { useAuthStore } from '@/features/auth/store/auth.store'
import { LoadingState } from '@/shared/ui/LoadingState'
import { AppLayout } from './AppLayout'
import { PublicBrowseLayout } from './PublicBrowseLayout'

/** Guests see a minimal header; logged-in users keep the app shell with sidebar. */
export function AdaptiveBrowseLayout() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <LoadingState />

  if (user) return <AppLayout />

  return <PublicBrowseLayout />
}
