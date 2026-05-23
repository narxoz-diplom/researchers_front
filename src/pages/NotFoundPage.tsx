import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-8xl font-bold text-muted-foreground/30 select-none">404</span>
        <h1 className="text-2xl font-semibold">Страница не найдена</h1>
        <p className="text-muted-foreground max-w-sm">
          Эта страница не существует или была перемещена.
        </p>
      </div>
      <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
    </div>
  )
}
