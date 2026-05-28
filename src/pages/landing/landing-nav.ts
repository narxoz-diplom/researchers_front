import { Activity, BookOpen, FlaskConical, Microscope, Wrench } from 'lucide-react'
import type { SectionId } from './types'

export const NAV_ITEMS: { id: SectionId; icon: typeof Microscope }[] = [
  { id: 'about', icon: Microscope },
  { id: 'publication', icon: BookOpen },
  { id: 'methods', icon: FlaskConical },
  { id: 'tools', icon: Wrench },
  { id: 'wellness', icon: Activity },
]

export function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
