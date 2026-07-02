import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, User, Zap } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { items, openCart } = useCartStore()
  const { user } = useAuth()
  const location = useLocation()

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/deals', label: '🔥 Deals' },
    { to: '/track', label: 'Track Order' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-white/5 shadow-[0_4px_32px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-primary to-neon-secondary flex items-center justify-center animate-pulse-glow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white group-hover:neon-text transition-all">
            Sitara
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium font-body transition-all ${
                  isActive
                    ? 'text-neon-primary bg-neon-primary/10'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            id="nav-cart-btn"
            onClick={openCart}
            className="relative p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-primary text-white text-xs font-bold flex items-center justify-center animate-bounce-subtle"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User */}
          <Link
            to={user ? '/account' : '/login'}
            id="nav-user-btn"
            className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all"
            aria-label={user ? 'Account' : 'Login'}
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Order Now CTA */}
          <Link
            to="/menu"
            id="nav-order-btn"
            className="hidden sm:flex btn-neon px-4 py-2 text-sm items-center gap-1 rounded-lg"
          >
            Order Now
          </Link>

          {/* Mobile menu toggle */}
          <button
            id="nav-mobile-toggle"
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden glass border-t border-white/5 px-4 pb-4"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl my-1 font-body text-sm transition-all ${
                    isActive
                      ? 'text-neon-primary bg-neon-primary/10 font-semibold'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/menu"
              className="btn-neon mt-2 w-full flex items-center justify-center py-3 text-sm"
            >
              Order Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
