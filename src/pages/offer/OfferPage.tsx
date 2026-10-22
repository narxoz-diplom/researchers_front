import { useTranslation } from 'react-i18next'
import { OFFER_TEXT } from '@/features/authors/offer-text'

export function OfferPage() {
  const { i18n } = useTranslation()
  const text = OFFER_TEXT[i18n.language.startsWith('ru') ? 'ru' : 'kk']

  return (
    <article className="mx-auto max-w-3xl pb-16 pt-6">
      <h1 className="text-3xl font-semibold tracking-tight">{text.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{text.subtitle}</p>

      <div className="mt-8 flex flex-col gap-7">
        {text.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 text-lg font-semibold">{section.title}</h2>
            <ul className="flex flex-col gap-2 text-[15px] leading-relaxed text-foreground/90">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="rounded-xl border bg-muted/30 p-5">
          <h2 className="mb-2 text-base font-semibold">{text.operatorTitle}</h2>
          <ul className="text-sm text-muted-foreground">
            {text.operator.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}
