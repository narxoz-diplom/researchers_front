import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/shared/ui/ErrorState'
import { extractApiError } from '@/shared/api/axios'
import {
  useDeletePlatformSubscriberChatKey,
  usePlatformSubscriberChatSettings,
  useSavePlatformSubscriberChatKey,
} from '../hooks/usePlatformSubscriberChatSettings'

function createApiKeySchema(t: (key: string) => string) {
  return z.object({
    apiKey: z.string().trim().min(10, t('ai.settings.minLengthError')),
  })
}

type ApiKeyFormValues = z.infer<ReturnType<typeof createApiKeySchema>>

export function PlatformSubscriberChatKeyForm() {
  const { t } = useTranslation()
  const schema = useMemo(() => createApiKeySchema(t), [t])
  const { data, isLoading, isError, refetch } = usePlatformSubscriberChatSettings()
  const { mutate: saveKey, isPending: saving } = useSavePlatformSubscriberChatKey()
  const { mutate: removeKey, isPending: removing } = useDeletePlatformSubscriberChatKey()

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { apiKey: '' },
  })

  function onSubmit(values: ApiKeyFormValues) {
    saveKey(
      { apiKey: values.apiKey },
      {
        onSuccess: () => {
          form.reset({ apiKey: '' })
          toast.success(t('admin.ai.subscriberChat.keySaved'))
        },
        onError: (err) => {
          const apiErr = extractApiError(err)
          form.setError('root', {
            message: apiErr?.message ?? t('admin.ai.subscriberChat.saveError'),
          })
        },
      },
    )
  }

  function handleRemoveKey() {
    removeKey(undefined, {
      onSuccess: () => {
        form.reset({ apiKey: '' })
        toast.success(t('admin.ai.subscriberChat.keyRemoved'))
      },
      onError: () => {
        toast.error(t('admin.ai.subscriberChat.removeError'))
      },
    })
  }

  if (isLoading) {
    return <Skeleton className="h-56 rounded-2xl max-w-xl" />
  }

  if (isError) {
    return (
      <ErrorState
        message={t('admin.ai.subscriberChat.loadError')}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <Card className="max-w-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">{t('admin.ai.subscriberChat.title')}</CardTitle>
        <CardDescription>{t('admin.ai.subscriberChat.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
          <p className="font-medium">
            {data?.hasApiKey
              ? t('admin.ai.subscriberChat.hasKey')
              : t('admin.ai.subscriberChat.noKey')}
          </p>
          {data?.hasApiKey && data.keyHint ? (
            <p className="mt-1 text-muted-foreground">
              {t('ai.settings.keyHint', { hint: data.keyHint })}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {t('admin.ai.subscriberChat.encryptedNote')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.ai.subscriberChat.apiKeyLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={t('ai.settings.apiKeyPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root ? (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving || removing}>
                {saving ? t('common.saving') : t('admin.ai.subscriberChat.saveKey')}
              </Button>
              {data?.hasApiKey ? (
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  disabled={saving || removing}
                  onClick={handleRemoveKey}
                >
                  {removing ? t('common.processing') : t('admin.ai.subscriberChat.removeKey')}
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
