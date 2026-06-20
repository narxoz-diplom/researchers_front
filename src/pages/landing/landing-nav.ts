import type { ComponentType } from 'react'
import { Activity, FlaskConical, Microscope, ShoppingBag, Wrench } from 'lucide-react'
import { BookMarkIcon } from '@/shared/components/BrandIcon'
import type { SectionId } from './types'

export const PRIORITY_NAV: {
  id: SectionId
  icon: ComponentType<{ className?: string }>
}[] = [{ id: 'courses', icon: ShoppingBag }]

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

export const ALL_NAV_ITEMS = [...PRIORITY_NAV, ...NAV_ITEMS]

export function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
