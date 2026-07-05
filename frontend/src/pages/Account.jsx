import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, MapPin, LogOut, Star, Edit2, Check, X, Trash2, Plus } from 'lucide-react'
import { pageVariants } from '../animations/pageTransitions'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'

// ─── Loyalty Ring (Visual Only) ─────────────────────────────────────────────
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
              <stop offset="0%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Star className="w-4 h-4 text-brand-primary mb-0.5" />
          <span className="font-display font-bold text-text-primary text-sm">{points}</span>
          <span className="text-text-muted text-[10px] font-body">pts</span>
        </div>
      </div>
      <p className="text-text-muted text-xs font-body mt-2">Loyalty Points</p>
    </div>
  )
}

const STATUS_COLORS = {
  delivered: 'text-emerald-500 bg-emerald-50 border border-emerald-200',
  pending: 'text-amber-600 bg-amber-50 border border-amber-200',
  cancelled: 'text-red-500 bg-red-50 border border-red-200',
  preparing: 'text-brand-primary bg-rose-50 border border-rose-200',
  out_for_delivery: 'text-purple-600 bg-purple-50 border border-purple-200',
  confirmed: 'text-blue-600 bg-blue-50 border border-blue-200',
}

export default function Account() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Tabs: 'orders' | 'profile' | 'addresses'
  const [activeTab, setActiveTab] = useState('orders')

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' })

  // Address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [addressForm, setAddressForm] = useState({ address_line: '', city: '', label: '' })

  if (!loading && !user) {
    navigate('/login')
    return null
  }

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await apiClient.get('/api/addresses/profile/me')
      return res.data
    },
    enabled: !!user,
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/orders/me')
      return res.data
    },
    enabled: !!user,
  })

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['myAddresses'],
    queryFn: async () => {
      const res = await apiClient.get('/api/addresses/me')
      return res.data
    },
    enabled: !!user,
  })

  // ─── Mutations ────────────────────────────────────────────────────────────
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => apiClient.patch('/api/addresses/profile/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setIsEditingProfile(false)
      toast.success("Profile updated")
    },
    onError: () => toast.error("Failed to update profile")
  })

  const addAddressMutation = useMutation({
    mutationFn: async (data) => apiClient.post('/api/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] })
      setAddressModalOpen(false)
      setAddressForm({ address_line: '', city: '', label: '' })
      toast.success("Address added")
    },
    onError: () => toast.error("Failed to add address")
  })

  const deleteAddressMutation = useMutation({
    mutationFn: async (id) => apiClient.delete(`/api/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] })
      toast.success("Address deleted")
    }
  })

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const startProfileEdit = () => {
    setProfileForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    })
    setIsEditingProfile(true)
  }

  const saveProfile = () => {
    updateProfileMutation.mutate(profileForm)
  }

  const handleAddAddress = (e) => {
    e.preventDefault()
    addAddressMutation.mutate(addressForm)
  }

  const tabs = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  ]

  const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-text-primary text-sm font-body focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none"

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-20 pb-16 min-h-screen"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header section */}
        <div className="glass-card p-6 mb-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-neon flex items-center justify-center text-text-primary font-display font-bold text-3xl shadow-md flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1">
            {profileLoading ? (
              <div className="space-y-2 animate-pulse mx-auto md:mx-0 w-48">
                <div className="h-6 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ) : (
              <>
                <h1 className="font-display font-bold text-2xl text-text-primary">
                  {profile?.full_name || 'Sitara Customer'}
                </h1>
                <p className="text-text-secondary font-body text-sm mt-1">{profile?.email}</p>
                <div className="flex items-center gap-4 justify-center md:justify-start mt-3">
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-text-secondary text-xs font-body border border-gray-200 uppercase">
                    {profile?.role || 'Customer'}
                  </span>
                  <span className="text-text-muted text-xs font-body">Joined {new Date(profile?.created_at || Date.now()).getFullYear()}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <LoyaltyRing points={orders.length * 50} maxPoints={1000} />
            <Button
              variant="ghost"
              onClick={async () => { await signOut(); navigate('/') }}
              id="account-signout-btn"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 hidden md:flex"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="glass-card p-2 sticky top-24">
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-medium transition-all whitespace-nowrap ${
                      activeTab === id
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-100/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Mobile Sign Out */}
            <Button
              variant="ghost"
              onClick={async () => { await signOut(); navigate('/') }}
              className="w-full mt-4 text-red-500 bg-white border border-red-100 hover:bg-red-50 md:hidden"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* ── Orders Tab ── */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="font-display font-bold text-xl text-text-primary mb-4">My Orders</h2>
                    {ordersLoading ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-2xl" />
                        <div className="h-24 bg-gray-200 rounded-2xl" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="glass-card p-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-text-secondary font-body mb-4">You haven't placed any orders yet.</p>
                        <Link to="/menu">
                          <Button variant="neon" size="sm">Order Now</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => {
                          let itemsCount = 0
                          try {
                            const items = typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items || []
                            itemsCount = items.length
                          } catch (e) {}

                          return (
                            <div key={order.id} className="glass-card p-5 flex items-center gap-4 flex-wrap hover:shadow-md transition-shadow">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1.5">
                                  <span className="font-display font-semibold text-text-primary text-sm font-mono">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || ''}`}>
                                    {order.status.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="text-text-secondary font-body text-xs flex items-center gap-2">
                                  <span>{new Date(order.created_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                  <span>•</span>
                                  <span>{itemsCount} item{itemsCount !== 1 && 's'}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-display font-bold text-brand-primary text-lg mb-1">
                                  PKR {Number(order.total).toLocaleString()}
                                </div>
                                <Link
                                  to={`/track/${order.id}`}
                                  id={`account-track-${order.id}`}
                                >
                                  <Button variant="ghost" size="sm" className="h-7 text-xs px-3 bg-gray-50 border border-gray-200">
                                    Track Order
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Profile Tab ── */}
                {activeTab === 'profile' && (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display font-bold text-xl text-text-primary">Profile Details</h2>
                      {!isEditingProfile && (
                        <button
                          onClick={startProfileEdit}
                          className="text-brand-primary hover:text-brand-primary/80 font-display font-semibold text-sm flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-text-secondary text-xs font-body font-medium mb-1.5">Email Address</label>
                        <input
                          disabled
                          value={profile?.email || ''}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-text-secondary text-sm font-body cursor-not-allowed"
                        />
                        <p className="text-[10px] text-text-muted mt-1 font-body">Email address cannot be changed.</p>
                      </div>

                      <div>
                        <label className="block text-text-secondary text-xs font-body font-medium mb-1.5">Full Name</label>
                        {isEditingProfile ? (
                          <input
                            autoFocus
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            className={inputCls}
                            placeholder="John Doe"
                          />
                        ) : (
                          <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-text-primary text-sm font-body">
                            {profile?.full_name || 'Not set'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-text-secondary text-xs font-body font-medium mb-1.5">Phone Number</label>
                        {isEditingProfile ? (
                          <input
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className={inputCls}
                            placeholder="0300 1234567"
                          />
                        ) : (
                          <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-text-primary text-sm font-body">
                            {profile?.phone || 'Not set'}
                          </div>
                        )}
                      </div>

                      {isEditingProfile && (
                        <div className="flex items-center gap-3 pt-4">
                          <Button
                            variant="ghost"
                            onClick={() => setIsEditingProfile(false)}
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </Button>
                          <Button
                            variant="neon"
                            onClick={saveProfile}
                            loading={updateProfileMutation.isPending}
                            className="flex-1"
                          >
                            <Check className="w-4 h-4 mr-2" /> Save Changes
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Addresses Tab ── */}
                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display font-bold text-xl text-text-primary">Saved Addresses</h2>
                      <Button variant="neon" size="sm" onClick={() => setAddressModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Add Address
                      </Button>
                    </div>

                    {addressesLoading ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-xl" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="glass-card p-12 text-center">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-text-secondary font-body mb-4">No saved addresses yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="glass-card p-4 flex flex-col h-full border border-gray-100 hover:border-brand-primary/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-text-secondary">
                                {addr.label || 'Address'}
                              </span>
                              <button
                                onClick={() => deleteAddressMutation.mutate(addr.id)}
                                className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete address"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-text-primary text-sm font-body mb-1 line-clamp-2">
                              {addr.address_line}
                            </div>
                            <div className="text-text-secondary text-xs font-body mt-auto">
                              {addr.city}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Address"
        size="md"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-xs font-body font-medium mb-1.5">Address Label (e.g., Home, Office)</label>
            <input
              value={addressForm.label}
              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
              className={inputCls}
              placeholder="Home"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs font-body font-medium mb-1.5">Complete Address *</label>
            <textarea
              required
              value={addressForm.address_line}
              onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="House #123, Street 4, Phase 5..."
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs font-body font-medium mb-1.5">City *</label>
            <input
              required
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              id="address-city"
              placeholder="Shahkot"
              className={inputCls}/>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddressModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="neon" loading={addAddressMutation.isPending} className="flex-1">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
