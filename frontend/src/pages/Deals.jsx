import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tag, ArrowRight, Flame, Clock, ShoppingCart, Percent } from 'lucide-react'
import { pageVariants, staggerContainer, staggerItem } from '../animations/pageTransitions'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/apiClient'
import useCartStore from '../store/cartStore'
import { toast } from 'react-hot-toast'
import Button from '../components/ui/Button'

export default function Deals() {
  const { addItem } = useCartStore()

  // Fetch menu items in the "deals" category
  const { data: dealItems = [], isLoading } = useQuery({
    queryKey: ['menuDeals'],
    queryFn: async () => {
      const res = await apiClient.get('/api/menu', { params: { category: 'deals' } })
      return res.data
    },
  })

  // Also fetch combo items
  const { data: comboItems = [] } = useQuery({
    queryKey: ['menuCombos'],
    queryFn: async () => {
      const res = await apiClient.get('/api/menu', { params: { category: 'combos' } })
      return res.data
    },
  })

  // Fetch promo codes to display
  const { data: promos = [] } = useQuery({
    queryKey: ['publicPromos'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/promo/active')
        return res.data
      } catch {
        return []
      }
    },
  })

  const allDeals = [...dealItems, ...comboItems]

  const handleQuickAdd = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      image_url: item.image_url,
      base_price: item.base_price,
      variant: item.variants?.[0] || null,
      addons: [],
      quantity: 1,
    })
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-20 pb-16 min-h-screen"
    >
      {/* Hero banner */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/25 mb-6"
            >
              <Flame className="w-4 h-4 text-brand-primary" />
              <span className="text-brand-primary text-sm font-display font-bold uppercase tracking-wider">
                Hot Deals
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display font-bold text-4xl sm:text-5xl text-text-primary mb-4 leading-tight"
            >
              Today's Best{' '}
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Offers
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-text-secondary font-body text-lg max-w-xl mx-auto"
            >
              Unbeatable deals on our most popular items. Grab them before they're gone!
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Active Promo Codes */}
        {promos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="font-display font-bold text-xl text-text-primary mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-brand-primary" /> Promo Codes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promos.map((promo) => (
                <div key={promo.code} className="glass-card p-5 flex items-center gap-4 border-l-4 border-brand-primary">
                  <div className="flex-1">
                    <code className="font-mono text-brand-primary text-lg font-bold bg-brand-primary/10 px-3 py-1 rounded-lg">
                      {promo.code}
                    </code>
                    <p className="text-text-secondary text-sm font-body mt-2">
                      {promo.discount_percent
                        ? `${promo.discount_percent}% off`
                        : `PKR ${Number(promo.discount_flat).toLocaleString()} off`}
                      {promo.min_order_amount > 0 && ` on orders above PKR ${Number(promo.min_order_amount).toLocaleString()}`}
                    </p>
                  </div>
                  <Tag className="w-8 h-8 text-brand-primary/30" />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Deals grid */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-xl text-text-primary mb-6 flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-primary" /> Deals & Combos
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-72 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : allDeals.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-display font-bold text-text-primary text-xl mb-2">No Deals Available Right Now</h3>
              <p className="text-text-secondary font-body mb-6">Check back soon for amazing offers!</p>
              <Link to="/menu">
                <Button variant="neon" id="deals-browse-menu">
                  Browse Full Menu <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {allDeals.map((item, index) => {
                const discount = index % 3 === 0 ? 25 : index % 3 === 1 ? 20 : 15
                const discountedPrice = Math.round(item.base_price * (1 - discount / 100))
                return (
                  <motion.div
                    key={item.id}
                    variants={staggerItem}
                    className="glass-card overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    {/* Image / placeholder */}
                    <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-6xl">
                          {item.category?.slug === 'pizza' || item.category_id?.includes?.('pizza') ? '🍕' :
                           item.category?.slug === 'fried-chicken' ? '🍗' :
                           item.category?.slug === 'combos' ? '🎁' :
                           item.category?.slug === 'deals' ? '🔥' : '🍟'}
                        </div>
                      )}
                      {/* Discount badge */}
                      <div className="absolute top-3 right-3 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-display font-bold flex items-center gap-1 shadow-md">
                        <Tag className="w-3 h-3" /> {discount}% OFF
                      </div>
                      {/* Timer badge */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-text-primary px-2 py-1 rounded-lg text-[10px] font-body font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-primary" /> Limited Time
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                    </div>

                    <div className="p-5">
                      <h3 className="font-display font-bold text-text-primary text-base line-clamp-1 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-text-secondary text-xs font-body line-clamp-2 mb-4">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary text-sm line-through font-body">
                            PKR {item.base_price.toLocaleString()}
                          </span>
                          <span className="text-brand-primary font-display font-bold text-lg">
                            PKR {discountedPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/menu/${item.id}`}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-text-secondary hover:text-text-primary"
                            title="View details"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleQuickAdd(item)}
                            className="w-8 h-8 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 flex items-center justify-center transition-colors text-brand-primary"
                            title="Quick add to cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="glass-card p-10 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-display font-bold text-2xl text-text-primary mb-3">
                Can't find what you're looking for?
              </h2>
              <p className="text-text-secondary font-body mb-6">
                Check out our full menu with pizzas, fried chicken, sides, and more!
              </p>
              <Link to="/menu">
                <Button variant="neon" size="lg" id="deals-cta-menu">
                  Browse Full Menu <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
