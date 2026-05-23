import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { extractApiError } from '@/shared/api/axios'
import { createLoginSchema, type LoginSchema } from '../schemas'
import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/catalog'

  const { mutate: login, isPending } = useLogin()
  const loginSchema = useMemo(() => createLoginSchema(t), [t])
  const [needsVerification, setNeedsVerification] = useState(false)

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginSchema) {
    setNeedsVerification(false)
    login(values, {
      onSuccess: () => {
        toast.success(t('auth.welcome'))
        void navigate(from, { replace: true })
      },
      onError: (err) => {
        const apiErr = extractApiError(err)
        if (apiErr?.message === 'INVALID_CREDENTIALS') {
          form.setError('root', { message: t('auth.invalidCredentials') })
        } else if (apiErr?.message === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true)
          form.setError('root', { message: t('auth.emailNotVerified') })
        } else {
          form.setError('root', { message: t('auth.genericError') })
        }
      },
    })
  }

  return (
    <Card className="rounded-2xl shadow-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.email')}</FormLabel>
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
                  <FormLabel>{t('common.password')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-destructive text-center">
                  {form.formState.errors.root.message}
                </p>
                {needsVerification && (
                  <Link
                    to={`/auth/check-email?email=${encodeURIComponent(form.getValues('email'))}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('auth.resendVerification')}
                  </Link>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t('auth.loginSubmitting') : t('auth.loginSubmit')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Link to="/auth/register" className="text-primary hover:underline font-medium">
                {t('auth.registerLink')}
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
