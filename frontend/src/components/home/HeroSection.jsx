import { useRef, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react'
import { initHeroTimeline } from '../../animations/heroTimeline'
import Button from '../ui/Button'

// Lazy-load the heavy 3D canvas
const PizzaCanvas = lazy(() => import('./PizzaCanvas'))

export default function HeroSection() {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = initHeroTimeline(heroRef.current)
    return () => ctx?.revert()
  }, [])

  const stats = [
    { icon: Star, value: '4.9★', label: 'Rating' },
    { icon: Clock, value: '25 min', label: 'Avg Delivery' },
    { icon: MapPin, value: '12+ Zones', label: 'Karachi' },
  ]

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      id="hero"
    >
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary w-[600px] h-[600px] top-[-100px] right-[-100px] opacity-60" />
      <div className="glow-orb glow-orb-secondary w-[400px] h-[400px] bottom-[-50px] left-[-80px] opacity-40" />

      {/* 3D Canvas (right half) */}
      <Suspense fallback={null}>
        <PizzaCanvas />
      </Suspense>

      {/* Content */}
      <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen">
        <div className="space-y-6">
          {/* Badge */}
          <motion.div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-primary/30">
            <span className="w-2 h-2 rounded-full bg-neon-primary animate-pulse" />
            <span className="text-neon-primary text-xs font-display font-semibold tracking-wider uppercase">
              Now Delivering in Karachi
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="hero-title font-display font-bold leading-[1.05] tracking-tight">
            <span className="text-5xl sm:text-6xl xl:text-7xl text-white block">
              Pizza That
            </span>
            <span className="text-5xl sm:text-6xl xl:text-7xl block neon-text">
              Hits Different.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-text-secondary text-lg sm:text-xl font-body leading-relaxed max-w-md">
            Sitara's fire-kissed pizzas and legendary crispy fried chicken — crafted for Karachi's night owls and flavor hunters.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-wrap gap-3">
            <Link to="/menu" id="hero-order-btn">
              <Button
                variant="neon"
                size="lg"
                className="group"
              >
                Order Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/menu?category=deals" id="hero-deals-btn">
              <Button variant="outline" size="lg">
                🔥 Today's Deals
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats flex flex-wrap gap-4 pt-2">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/8"
              >
                <Icon className="w-4 h-4 text-neon-primary" />
                <div>
                  <div className="font-display font-bold text-sm text-white">{value}</div>
                  <div className="text-text-muted text-xs font-body">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: 3D canvas fills this space on desktop */}
        <div className="hidden lg:block" aria-hidden="true" />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float opacity-60">
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-neon-primary animate-bounce" />
        </div>
      </div>
    </section>
  )
}
