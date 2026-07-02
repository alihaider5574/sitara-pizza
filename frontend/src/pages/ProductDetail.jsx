import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Minus, Plus, ShoppingCart } from 'lucide-react'
import apiClient from '../lib/apiClient'
import useCartStore from '../store/cartStore'
import Button from '../components/ui/Button'
import { toast } from 'react-hot-toast'
import { pageVariants } from '../animations/pageTransitions'

const CATEGORY_EMOJI = {
  'pizza': '🍕',
  'fried-chicken': '🍗',
  'combos': '🎁',
  'sides': '🍟',
  'drinks': '🥤',
  'deals': '🔥',
}

export default function ProductDetail() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCartStore()

  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [quantity, setQuantity] = useState(1)

  // Fetch full item details (variants + addons + category)
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['product', itemId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/menu/${itemId}`)
      return res.data
    },
    enabled: !!itemId
  })

  // Set default variant when item data loads
  useEffect(() => {
    if (item?.variants?.length > 0) {
      setSelectedVariant(item.variants[0])
    }
  }, [item])

  if (isLoading) {
    return (
      <div className="page-bg min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse space-y-6 max-w-4xl w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 w-3/4 rounded" />
            <div className="h-4 bg-gray-200 w-1/2 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="page-bg min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-display font-bold text-text-primary text-2xl mb-2">Product Not Found</h2>
        <p className="text-text-secondary font-body mb-6">The product you're looking for doesn't exist or is unavailable.</p>
        <Link to="/menu">
          <Button variant="neon">Browse Menu</Button>
        </Link>
      </div>
    )
  }

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const basePrice = item.base_price
  const variantDelta = selectedVariant?.price_delta || 0
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const unitPrice = basePrice + variantDelta + addonsTotal
  const totalPrice = unitPrice * quantity

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
    toast.success(`${item.name} added to cart!`)
    navigate('/menu')
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-24 pb-12 min-h-screen"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 font-display font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image/Emoji Container */}
          <div className="glass-card overflow-hidden h-[300px] md:h-[450px] flex items-center justify-center relative bg-gradient-to-br from-bg-elevated to-bg-surface">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[120px] select-none">
                {CATEGORY_EMOJI[item.category?.slug] || '🍕'}
              </span>
            )}

            {/* Spicy Badge */}
            {item.is_spicy && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 text-xs font-bold">
                <Flame className="w-3.5 h-3.5" /> Spicy
              </div>
            )}
          </div>

          {/* Right Column: Customization Details */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-brand-primary">
                {item.category?.name || 'Fast Food'}
              </span>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary mt-1 mb-2">
                {item.name}
              </h1>
              <div className="text-2xl font-display font-bold text-brand-primary">
                PKR {unitPrice.toLocaleString()}
              </div>
            </div>

            {item.description && (
              <p className="text-text-secondary font-body text-sm leading-relaxed">
                {item.description}
              </p>
            )}

            <hr className="border-gray-200" />

            {/* Variants */}
            {item.variants?.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-text-primary text-sm mb-3">Choose Size</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/10 text-text-primary'
                            : 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'
                        }`}
                      >
                        <span className="font-body text-sm font-semibold">{variant.name}</span>
                        <span className={`font-display font-bold text-xs ${isSelected ? 'text-brand-primary' : 'text-text-secondary'}`}>
                          {variant.price_delta > 0 ? `+PKR ${variant.price_delta}` : 'Base Price'}
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
                <h3 className="font-display font-semibold text-text-primary text-sm mb-3">Add-ons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.addons.map((addon) => {
                    const isChecked = !!selectedAddons.find((a) => a.id === addon.id)
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isChecked
                            ? 'border-brand-secondary bg-brand-secondary/10 text-text-primary'
                            : 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                            isChecked ? 'bg-brand-secondary border-brand-secondary' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Plus className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-body text-sm font-semibold">{addon.name}</span>
                        </div>
                        <span className="font-display font-bold text-xs text-brand-secondary">
                          +PKR {addon.price}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <hr className="border-gray-200" />

            {/* Quantity and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="font-display font-semibold text-text-primary text-sm">Quantity</span>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-2 py-1 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-display font-bold text-text-primary w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-8 h-8 flex items-center justify-center text-brand-primary hover:text-brand-primary-hover hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Button
                variant="neon"
                size="lg"
                onClick={handleAddToCart}
                disabled={!item.is_available}
                className="flex-1 group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:animate-bounce-subtle" />
                Add to Cart — PKR {totalPrice.toLocaleString()}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
