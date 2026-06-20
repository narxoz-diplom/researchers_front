import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItemType = 'course' | 'lesson'

export interface CartItem {
  type: CartItemType
  id: string
  courseId: string
  title: string
  coverUrl?: string
  priceCents: number
  category: string
}

interface CartState {
  items: CartItem[]
  bumpToken: number
  addItem: (item: CartItem) => boolean
  removeItem: (type: CartItemType, id: string) => void
  clear: () => void
  hasItem: (type: CartItemType, id: string) => boolean
}

const CART_STORAGE_KEY = 'researchers-cart-v3'
const LEGACY_CART_STORAGE_KEY = 'researchers-cart-v2'

export function cartItemKey(type: CartItemType, id: string) {
  return `${type}:${id}`
}

function migrateLegacyCartStorage() {
  if (typeof window === 'undefined') return
  try {
    const legacyV1 = localStorage.getItem('researchers-cart-v1')
    const legacyV2 = localStorage.getItem(LEGACY_CART_STORAGE_KEY)
    const legacyRaw = legacyV2 ?? legacyV1
    if (legacyRaw && !localStorage.getItem(CART_STORAGE_KEY)) {
      const parsed = JSON.parse(legacyRaw) as {
        state?: { items?: Array<Record<string, unknown>> }
      }
      const legacyItems = parsed.state?.items ?? []
      const migrated: CartItem[] = legacyItems
        .filter((item) => item.type !== 'video')
        .map((item) => ({
          type: (item.type === 'lesson' ? 'lesson' : 'course') as CartItemType,
          id: String(item.id),
          courseId: String(item.courseId ?? item.id),
          title: String(item.title ?? ''),
          coverUrl: item.coverUrl ? String(item.coverUrl) : undefined,
          priceCents: Number(item.priceCents ?? 0),
          category: String(item.category ?? ''),
        }))
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ state: { items: migrated, bumpToken: 0 }, version: 0 }),
      )
    }
    if (legacyV1) localStorage.removeItem('researchers-cart-v1')
    if (legacyV2) localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
  } catch {
    // ignore quota / private mode errors
  }
}

migrateLegacyCartStorage()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      bumpToken: 0,
      addItem: (item) => {
        const key = cartItemKey(item.type, item.id)
        if (get().items.some((i) => cartItemKey(i.type, i.id) === key)) {
          return false
        }
        set((state) => ({
          items: [...state.items, item],
          bumpToken: state.bumpToken + 1,
        }))
        return true
      },
      removeItem: (type, id) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.type === type && i.id === id)),
        })),
      clear: () => set({ items: [] }),
      hasItem: (type, id) =>
        get().items.some((i) => i.type === type && i.id === id),
    }),
    { name: CART_STORAGE_KEY },
  ),
)
