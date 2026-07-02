import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, ShoppingCart, X, Flame } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import useCartStore from '../../store/cartStore'

export default function ItemCustomizeModal({ item, isOpen, onClose }) {
  const { addItem } = useCartStore()
  const [selectedVariant, setSelectedVariant] = useState(item?.variants?.[0] || null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [quantity, setQuantity] = useState(1)

  if (!item) return null

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const totalPrice = (
    (item.base_price + (selectedVariant?.price_delta || 0)) +
    selectedAddons.reduce((sum, a) => sum + a.price, 0)
  ) * quantity

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      image_url: item.image_url,
      base_price: item.base_price,
      variant: selectedVariant,
      addons: selectedAddons,
      quantity,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name} size="md" id="customize-modal">
      <div className="space-y-5">
        {/* Item description */}
        {item.description && (
          <p className="text-text-secondary text-sm font-body leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Spicy badge */}
        {item.is_spicy && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold">
            <Flame className="w-3 h-3" /> Spicy
          </div>
        )}

        {/* Variants */}
        {item.variants?.length > 0 && (
          <div>
            <h4 className="font-display font-semibold text-text-primary text-sm mb-3">Choose Size</h4>
            <div className="grid grid-cols-1 gap-2">
              {item.variants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id
                return (
                  <button
                    key={variant.id}
                    id={`variant-${variant.id}`}
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-neon-primary bg-neon-primary/10 text-text-primary'
                        : 'border-white/8 bg-white/3 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    <span className="font-body text-sm">{variant.name}</span>
                    <span className={`font-display font-semibold text-sm ${isSelected ? 'text-neon-primary' : ''}`}>
                      {variant.price_delta > 0 ? `+PKR ${variant.price_delta}` : 'Base'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Addons */}
        {item.addons?.length > 0 && (
          <div>
            <h4 className="font-display font-semibold text-text-primary text-sm mb-3">
              Add-ons <span className="text-text-muted font-body font-normal">(optional)</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {item.addons.map((addon) => {
                const isChecked = !!selectedAddons.find((a) => a.id === addon.id)
                return (
                  <button
                    key={addon.id}
                    id={`addon-${addon.id}`}
                    onClick={() => toggleAddon(addon)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isChecked
                        ? 'border-neon-secondary bg-neon-secondary/10 text-text-primary'
                        : 'border-white/8 bg-white/3 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-sm border transition-all flex items-center justify-center ${
                        isChecked ? 'bg-neon-secondary border-neon-secondary' : 'border-white/25'
                      }`}>
                        {isChecked && <X className="w-3 h-3 text-text-primary" style={{ transform: 'rotate(45deg)' }} />}
                      </div>
                      <span className="font-body text-sm">{addon.name}</span>
                    </div>
                    <span className={`font-display font-semibold text-sm ${isChecked ? 'text-neon-secondary' : ''}`}>
                      +PKR {addon.price}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-4">
          <span className="font-display font-semibold text-text-primary text-sm">Quantity</span>
          <div className="flex items-center gap-3 glass rounded-xl px-1">
            <button
              id="qty-decrease"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-display font-bold text-text-primary w-6 text-center">{quantity}</span>
            <button
              id="qty-increase"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="w-8 h-8 flex items-center justify-center text-neon-primary hover:text-text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="neon-divider" />

        {/* Add to cart button */}
        <Button
          id="modal-add-to-cart"
          variant="neon"
          fullWidth
          size="lg"
          onClick={handleAddToCart}
          className="group"
        >
          <ShoppingCart className="w-4 h-4 group-hover:animate-bounce-subtle" />
          Add to Cart — PKR {totalPrice.toLocaleString()}
        </Button>
      </div>
    </Modal>
  )
}
