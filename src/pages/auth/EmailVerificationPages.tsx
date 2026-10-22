import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Loader2, Mail, XCircle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/features/auth/api'
import { extractApiError } from '@/shared/api/axios'
import { cn } from '@/lib/utils'

type Status = 'loading' | 'success' | 'error'

export function CheckEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const email = searchParams.get('email') ?? ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  // Present only in local development without SMTP (the API decides); lets the flow be tested.
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(
    (location.state as { devVerifyUrl?: string } | null)?.devVerifyUrl ?? null,
  )

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      const res = await authApi.resendVerification(email)
      setResent(true)
      if (res.devVerifyUrl) setDevVerifyUrl(res.devVerifyUrl)
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm border-border">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-semibold">{t('auth.checkEmailTitle')}</CardTitle>
        <CardDescription>{t('auth.checkEmailDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-center">
        {email && (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm font-medium break-all">{email}</p>
        )}
        <p className="text-sm text-muted-foreground">{t('auth.checkEmailHint')}</p>
        {devVerifyUrl && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-left text-sm text-amber-900 dark:text-amber-200">
            <p className="font-medium">{t('auth.devVerifyTitle')}</p>
            <p className="mt-1 text-xs">{t('auth.devVerifyHint')}</p>
            <a
              href={devVerifyUrl}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-2 w-full')}
            >
              {t('auth.devVerifyOpen')}
            </a>
          </div>
        )}
        {email && (
          <Button variant="outline" onClick={() => void handleResend()} disabled={resending}>
            {resending ? t('auth.resending') : resent ? t('auth.resent') : t('auth.resendVerification')}
          </Button>
        )}
        <Link to="/auth/login" className={cn(buttonVariants(), 'w-full')}>
          {t('auth.loginLink')}
        </Link>
      </CardContent>
    </Card>
  )
}

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error')
  // The link is single-use: the request must go out exactly once per token, even when
  // React (StrictMode in development) runs the effect twice.
  const attemptedToken = useRef<string | null>(null)

  useEffect(() => {
    if (!token || attemptedToken.current === token) return
    attemptedToken.current = token

    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        // Opened twice (or already confirmed by an admin): the account is verified either way.
        setStatus(extractApiError(err)?.message === 'EMAIL_ALREADY_VERIFIED' ? 'success' : 'error')
      })
  }, [token])

  const icon =
    status === 'loading' ? (
      <Loader2 className="h-7 w-7 animate-spin" />
    ) : status === 'success' ? (
      <CheckCircle className="h-7 w-7" />
    ) : (
      <XCircle className="h-7 w-7" />
    )

  const title =
    status === 'loading'
      ? t('auth.verifyLoadingTitle')
      : status === 'success'
        ? t('auth.verifySuccessTitle')
        : t('auth.verifyErrorTitle')

  const description =
    status === 'loading'
      ? t('auth.verifyLoadingDescription')
      : status === 'success'
        ? t('auth.verifySuccessDescription')
        : t('auth.verifyErrorDescription')

  return (
    <Card className="rounded-2xl shadow-sm border-border">
      <CardHeader className="text-center">
        <div
          className={cn(
            'mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl',
            status === 'success' && 'bg-emerald-500/10 text-emerald-600',
            status === 'error' && 'bg-destructive/10 text-destructive',
            status === 'loading' && 'bg-primary/10 text-primary',
          )}
        >
          {icon}
        </div>
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {status !== 'loading' && (
        <CardContent className="flex flex-col gap-3">
          {status === 'success' ? (
            <Link to="/auth/login" className={cn(buttonVariants(), 'w-full')}>
              {t('auth.loginLink')}
            </Link>
          ) : (
            <>
              <Link to="/auth/register" className={cn(buttonVariants(), 'w-full')}>
                {t('auth.registerLink')}
              </Link>
              <Link to="/auth/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
                {t('auth.loginLink')}
              </Link>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
