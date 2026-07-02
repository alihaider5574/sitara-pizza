import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants } from '../animations/pageTransitions'
import OrderStatusTracker from '../components/order/OrderStatusTracker'
import { useRealtimeOrder } from '../hooks/useRealtimeOrder'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'

export default function OrderTracking() {
  const { orderId } = useParams()
  const { order, status, loading } = useRealtimeOrder(orderId)

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-20 pb-12 min-h-screen"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-text-primary mb-1">
            Track Your <span className="neon-text">Order</span>
          </h1>
          {orderId && (
            <p className="text-text-secondary font-body text-sm">
              Order <span className="text-text-primary font-mono">#{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="glass-card p-6 space-y-4">
            <div className="skeleton h-6 w-40 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !order ? (
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-text-primary text-lg mb-2">Order not found</h3>
            <p className="text-text-secondary font-body text-sm mb-6">
              We couldn't find this order. Check your order history.
            </p>
            <Link to="/account">
              <Button variant="outline" id="track-view-history">View Order History</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <OrderStatusTracker status={status} orderId={orderId} />

            {/* Order details card */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-text-primary text-sm mb-3">Order Details</h3>
              <div className="space-y-1.5 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">PKR {Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery Fee</span>
                  <span className="text-text-primary">PKR {Number(order.delivery_fee).toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-brand-accent">
                    <span>Promo Discount</span>
                    <span>- PKR {Number(order.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="neon-divider my-2" />
                <div className="flex justify-between font-display font-bold">
                  <span className="text-text-primary">Total</span>
                  <span className="text-brand-primary text-base">PKR {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {status === 'delivered' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 text-center"
              >
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-display font-bold text-text-primary text-lg mb-1">Enjoy your meal!</h3>
                <p className="text-text-secondary font-body text-sm mb-4">We hope it was amazing.</p>
                <Link to="/menu">
                  <Button variant="neon" id="track-reorder">Order Again</Button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
