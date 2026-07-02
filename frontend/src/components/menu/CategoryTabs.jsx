import { motion } from 'framer-motion'

export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Menu categories">
        {categories.map((cat) => {
          const isActive = active === cat.slug

          return (
            <button
              key={cat.id}
              id={`category-tab-${cat.slug}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cat.slug)}
              className={`relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-display font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-primary/50 ${
                isActive
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary bg-transparent border border-white/8 hover:border-white/20'
              }`}
            >
              {/* Active background with glow */}
              {isActive && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-gradient-neon shadow-glow-primary"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
