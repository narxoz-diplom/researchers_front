import { Link } from 'react-router-dom'
import { useFormContext, type FieldValues, type Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { AuthorApplicationSchema } from '../schemas'

type Field = keyof AuthorApplicationSchema

const TEXT_FIELDS: { name: Exclude<Field, 'acceptOffer'>; placeholder: string; inputMode?: 'numeric' | 'tel' }[] = [
  { name: 'legalName', placeholder: 'offer.fields.legalNamePlaceholder' },
  { name: 'iin', placeholder: '900101400123', inputMode: 'numeric' },
  { name: 'phone', placeholder: '+7 701 123 45 67', inputMode: 'tel' },
  { name: 'city', placeholder: 'offer.fields.cityPlaceholder' },
]

/**
 * Public-offer fields for an author. Works inside any react-hook-form form:
 * `prefix` is the path of the nested object ('' when the form is the offer itself).
 */
export function AuthorOfferFields<T extends FieldValues>({ prefix = '' }: { prefix?: string }) {
  const { t } = useTranslation()
  const { control } = useFormContext<T>()
  const name = (field: Field) => `${prefix}${field}` as Path<T>

  return (
    <div className="flex flex-col gap-4">
      {TEXT_FIELDS.map((f) => (
        <FormField
          key={f.name}
          control={control}
          name={name(f.name)}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(`offer.fields.${f.name}`)}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={(field.value as string | undefined) ?? ''}
                  inputMode={f.inputMode}
                  placeholder={f.placeholder.startsWith('offer.') ? t(f.placeholder) : f.placeholder}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <FormField
        control={control}
        name={name('acceptOffer')}
        render={({ field }) => (
          <FormItem>
            <label className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-sm leading-snug">
              <FormControl>
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              <span>
                {t('offer.acceptPrefix')}{' '}
                <Link to="/offer" target="_blank" className="font-medium text-primary hover:underline">
                  {t('offer.acceptLink')}
                </Link>{' '}
                {t('offer.acceptSuffix')}
              </span>
            </label>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
