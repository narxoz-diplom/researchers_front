import { Toaster } from 'sonner'
import { useTheme } from './ThemeProvider'

export function ToastProvider() {
  const { resolvedTheme } = useTheme()
  return <Toaster theme={resolvedTheme} richColors position="top-right" />
}
