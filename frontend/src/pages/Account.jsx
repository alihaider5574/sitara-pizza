import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, MapPin, LogOut, Star } from 'lucide-react'
import { pageVariants } from '../animations/pageTransitions'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

function LoyaltyRing({ points = 0, maxPoints = 1000 }) {
  const pct = Math.min(points / maxPoints, 1)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none"
            stroke="url(#loyaltyGradient)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
          <defs>
            <linearGradient id="loyaltyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4D2E" />
              <stop offset="100%" stopColor="#7B2FFF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Star className="w-4 h-4 text-neon-primary mb-0.5" />
          <span className="font-display font-bold text-text-primary text-sm">{points}</span>
          <span className="text-text-muted text-[10px] font-body">pts</span>
        </div>
      </div>
      <p className="text-text-muted text-xs font-body mt-2">Loyalty Points</p>
    </div>
  )
}

export default function Account() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && !user) {
    navigate('/login')
    return null
  }

  const mockOrders = [
    { id: 'ord-abc123', status: 'delivered', total: 1299, created_at: '2026-07-01T18:30:00Z', items: 3 },
    { id: 'ord-def456', status: 'delivered', total: 799, created_at: '2026-06-28T20:15:00Z', items: 1 },
    { id: 'ord-ghi789', status: 'cancelled', total: 2499, created_at: '2026-06-25T12:00:00Z', items: 5 },
  ]

  const STATUS_COLORS = {
    delivered: 'text-green-400 bg-green-400/10',
    pending: 'text-yellow-400 bg-yellow-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    preparing: 'text-neon-primary bg-neon-primary/10',
    out_for_delivery: 'text-neon-cyan bg-neon-cyan/10',
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-20 pb-12 min-h-screen"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile header */}
        <div className="glass-card p-6 mb-6 flex items-center gap-6 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-neon flex items-center justify-center text-text-primary font-display font-bold text-2xl shadow-glow-primary flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-text-primary">
              {user?.user_metadata?.full_name || 'Sitara Customer'}
            </h1>
            <p className="text-text-secondary font-body text-sm">{user?.email}</p>
          </div>
          <LoyaltyRing points={320} maxPoints={1000} />
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => { await signOut(); navigate('/') }}
            id="account-signout-btn"
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        {/* Order history */}
        <h2 className="font-display font-bold text-text-primary text-lg mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-neon-primary" />
          Order History
        </h2>

        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div key={order.id} className="glass-card p-5 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-display font-semibold text-text-primary text-sm font-mono">
                    #{order.id.slice(4).toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[order.status] || 'text-text-muted bg-gray-100'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-text-muted font-body text-xs">
                  {order.items} items · {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-neon-primary">
                  PKR {order.total.toLocaleString()}
                </div>
                <Link
                  to={`/track/${order.id}`}
                  id={`account-track-${order.id}`}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors font-body"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
