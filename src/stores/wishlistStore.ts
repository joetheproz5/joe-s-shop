import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface WishlistStore {
  items: Product[]
  isHydrated: boolean

  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => boolean
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (product) => {
        set((state) => {
          if (state.items.find((p) => p.id === product.id)) return state
          return { items: [...state.items, product] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }))
      },

      toggleItem: (product) => {
        const { items } = get()
        if (items.find((p) => p.id === product.id)) {
          get().removeItem(product.id)
          return false
        } else {
          get().addItem(product)
          return true
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((p) => p.id === productId)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'joes-shop-wishlist',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true
      },
    }
  )
)
