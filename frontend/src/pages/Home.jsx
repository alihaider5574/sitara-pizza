import { motion } from 'framer-motion'
import { pageVariants } from '../animations/pageTransitions'
import HeroSection from '../components/home/HeroSection'
import FeaturedDeals from '../components/home/FeaturedDeals'
import AnimatedCounters from '../components/home/AnimatedCounters'

export default function Home() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg"
    >
      <HeroSection />
      <AnimatedCounters />
      <FeaturedDeals />

      {/* CTA banner */}
      <section className="py-20" id="cta-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card p-10 sm:p-14 text-center relative overflow-hidden">
            {/* Glow orbs */}
            <div className="glow-orb glow-orb-primary w-80 h-80 top-[-60px] right-[-60px] opacity-50" />
            <div className="glow-orb glow-orb-secondary w-64 h-64 bottom-[-40px] left-[-40px] opacity-40" />

            <div className="relative z-10">
              <span className="inline-block badge-hot mb-4 text-sm">Limited Time</span>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-text-primary mb-4 leading-tight">
                Use Code{' '}
                <span className="neon-text">SITARA20</span>
                <br />for 20% Off Your First Order
              </h2>
              <p className="text-text-secondary font-body text-lg mb-8 max-w-md mx-auto">
                New to Sitara? Get 20% off your first delivery. No minimum order required.
              </p>
              <a href="/menu" id="cta-banner-order-btn">
                <button className="btn-neon px-8 py-4 text-base rounded-xl inline-flex items-center gap-2">
                  Claim Your Discount →
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
