import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

function BookGlyph({ spineClassName }: { spineClassName?: string }) {
  return (
    <>
      <path
        fill="currentColor"
        d="M8 10.5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v11c0 .6-.7.9-1.1.6l-5.9-3.9a2 2 0 0 0-2.2 0l-5.9 3.9c-.4.3-1.1 0-1.1-.6v-11Z"
      />
      <path
        fill="currentColor"
        className={spineClassName ?? 'opacity-35'}
        d="M16 8.5v14.2l5.9-3.9c.4-.3 1.1 0 1.1.6v-11c0-1.1-.9-2-2-2H10c-1.1 0-2 .9-2 2v11c0 .6.7.9 1.1.6L16 22.7V8.5Z"
      />
    </>
  )
}

/** Open book glyph (no tile) — nav, badges, placeholders */
export function BookMarkIcon({ className }: Props) {
  return (
    <svg
      viewBox="7 7 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <BookGlyph />
    </svg>
  )
}

/** App mark: open book — matches public/favicon.svg */
export function BrandIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <g className="text-primary-foreground">
        <BookGlyph spineClassName="opacity-30" />
      </g>
      <circle cx="23" cy="9" r="3" className="fill-amber-300" />
      <path
        className="stroke-amber-300"
        strokeWidth="1.2"
        strokeLinecap="round"
        d="M23 6.2v5.6M20.4 9h5.2"
      />
    </svg>
  )
}
