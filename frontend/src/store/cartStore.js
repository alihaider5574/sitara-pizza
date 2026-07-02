import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // ─── Actions ─────────────────────────────────────────────────────────
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item) => {
        // item: { id, name, image_url, base_price, variant, addons, quantity, notes }
        const { items } = get()
        // Create a unique key based on item + variant + addons
        const key = `${item.id}-${item.variant?.id || 'base'}-${(item.addons || []).map(a => a.id).sort().join(',')}`
        const existing = items.find((i) => i._key === key)

        if (existing) {
          set({
            items: items.map((i) =>
              i._key === key ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
            ),
          })
        } else {
          set({
            items: [...items, { ...item, _key: key, quantity: item.quantity || 1 }],
          })
        }
        set({ isOpen: true })
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i._key !== key) })),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i._key === key ? { ...i, quantity } : i)),
        }))
      },

      clearCart: () => set({ items: [] }),

      // ─── Computed ─────────────────────────────────────────────────────────
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, i) => {
          const addonTotal = (i.addons || []).reduce((a, addon) => a + addon.price, 0)
          const variantDelta = i.variant?.price_delta || 0
          return sum + (i.base_price + variantDelta + addonTotal) * i.quantity
        }, 0)
      },
    }),
    {
      name: 'sitara-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export default useCartStore
