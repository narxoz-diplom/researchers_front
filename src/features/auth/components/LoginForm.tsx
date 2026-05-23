import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { extractApiError } from '@/shared/api/axios'
import { loginSchema, type LoginSchema } from '../schemas'
import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/catalog'

  const { mutate: login, isPending } = useLogin()

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginSchema) {
    login(values, {
      onSuccess: () => {
        toast.success('Добро пожаловать!')
        void navigate(from, { replace: true })
      },
      onError: (err) => {
        const apiErr = extractApiError(err)
        if (apiErr?.message === 'INVALID_CREDENTIALS') {
          form.setError('root', { message: 'Неверный email или пароль' })
        } else {
          form.setError('root', { message: 'Произошла ошибка. Попробуйте снова.' })
        }
      },
    })
  }

  return (
    <Card className="rounded-2xl shadow-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">Войти</CardTitle>
        <CardDescription>Введите данные для входа в аккаунт</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive text-center">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Вход...' : 'Войти'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{' '}
              <Link to="/auth/register" className="text-primary hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
