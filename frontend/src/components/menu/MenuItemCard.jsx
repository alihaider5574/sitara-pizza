import { motion } from 'framer-motion'
import { Flame, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'

const TAG_LABELS = {
  bestseller: { label: 'Best Seller', cls: 'badge-hot' },
  new: { label: 'New', cls: 'badge-new' },
  vegetarian: { label: 'Veg', cls: 'badge-veg' },
}

const CATEGORY_EMOJI = {
  'cat-1': '🍕',
  'cat-2': '🍗',
  'cat-3': '🎁',
  'cat-4': '🍟',
  'cat-5': '🥤',
  'cat-6': '🔥',
}

export default function MenuItemCard({ item, onCustomize }) {
  const { addItem } = useCartStore()

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (item.variants?.length > 0 || item.addons?.length > 0) {
      // Has options — open customize modal
      onCustomize?.(item)
    } else {
      // Simple item — add directly
      addItem({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        base_price: item.base_price,
        variant: null,
        addons: [],
        quantity: 1,
      })
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card overflow-hidden group relative flex flex-col"
    >
      {/* Image */}
      <Link to={`/menu/${item.id}`} id={`menu-item-link-${item.id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-bg-elevated to-bg-surface flex items-center justify-center overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
              {CATEGORY_EMOJI[item.category_id] || '🍽️'}
            </span>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {item.tags?.map((tag) =>
              TAG_LABELS[tag] ? (
                <span key={tag} className={TAG_LABELS[tag].cls}>
                  {TAG_LABELS[tag].label}
                </span>
              ) : null
            )}
          </div>

          {/* Spicy indicator */}
          {item.is_spicy && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
              <Flame className="w-3 h-3 text-red-400" />
              <span className="text-red-400 text-xs font-bold">Spicy</span>
            </div>
          )}

          {/* Unavailable overlay */}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">Unavailable</span>
            </div>
          )}

          {/* Gradient fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/80 to-transparent" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/menu/${item.id}`} id={`menu-item-title-${item.id}`}>
          <h3 className="font-display font-semibold text-white text-sm leading-snug line-clamp-1 hover:text-neon-primary transition-colors mb-1">
            {item.name}
          </h3>
        </Link>
        <p className="text-text-muted text-xs font-body line-clamp-2 flex-1 mb-3">
          {item.description}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-neon-primary font-display font-bold text-base">
              PKR {item.base_price.toLocaleString()}
            </div>
            {item.variants?.length > 0 && (
              <div className="text-text-muted text-[10px] font-body">+ variants</div>
            )}
          </div>

          <motion.button
            id={`add-to-cart-${item.id}`}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickAdd}
            disabled={!item.is_available}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              item.is_available
                ? 'bg-neon-primary/15 border border-neon-primary/30 text-neon-primary hover:bg-neon-primary hover:text-white hover:shadow-glow-primary'
                : 'bg-white/5 border border-white/10 text-text-muted cursor-not-allowed'
            }`}
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
