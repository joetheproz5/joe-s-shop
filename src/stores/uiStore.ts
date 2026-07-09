import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  searchOpen: boolean
  quickViewOpen: boolean
  quickViewProductId: string | null
  compareProducts: string[]
  isHydrated: boolean

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapse: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileMenu: () => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleSearch: () => void
  setSearchOpen: (open: boolean) => void
  openQuickView: (productId: string) => void
  closeQuickView: () => void
  addToCompare: (productId: string) => void
  removeFromCompare: (productId: string) => void
  isInCompare: (productId: string) => boolean
  clearCompare: () => void
}

export const useUIStore = create<UIStore>()((set, get) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchOpen: false,
  quickViewOpen: false,
  quickViewProductId: null,
  compareProducts: [],
  isHydrated: true,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),

  openQuickView: (productId) => set({ quickViewOpen: true, quickViewProductId: productId }),
  closeQuickView: () => set({ quickViewOpen: false, quickViewProductId: null }),

  addToCompare: (productId) => {
    set((s) => {
      if (s.compareProducts.includes(productId) || s.compareProducts.length >= 4) return s
      return { compareProducts: [...s.compareProducts, productId] }
    })
  },

  removeFromCompare: (productId) => {
    set((s) => ({
      compareProducts: s.compareProducts.filter((id) => id !== productId),
    }))
  },

  isInCompare: (productId) => get().compareProducts.includes(productId),

  clearCompare: () => set({ compareProducts: [] }),
}))
