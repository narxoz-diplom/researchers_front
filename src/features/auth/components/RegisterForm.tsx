import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { extractApiError } from '@/shared/api/axios'
import { registerSchema, type RegisterSchema } from '../schemas'
import { useRegister } from '../hooks/useRegister'

export function RegisterForm() {
  const navigate = useNavigate()
  const { mutate: register, isPending } = useRegister()

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  function onSubmit(values: RegisterSchema) {
    register(
      { fullName: values.fullName, email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast.success('Аккаунт создан!')
          void navigate('/catalog', { replace: true })
        },
        onError: (err) => {
          const apiErr = extractApiError(err)
          if (apiErr?.message === 'EMAIL_TAKEN') {
            form.setError('email', { message: 'Этот email уже используется' })
          } else {
            form.setError('root', { message: 'Произошла ошибка. Попробуйте снова.' })
          }
        },
      },
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">Создать аккаунт</CardTitle>
        <CardDescription>Заполните форму для регистрации</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Полное имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Иван Иванов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Input type="password" placeholder="Мин. 8 символов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подтвердите пароль</FormLabel>
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
              {isPending ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Войти
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
