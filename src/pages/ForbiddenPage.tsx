import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-8xl font-bold text-muted-foreground/30 select-none">403</span>
        <h1 className="text-2xl font-semibold">Нет доступа</h1>
        <p className="text-muted-foreground max-w-sm">
          У вас недостаточно прав для просмотра этой страницы.
        </p>
      </div>
      <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
    </div>
  )
}
