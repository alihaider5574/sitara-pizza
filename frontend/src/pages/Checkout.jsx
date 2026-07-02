import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, CreditCard, CheckCircle, ChevronRight } from 'lucide-react'
import { pageVariants } from '../animations/pageTransitions'
import useCartStore from '../store/cartStore'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'

const STEPS = ['Address', 'Payment', 'Review']
const DELIVERY_FEE = 99

const addressSchema = z.object({
  address_line: z.string().min(10, 'Enter a full address'),
  city: z.string().min(2, 'Enter your city'),
  label: z.string().optional(),
})

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', description: 'Pay when we arrive' },
  { id: 'jazzcash', label: 'JazzCash', icon: '📱', description: 'Pay via JazzCash wallet' },
  { id: 'easypaisa', label: 'EasyPaisa', icon: '💚', description: 'Pay via EasyPaisa wallet' },
]

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, index) => {
        const isActive = index === step
        const isCompleted = index < step
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-semibold transition-all ${
              isActive ? 'bg-brand-primary text-text-primary shadow-md' :
              isCompleted ? 'bg-brand-primary/20 text-brand-primary' :
              'bg-bg-elevated text-text-muted'
            }`}>
              <span>{isCompleted ? '✓' : index + 1}</span>
              <span>{label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-text-muted" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Checkout() {
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [promoCode, setPromoCode] = useState('')
  const [placing, setPlacing] = useState(false)
  const { items, clearCart } = useCartStore()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
  })

  const subtotal = items.reduce((sum, item) => {
    const addonTotal = (item.addons || []).reduce((s, a) => s + a.price, 0)
    const variantDelta = item.variant?.price_delta || 0
    return sum + (item.base_price + variantDelta + addonTotal) * item.quantity
  }, 0)

  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0)

  const onAddressSubmit = (data) => {
    setAddress(data)
    setStep(1)
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    
    const orderData = {
      items: items.map(item => ({
        menu_item_id: item.id,
        variant_id: item.variant?.id || null,
        quantity: item.quantity,
        addon_ids: (item.addons || []).map(a => a.id),
        notes: item.notes || null,
      })),
      address_id: "00000000-0000-0000-0000-000000000000", // fallback default address
      promo_code: promoCode || null,
      payment_method: paymentMethod,
      notes: null,
    }

    try {
      const res = await apiClient.post('/api/orders', orderData)
      clearCart()
      toast.success("Order placed successfully!")
      navigate(`/track/${res.data.order_id}`)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || "Failed to place order")
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-bg pt-24 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display font-bold text-text-primary text-xl mb-2">Your cart is empty</h2>
          <Button variant="neon" onClick={() => navigate('/menu')} id="checkout-back-to-menu">
            Browse Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-20 pb-12"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-2">Checkout</h1>
        <p className="text-text-secondary font-body mb-8">Complete your order below.</p>

        <StepIndicator step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 0: Address */}
              {step === 0 && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <MapPin className="w-5 h-5 text-brand-primary" />
                      <h2 className="font-display font-semibold text-text-primary">Delivery Address</h2>
                    </div>

                    <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-text-secondary text-xs font-body mb-1">
                          Address Label (optional)
                        </label>
                        <input
                          {...register('label')}
                          id="checkout-address-label"
                          placeholder="Home, Work, etc."
                          className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-xs font-body mb-1">
                          Full Address *
                        </label>
                        <textarea
                          {...register('address_line')}
                          id="checkout-address-line"
                          rows={3}
                          placeholder="Street, Building, Area..."
                          className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors resize-none"
                        />
                        {errors.address_line && (
                          <p className="text-red-400 text-xs mt-1">{errors.address_line.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-text-secondary text-xs font-body mb-1">
                          City *
                        </label>
                        <input
                          {...register('city')}
                          id="checkout-city"
                          placeholder="Karachi"
                          className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors"
                        />
                        {errors.city && (
                          <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        variant="neon"
                        fullWidth
                        id="checkout-next-payment"
                      >
                        Continue to Payment
                      </Button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <CreditCard className="w-5 h-5 text-brand-primary" />
                      <h2 className="font-display font-semibold text-text-primary">Payment Method</h2>
                    </div>

                    <div className="space-y-3 mb-6">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.id}
                          id={`payment-method-${method.id}`}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                            paymentMethod === method.id
                              ? 'border-brand-primary bg-brand-primary/10'
                              : 'border-white/8 hover:border-white/20'
                          }`}
                        >
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <div className={`font-display font-semibold text-sm ${paymentMethod === method.id ? 'text-brand-primary' : 'text-text-primary'}`}>
                              {method.label}
                            </div>
                            <div className="text-text-muted text-xs font-body">{method.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Promo code */}
                    <div className="mb-6">
                      <label className="block text-text-secondary text-xs font-body mb-1">
                        Promo Code (optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="checkout-promo-input"
                          type="text"
                          placeholder="SITARA20"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="flex-1 bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors uppercase"
                        />
                        <Button variant="outline" id="checkout-apply-promo">Apply</Button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setStep(0)}
                        id="checkout-back-address"
                      >
                        ← Back
                      </Button>
                      <Button
                        variant="neon"
                        fullWidth
                        onClick={() => setStep(2)}
                        id="checkout-next-review"
                      >
                        Review Order
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <CheckCircle className="w-5 h-5 text-brand-primary" />
                      <h2 className="font-display font-semibold text-text-primary">Review & Place Order</h2>
                    </div>

                    {/* Address summary */}
                    <div className="glass p-4 rounded-xl mb-4">
                      <div className="text-text-muted text-xs font-body mb-1 uppercase tracking-wider">Delivering To</div>
                      <div className="text-text-primary text-sm font-body">{address?.address_line}, {address?.city}</div>
                    </div>

                    {/* Payment summary */}
                    <div className="glass p-4 rounded-xl mb-6">
                      <div className="text-text-muted text-xs font-body mb-1 uppercase tracking-wider">Payment</div>
                      <div className="text-text-primary text-sm font-body">
                        {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setStep(1)}
                        id="checkout-back-payment"
                      >
                        ← Back
                      </Button>
                      <Button
                        variant="neon"
                        fullWidth
                        size="lg"
                        loading={placing}
                        onClick={handlePlaceOrder}
                        id="checkout-place-order"
                      >
                        {placing ? 'Placing Order...' : `Place Order — PKR ${total.toLocaleString()}`}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-5 sticky top-24">
              <h3 className="font-display font-semibold text-text-primary mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item._key} className="flex justify-between text-xs font-body">
                    <span className="text-text-secondary line-clamp-1 flex-1 mr-2">
                      {item.quantity}× {item.name}
                      {item.variant && ` (${item.variant.name})`}
                    </span>
                    <span className="text-text-primary flex-shrink-0">
                      PKR {((item.base_price + (item.variant?.price_delta || 0) + (item.addons || []).reduce((s, a) => s + a.price, 0)) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="neon-divider mb-3" />
              <div className="space-y-1 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery</span>
                  <span className="text-text-primary">PKR {DELIVERY_FEE}</span>
                </div>
              </div>
              <div className="neon-divider my-3" />
              <div className="flex justify-between font-display font-bold">
                <span className="text-text-primary">Total</span>
                <span className="text-brand-primary text-lg">PKR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
