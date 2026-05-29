import type { ComponentType } from 'react'
import { Activity, FlaskConical, Microscope, Wrench } from 'lucide-react'
import { BookMarkIcon } from '@/shared/components/BrandIcon'
import type { SectionId } from './types'

export const NAV_ITEMS: {
  id: SectionId
  icon: ComponentType<{ className?: string }>
}[] = [
  { id: 'about', icon: Microscope },
  { id: 'publication', icon: BookMarkIcon },
  { id: 'methods', icon: FlaskConical },
  { id: 'tools', icon: Wrench },
  { id: 'wellness', icon: Activity },
]

export function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
