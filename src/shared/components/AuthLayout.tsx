import { BookOpen } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2 text-foreground no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">researchers</span>
        </div>

        <Outlet />

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>Авторские курсы</span>
            <span>·</span>
            <span>Прямой доступ к материалам</span>
            <span>·</span>
            <span>Отслеживайте прогресс</span>
          </div>
          <div className="mt-3 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
