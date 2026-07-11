import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '@/types'
import { supabase } from '@/lib/supabase'

interface CartStore {
  items: CartItem[]
  isHydrated: boolean

  // Local cart actions (for guests)
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => number
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  clearCart: () => void

  // Computed
  getItemCount: () => number
  getSubtotal: () => number
  getTax: () => number
  getShipping: () => number
  getTotal: () => number

  // Sync with Supabase (for logged-in users)
  syncToServer: (userId: string) => Promise<void>
  loadFromServer: (userId: string) => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (product, variant, quantity = 1) => {
        let addedQuantity = 0
        set((state) => {
          const available = Math.max(0, variant?.stock_quantity ?? product.stock_quantity)
          const requested = Math.max(1, Math.floor(quantity))
          if (available <= 0) return state
          const existing = state.items.find(
            (item) => item.product_id === product.id && item.variant_id === (variant?.id)
          )

          if (existing) {
            const nextQuantity = Math.min(existing.quantity + requested, available)
            addedQuantity = Math.max(0, nextQuantity - existing.quantity)
            return {
              items: state.items.map((item) =>
                item.product_id === product.id && item.variant_id === variant?.id
                  ? { ...item, quantity: nextQuantity }
                  : item
              ),
            }
          }

          const initialQuantity = Math.min(requested, available)
          if (initialQuantity <= 0) return state
          addedQuantity = initialQuantity

          return {
            items: [
              ...state.items,
              {
                id: `${product.id}-${variant?.id || 'default'}-${Date.now()}`,
                user_id: '',
                product_id: product.id,
                variant_id: variant?.id,
                quantity: initialQuantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                product,
                variant,
              },
            ],
          }
        })
        return addedQuantity
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product_id === productId && item.variant_id === variantId)
          ),
        }))
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        const target = get().items.find((item) => item.product_id === productId && item.variant_id === variantId)
        const available = Math.max(0, target?.variant?.stock_quantity ?? target?.product?.stock_quantity ?? quantity)
        if (available <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId && item.variant_id === variantId
              ? {
                  ...item,
                  quantity: Math.min(Math.max(1, Math.floor(quantity)), available),
                }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.selling_price || 0
          return sum + price * item.quantity
        }, 0),

      getTax: () => get().getSubtotal() * 0.1, // 10% tax

      getShipping: () => {
        const subtotal = get().getSubtotal()
        if (subtotal === 0) return 0
        return subtotal > 100 ? 0 : 9.99
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const tax = get().getTax()
        const shipping = get().getShipping()
        return subtotal + tax + shipping
      },

      syncToServer: async (userId) => {
        const { items } = get()
        for (const item of items) {
          await supabase.from('cart_items').upsert({
            user_id: userId,
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            quantity: item.quantity,
          }, { onConflict: 'user_id,product_id,variant_id' })
        }
      },

      loadFromServer: async (userId) => {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*, product:products(*), variant:product_variants(*)')
          .eq('user_id', userId)

        if (!error && data) {
          set({ items: data as CartItem[], isHydrated: true })
        }
      },
    }),
    {
      name: 'joes-shop-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true
      },
    }
  )
)
