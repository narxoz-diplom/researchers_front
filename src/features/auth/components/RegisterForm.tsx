import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { extractApiError } from '@/shared/api/axios'
import { AuthorOfferFields } from '@/features/authors/components/AuthorOfferFields'
import {
  createAuthorApplicationSchema,
  EMPTY_AUTHOR_APPLICATION,
} from '@/features/authors/schemas'
import { createRegisterSchema, type RegisterSchema } from '../schemas'
import { useRegister } from '../hooks/useRegister'

export function RegisterForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: register, isPending } = useRegister()
  const registerSchema = useMemo(() => createRegisterSchema(t), [t])

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      role: 'SUBSCRIBER',
      email: '',
      password: '',
      confirmPassword: '',
      authorApplication: EMPTY_AUTHOR_APPLICATION,
    },
  })
  const isAuthor = form.watch('role') === 'AUTHOR'

  function onSubmit(values: RegisterSchema) {
    // Normalized offer (IIN without spaces, trimmed text); sent only for authors.
    const offer =
      values.role === 'AUTHOR'
        ? createAuthorApplicationSchema(t).parse(values.authorApplication)
        : undefined
    register(
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(offer ? { authorApplication: offer } : {}),
      },
      {
        onSuccess: (data) => {
          toast.success(t('auth.checkEmailSent'))
          void navigate(`/auth/check-email?email=${encodeURIComponent(data.email)}`, {
            replace: true,
            state: {
              ...(data.devVerifyUrl ? { devVerifyUrl: data.devVerifyUrl } : {}),
              ...(data.mailFailed ? { mailFailed: true } : {}),
            },
          })
        },
        onError: (err) => {
          const apiErr = extractApiError(err)
          if (apiErr?.message === 'EMAIL_TAKEN') {
            form.setError('email', { message: t('auth.emailTaken') })
          } else if (values.role === 'AUTHOR' && isAxiosError(err) && err.response?.status === 400) {
            form.setError('root', { message: t('offer.submitInvalid') })
          } else {
            form.setError('root', { message: t('auth.genericError') })
          }
        },
      },
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">{t('auth.registerTitle')}</CardTitle>
        <CardDescription>{t('auth.registerDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('auth.fullNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.role')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('auth.selectRole')}>
                          {field.value === 'AUTHOR' ? t('auth.roleAuthor') : t('auth.roleSubscriber')}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SUBSCRIBER">{t('auth.roleSubscriber')}</SelectItem>
                      <SelectItem value="AUTHOR">{t('auth.roleAuthor')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAuthor && (
              <section className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div>
                  <p className="text-sm font-semibold">{t('offer.registerTitle')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('offer.registerHint')}</p>
                </div>
                <AuthorOfferFields<RegisterSchema> prefix="authorApplication." />
              </section>
            )}

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
                    <PasswordInput  placeholder={t('auth.passwordPlaceholder')} {...field} />
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
                  <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                  <FormControl>
                    <PasswordInput  placeholder="••••••••" {...field} />
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
              {isPending ? t('auth.registerSubmitting') : t('auth.registerSubmit')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount')}{' '}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                {t('auth.loginLink')}
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
