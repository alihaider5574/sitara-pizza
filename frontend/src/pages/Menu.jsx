import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { pageVariants, staggerContainer, staggerItem } from '../animations/pageTransitions'
import CategoryTabs from '../components/menu/CategoryTabs'
import MenuItemCard from '../components/menu/MenuItemCard'
import ItemCustomizeModal from '../components/menu/ItemCustomizeModal'
import { MenuItemCardSkeleton } from '../components/ui/Skeleton'
import { mockCategories, mockMenuItems } from '../data/mockMenu'

const ALL_CAT = { id: 'all', name: 'All', slug: 'all', sort_order: -1 }

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [customizeItem, setCustomizeItem] = useState(null)

  const activeCategory = searchParams.get('category') || 'all'

  const categories = [ALL_CAT, ...mockCategories]

  const filteredItems = useMemo(() => {
    let items = mockMenuItems
    if (activeCategory !== 'all') {
      const cat = mockCategories.find((c) => c.slug === activeCategory)
      if (cat) items = items.filter((i) => i.category_id === cat.id)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      )
    }
    return items
  }, [activeCategory, search])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary mb-2">
            Our <span className="neon-text">Menu</span>
          </h1>
          <p className="text-text-secondary font-body">
            Browse all items — pizza, fried chicken, combos, sides & drinks.
          </p>
        </div>

        {/* Sticky filter bar */}
        <div className="sticky top-16 z-40 bg-bg-base/80 backdrop-blur-md pb-4 mb-6 space-y-4">
          {/* Category tabs */}
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onChange={(slug) => {
              setSearchParams(slug === 'all' ? {} : { category: slug })
            }}
          />

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="menu-search-input"
              type="text"
              placeholder="Search pizza, chicken..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-surface border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted font-body focus:border-neon-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Results count */}
        <p className="text-text-muted text-xs font-body mb-4">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </p>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div
              key={activeCategory + search}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredItems.map((item) => (
                <motion.div key={item.id} variants={staggerItem}>
                  <MenuItemCard item={item} onCustomize={setCustomizeItem} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display font-semibold text-text-primary text-lg mb-2">
                No items found
              </h3>
              <p className="text-text-muted font-body text-sm">
                Try a different search or category
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item customize modal */}
      <ItemCustomizeModal
        item={customizeItem}
        isOpen={!!customizeItem}
        onClose={() => setCustomizeItem(null)}
      />
    </motion.div>
  )
}
