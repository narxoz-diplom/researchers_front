import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Menu,
  Microscope,
  Wrench,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LanguageToggle } from '@/shared/components/LanguageToggle'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { cn } from '@/lib/utils'
import { LANDING_IMAGES } from './landing-images'
import { LandingPhoto } from './LandingPhoto'
import type { SectionId } from './types'

const NAV_ITEMS: { id: SectionId; icon: typeof Microscope }[] = [
  { id: 'about', icon: Microscope },
  { id: 'publication', icon: BookOpen },
  { id: 'methods', icon: FlaskConical },
  { id: 'tools', icon: Wrench },
  { id: 'wellness', icon: Activity },
]

function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function LandingPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [mobileOpen, setMobileOpen] = useState(false)

  const catalogHref = user ? '/catalog' : '/auth/register'
  const loginHref = '/auth/login'

  function NavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
    return (
      <nav className={cn('flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1', className)}>
        {NAV_ITEMS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              scrollToSection(id)
              onNavigate?.()
            }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(`landing.nav.${id}`)}
          </button>
        ))}
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>{t('landing.brand')}</span>
          </Link>

          <NavLinks className="hidden lg:flex flex-1 justify-center" />

          <div className="ml-auto flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />

            {!user && (
              <Link
                to={loginHref}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex')}
              >
                {t('landing.login')}
              </Link>
            )}

            <Link to={catalogHref} className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}>
              {user ? t('landing.goToCatalog') : t('landing.start')}
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'lg:hidden')}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <NavLinks onNavigate={() => setMobileOpen(false)} className="mb-6" />
                <div className="flex flex-col gap-2">
                  {!user && (
                    <Link
                      to={loginHref}
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({ variant: 'outline' })}
                    >
                      {t('landing.login')}
                    </Link>
                  )}
                  <Link
                    to={catalogHref}
                    onClick={() => setMobileOpen(false)}
                    className={buttonVariants()}
                  >
                    {user ? t('landing.goToCatalog') : t('landing.start')}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

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
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to={catalogHref} className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto gap-2')}>
                {t('landing.ctaPrimary')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => scrollToSection('about')}
              >
                {t('landing.ctaSecondary')}
              </Button>
            </div>
          </div>

          <LandingPhoto
            src={LANDING_IMAGES.hero}
            alt={t('landing.images.hero')}
            priority
            className="shadow-lg ring-1 ring-black/5 dark:ring-white/10"
          />
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col gap-16 sm:gap-24">
          {NAV_ITEMS.map(({ id, icon: Icon }, index) => (
            <section
              key={id}
              id={id}
              className={cn(
                'scroll-mt-24 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <LandingPhoto
                src={LANDING_IMAGES.sections[id]}
                alt={t(`landing.images.${id}`)}
                icon={Icon}
              />

              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t(`landing.sections.${id}.title`)}
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t(`landing.sections.${id}.description`)}
                </p>
                <ul className="flex flex-col gap-2">
                  {(t(`landing.sections.${id}.points`, { returnObjects: true }) as string[]).map(
                    (point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-foreground">
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

        <section className="relative mt-24 overflow-hidden rounded-2xl border shadow-sm">
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
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={catalogHref} className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
                {t('landing.finalCta.button')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link to="/auth/register" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
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
            <BookOpen className="h-4 w-4 text-primary" />
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
