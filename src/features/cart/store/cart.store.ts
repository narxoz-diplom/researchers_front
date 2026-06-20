import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  title: string
  coverUrl?: string
  priceCents: number
  category: string
}

interface CartState {
  items: CartItem[]
  bumpToken: number
  addItem: (item: CartItem) => boolean
  removeItem: (id: string) => void
  clear: () => void
  hasItem: (id: string) => boolean
}

const CART_STORAGE_KEY = 'researchers-cart-v1'
const LEGACY_CART_STORAGE_KEY = 'academis-cart-v1'

function migrateLegacyCartStorage() {
  if (typeof window === 'undefined') return
  try {
    const legacy = localStorage.getItem(LEGACY_CART_STORAGE_KEY)
    if (legacy && !localStorage.getItem(CART_STORAGE_KEY)) {
      localStorage.setItem(CART_STORAGE_KEY, legacy)
    }
    if (legacy) {
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
    }
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
        if (get().items.some((i) => i.id === item.id)) {
          return false
        }
        set((state) => ({
          items: [...state.items, item],
          bumpToken: state.bumpToken + 1,
        }))
        return true
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clear: () => set({ items: [] }),
      hasItem: (id) => get().items.some((i) => i.id === id),
    }),
    { name: CART_STORAGE_KEY },
  ),
)
