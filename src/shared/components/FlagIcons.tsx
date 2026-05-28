import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

type FlagIconProps = SVGProps<SVGSVGElement>

export function KzFlagIcon({ className, ...props }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 36 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
      {...props}
    >
      <rect width="36" height="24" fill="#00afca" />
      <path
        fill="#fec50c"
        d="M4 2.5h2.2v19H4V2.5zm3.2 0h1.1v19H7.2V2.5zm2.2 0h1.1v19H9.4V2.5zm2.2 0H12v19h-1.2V2.5z"
      />
      <circle cx="22" cy="12" r="5.2" fill="#fec50c" />
      <g fill="#fec50c" transform="translate(22 12)">
        {Array.from({ length: 32 }, (_, i) => {
          const angle = (i * Math.PI) / 16
          const x1 = Math.sin(angle) * 6.2
          const y1 = -Math.cos(angle) * 6.2
          const x2 = Math.sin(angle) * 8.4
          const y2 = -Math.cos(angle) * 8.4
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fec50c" strokeWidth="0.9" />
        })}
      </g>
      <path
        fill="#fec50c"
        d="M20.2 10.8c1.1-.4 2.4-.2 3.2.6.5.5.8 1.1.9 1.8-.6-.3-1.3-.4-2-.2-.9.3-1.6 1-1.9 1.9-.2.6-.2 1.2 0 1.8-.5-.9-.4-2 .3-2.9.4-.5 1-.9 1.5-1z"
      />
    </svg>
  )
}

export function RuFlagIcon({ className, ...props }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 27 18"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
      {...props}
    >
      <rect width="27" height="6" y="0" fill="#fff" />
      <rect width="27" height="6" y="6" fill="#0039a6" />
      <rect width="27" height="6" y="12" fill="#d52b1e" />
    </svg>
  )
}
