import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import { slideInRight } from '../../animations/pageTransitions'
import Button from '../ui/Button'

const DELIVERY_FEE = 99

function CartItemRow({ item }) {
  const { updateQuantity, removeItem } = useCartStore()
  const addonTotal = (item.addons || []).reduce((s, a) => s + a.price, 0)
  const variantDelta = item.variant?.price_delta || 0
  const unitPrice = item.base_price + variantDelta + addonTotal

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className="flex gap-3 py-3 border-b border-white/5 last:border-none"
    >
      {/* Image */}
      <div className="w-14 h-14 rounded-xl bg-bg-elevated flex items-center justify-center flex-shrink-0 text-2xl">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
        ) : '🍕'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-white text-xs leading-snug line-clamp-1">
          {item.name}
        </h4>
        {item.variant && (
          <p className="text-text-muted text-[10px] font-body">{item.variant.name}</p>
        )}
        {item.addons?.length > 0 && (
          <p className="text-text-muted text-[10px] font-body">
            + {item.addons.map((a) => a.name).join(', ')}
          </p>
        )}

        <div className="flex items-center justify-between mt-1.5">
          {/* Qty stepper */}
          <div className="flex items-center gap-2 glass rounded-lg px-1">
            <button
              id={`cart-qty-dec-${item._key}`}
              onClick={() => updateQuantity(item._key, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-display font-bold text-white text-xs w-4 text-center">
              {item.quantity}
            </span>
            <button
              id={`cart-qty-inc-${item._key}`}
              onClick={() => updateQuantity(item._key, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-neon-primary hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-neon-primary text-xs">
              PKR {(unitPrice * item.quantity).toLocaleString()}
            </span>
            <button
              id={`cart-remove-${item._key}`}
              onClick={() => removeItem(item._key)}
              className="text-text-muted hover:text-red-400 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, clearCart } = useCartStore()

  const subtotal = items.reduce((sum, item) => {
    const addonTotal = (item.addons || []).reduce((s, a) => s + a.price, 0)
    const variantDelta = item.variant?.price_delta || 0
    return sum + (item.base_price + variantDelta + addonTotal) * item.quantity
  }, 0)

  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            id="cart-drawer"
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-[110] flex flex-col"
            style={{ background: '#12121C', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neon-primary" />
                <h2 className="font-display font-bold text-white">
                  Your Cart
                  {items.length > 0 && (
                    <span className="ml-2 text-sm text-text-secondary font-body font-normal">
                      ({items.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    id="cart-clear-btn"
                    onClick={clearCart}
                    className="text-text-muted hover:text-red-400 text-xs font-body transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  id="cart-close-btn"
                  onClick={closeCart}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <span className="text-6xl">🛒</span>
                  <div>
                    <p className="font-display font-semibold text-white text-base">Your cart is empty</p>
                    <p className="text-text-muted text-sm font-body mt-1">
                      Add items from the menu to get started
                    </p>
                  </div>
                  <Link to="/menu" id="cart-browse-menu-btn" onClick={closeCart}>
                    <Button variant="neon" size="sm">Browse Menu</Button>
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <CartItemRow key={item._key} item={item} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-white/5 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-white">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-text-secondary">Delivery</span>
                    <span className="text-white">PKR {DELIVERY_FEE}</span>
                  </div>
                  <div className="neon-divider" />
                  <div className="flex justify-between font-display font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-neon-primary text-lg">PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <Link to="/checkout" id="cart-checkout-btn" onClick={closeCart}>
                  <Button variant="neon" fullWidth size="lg" className="group">
                    Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
