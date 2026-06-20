import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { Button, buttonVariants } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { cn } from '@/lib/utils'
import { LANDING_IMAGES } from './landing-images'
import { NAV_ITEMS, scrollToSection } from './landing-nav'
import type { ImageSectionId } from './types'
import { LandingPhoto } from './LandingPhoto'
import { LandingHeader } from './LandingHeader'
import { AboutSection } from './components/AboutSection'
import { CourseMarketplaceSection } from './components/CourseMarketplaceSection'
import { LANDING_SECTION_ANCHOR } from './landing-layout'

export function LandingPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [courseSearch, setCourseSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const catalogHref = '/catalog'
  const loginHref = '/auth/login'

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader
        courseSearch={courseSearch}
        onCourseSearchChange={setCourseSearch}
        catalogHref={catalogHref}
        loginHref={loginHref}
      />

      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div className="text-center lg:text-left">
            <p className="mb-4 inline-flex items-center rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              {t('landing.badge')}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('landing.brand')}
            </h1>
            <p className="mt-6 text-xl font-medium text-primary sm:text-2xl">
              {t('landing.tagline')}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('landing.heroDescription')}
            </p>
            <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:mx-0 lg:justify-start">
              <Link to={catalogHref} className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
                {t('landing.ctaPrimary')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('courses')}
              >
                {t('landing.ctaSecondary')}
              </Button>
            </div>
          </div>

          <LandingPhoto
            src={LANDING_IMAGES.hero}
            alt={t('landing.images.hero')}
            priority
            className="mx-auto w-full max-w-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 lg:max-w-none"
          />
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-16 sm:gap-20">
          <CourseMarketplaceSection
            search={courseSearch}
            onSearchChange={setCourseSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
          />
          <AboutSection />

          {NAV_ITEMS.filter(({ id }) => id !== 'about').map(({ id, icon: Icon }, index) => (
            <section
              key={id}
              id={id}
              className={cn(
                LANDING_SECTION_ANCHOR,
                'grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <LandingPhoto
                src={LANDING_IMAGES.sections[id as ImageSectionId]}
                alt={t(`landing.images.${id}`)}
                icon={Icon}
              />

              <div className="flex flex-col gap-4 text-center lg:text-left">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t(`landing.sections.${id}.title`)}
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t(`landing.sections.${id}.description`)}
                </p>
                <ul className="mx-auto flex max-w-md flex-col gap-2 lg:mx-0 lg:max-w-none">
                  {(t(`landing.sections.${id}.points`, { returnObjects: true }) as string[]).map(
                    (point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-left text-sm text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {point}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <section className="relative mt-16 overflow-hidden rounded-2xl border shadow-sm sm:mt-20">
          <img
            src={LANDING_IMAGES.finalCta}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px] dark:bg-background/90" />
          <div className="relative p-8 text-center sm:p-12">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t('landing.finalCta.title')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('landing.finalCta.description')}</p>
            <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <Link
                to={catalogHref}
                className={cn(buttonVariants({ size: 'lg' }), 'gap-2 sm:w-auto')}
              >
                {t('landing.finalCta.button')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link
                  to="/auth/register"
                  className={buttonVariants({ size: 'lg', variant: 'outline', className: 'sm:w-auto' })}
                >
                  {t('landing.finalCta.register')}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <BrandIcon className="h-6 w-6" />
            {t('landing.brand')}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('landing.footer', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  )
}
