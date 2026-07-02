import { motion } from 'framer-motion'
import { CheckCircle, Clock, ChefHat, Bike, Package } from 'lucide-react'

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, description: 'We received your order' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed by restaurant' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Our chefs are cooking' },
  { key: 'out_for_delivery', label: 'On the Way', icon: Bike, description: 'Rider is heading to you' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Enjoy your meal! 🎉' },
]

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default function OrderStatusTracker({ status = 'pending', orderId }) {
  const currentIndex = STATUS_ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-4xl mb-3">❌</div>
        <h3 className="font-display font-bold text-red-400 text-lg">Order Cancelled</h3>
        <p className="text-text-secondary text-sm font-body mt-1">
          Your order #{orderId?.slice(0, 8)} has been cancelled.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      {/* Order ID */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-text-primary">Live Order Status</h3>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/25">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-brand-accent text-xs font-bold">Live</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="space-y-0">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const isPending = index > currentIndex

          return (
            <div key={step.key} className="flex gap-4">
              {/* Icon + connector */}
              <div className="flex flex-col items-center">
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-brand-primary text-text-primary shadow-md'
                      : isActive
                      ? 'bg-brand-primary/20 border-2 border-brand-primary text-brand-primary animate-pulse-glow'
                      : 'bg-bg-elevated border border-gray-200 text-text-muted'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </motion.div>

                {/* Vertical connector */}
                {index < STEPS.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 min-h-[24px] transition-all duration-500 ${
                    isCompleted ? 'bg-brand-primary' : 'bg-white/8'
                  }`} />
                )}
              </div>

              {/* Label */}
              <div className={`pb-5 ${index === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <div className={`font-display font-semibold text-sm ${
                  isActive ? 'text-brand-primary' :
                  isCompleted ? 'text-text-primary' : 'text-text-muted'
                }`}>
                  {step.label}
                  {isActive && (
                    <span className="ml-2 text-[10px] font-body text-text-muted uppercase tracking-wider">
                      In progress
                    </span>
                  )}
                </div>
                <p className={`font-body text-xs mt-0.5 ${isActive || isCompleted ? 'text-text-secondary' : 'text-text-muted/50'}`}>
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
