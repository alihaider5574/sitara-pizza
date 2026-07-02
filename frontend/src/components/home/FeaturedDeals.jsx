import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Tag } from 'lucide-react'
import { initSectionReveal } from '../../animations/heroTimeline'
import { mockMenuItems } from '../../data/mockMenu'
import GlowCard from '../ui/GlowCard'

const deals = mockMenuItems.filter(
  (item) => item.tags?.includes('bestseller')
).slice(0, 4)

function DealCard({ item, index }) {
  const discount = index % 2 === 0 ? 20 : 15

  return (
    <GlowCard className="reveal-item overflow-hidden group">
      {/* Image area */}
      <div className="relative h-44 bg-gradient-to-br from-bg-elevated to-bg-surface flex items-center justify-center overflow-hidden">
        {/* Placeholder gradient food image */}
        <div className="w-24 h-24 rounded-full bg-gradient-neon opacity-20 group-hover:opacity-30 transition-opacity animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {item.category_id === 'cat-1' ? '🍕' :
           item.category_id === 'cat-2' ? '🍗' :
           item.category_id === 'cat-3' ? '🎁' : '🍟'}
        </div>
        {/* Discount badge */}
        <div className="absolute top-3 right-3 badge-hot flex items-center gap-1">
          <Tag className="w-2.5 h-2.5" /> {discount}% OFF
        </div>
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-text-primary text-sm line-clamp-1 mb-1">
          {item.name}
        </h3>
        <p className="text-text-muted text-xs font-body line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs line-through font-body">
              PKR {item.base_price.toLocaleString()}
            </span>
            <span className="text-brand-primary font-display font-bold text-base">
              PKR {Math.round(item.base_price * (1 - discount / 100)).toLocaleString()}
            </span>
          </div>
          <Link
            to={`/menu`}
            id={`deal-card-${item.id}`}
            className="text-xs font-display font-semibold text-brand-primary hover:text-text-primary transition-colors flex items-center gap-1"
          >
            Order <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </GlowCard>
  )
}

export default function FeaturedDeals() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = initSectionReveal(sectionRef.current)
    return () => ctx?.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 relative" id="featured-deals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 mb-3">
              <span className="text-brand-primary text-xs font-display font-bold uppercase tracking-wider">
                🔥 Hot Deals
              </span>
            </div>
            <h2 className="section-title text-3xl sm:text-4xl text-text-primary">
              Today's Best <span className="neon-text">Offers</span>
            </h2>
            <p className="text-text-secondary text-sm font-body mt-2">
              Limited-time discounts on our bestsellers. Order before they're gone.
            </p>
          </div>
          <Link
            to="/menu?category=deals"
            id="view-all-deals-btn"
            className="hidden sm:flex items-center gap-2 text-brand-primary hover:text-text-primary font-display font-semibold text-sm transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Deal cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((item, index) => (
            <DealCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="flex justify-center mt-6 sm:hidden">
          <Link
            to="/menu?category=deals"
            id="mobile-view-all-deals-btn"
            className="flex items-center gap-2 text-brand-primary font-display font-semibold text-sm"
          >
            View All Deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
