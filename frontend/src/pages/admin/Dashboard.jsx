import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Tag,
  TrendingUp, Users, DollarSign, Package, ChevronDown, ChevronUp,
  Plus, Pencil, Trash2, MapPin, Phone, Mail, Clock, CreditCard,
  X, Eye, AlertTriangle, Image as ImageIcon
} from 'lucide-react'
import { pageVariants } from '../../animations/pageTransitions'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { toast } from 'react-hot-toast'

const SALES_DATA = [
  { day: 'Mon', revenue: 12400 },
  { day: 'Tue', revenue: 18200 },
  { day: 'Wed', revenue: 15800 },
  { day: 'Thu', revenue: 22100 },
  { day: 'Fri', revenue: 29400 },
  { day: 'Sat', revenue: 34200 },
  { day: 'Sun', revenue: 28900 },
]

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending: 'text-amber-600 bg-amber-50 border-amber-200',
  confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
  preparing: 'text-brand-primary bg-rose-50 border-rose-200',
  out_for_delivery: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
}

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colors = {
    primary: 'text-brand-primary bg-brand-primary/10',
    secondary: 'text-brand-secondary bg-brand-secondary/10',
    cyan: 'text-brand-accent bg-brand-accent/10',
    green: 'text-emerald-600 bg-emerald-50',
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-emerald-600 text-xs font-body flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-text-primary">{value}</div>
      <div className="text-text-secondary text-xs font-body mt-1">{label}</div>
    </div>
  )
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass p-3 rounded-xl text-xs font-body">
      <div className="text-text-secondary mb-1">{label}</div>
      <div className="text-brand-primary font-display font-bold">PKR {payload[0].value.toLocaleString()}</div>
    </div>
  )
}

// ─── Order Detail Card ──────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)

  const profile = order.profiles
  const address = order.delivery_address
  const items = order.order_items || []

  // Parse addons if they're JSON strings
  const parseAddons = (addons) => {
    if (!addons) return []
    if (typeof addons === 'string') {
      try { return JSON.parse(addons) } catch { return [] }
    }
    return Array.isArray(addons) ? addons : []
  }

  return (
    <div className="glass-card overflow-hidden transition-all">
      {/* Header row — always visible */}
      <div className="p-5">
        <div className="flex items-start gap-4 flex-wrap">
          {/* Order ID + Status badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-display font-bold text-text-primary text-sm">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${STATUS_COLORS[order.status] || ''}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            {/* Customer info row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-body text-text-secondary">
              {profile?.full_name && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {profile.full_name}
                </span>
              )}
              {profile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {profile.phone}
                </span>
              )}
              {profile?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {profile.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(order.created_at).toLocaleString('en-PK', {
                  dateStyle: 'medium', timeStyle: 'short'
                })}
              </span>
            </div>

            {/* Address */}
            {address && (address.address_line || address.city) && (
              <div className="flex items-start gap-1 mt-1.5 text-xs font-body text-text-secondary">
                <MapPin className="w-3 h-3 mt-0.5 text-brand-primary flex-shrink-0" />
                <span>
                  {[address.label && `(${address.label})`, address.address_line, address.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Right side: total + status changer + expand button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-brand-primary font-display font-bold text-lg">
                PKR {Number(order.total).toLocaleString()}
              </div>
              <div className="text-text-secondary text-[10px] font-body flex items-center gap-1 justify-end">
                <CreditCard className="w-3 h-3" />
                {order.payment_method?.toUpperCase() || 'COD'}
                {order.payment_status && (
                  <span className={`ml-1 ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                    · {order.payment_status}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <select
                id={`admin-order-status-${order.id}`}
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="appearance-none bg-bg-elevated border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-text-primary text-xs font-body focus:border-brand-primary/40 transition-colors cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary pointer-events-none" />
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              title={expanded ? 'Collapse' : 'View items'}
            >
              {expanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded section — order items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
              <h4 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider mb-3">
                Order Items ({items.length})
              </h4>

              {items.length === 0 ? (
                <p className="text-text-secondary text-xs font-body">No items found.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const addons = parseAddons(item.addons)
                    return (
                      <div key={item.id || idx} className="flex gap-3 items-start bg-white rounded-xl p-3 border border-gray-100">
                        {/* Image thumbnail */}
                        {item.item_image && (
                          <img
                            src={item.item_image}
                            alt={item.item_name || 'Item'}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-semibold text-text-primary text-sm">
                              {item.item_name || 'Unknown Item'}
                            </span>
                            <span className="text-brand-primary font-display font-bold text-sm flex-shrink-0">
                              PKR {(Number(item.unit_price) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-secondary font-body mt-0.5">
                            <span>Qty: <strong className="text-text-primary">{item.quantity}</strong></span>
                            <span>Unit: PKR {Number(item.unit_price).toLocaleString()}</span>
                          </div>
                          {/* Addons */}
                          {addons.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {addons.map((addon, aIdx) => (
                                <span key={aIdx} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-body font-medium">
                                  + {addon.name || addon} {addon.price ? `(PKR ${Number(addon.price).toLocaleString()})` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Notes */}
                          {item.notes && (
                            <p className="mt-1.5 text-xs text-text-secondary font-body italic bg-gray-50 px-2 py-1 rounded">
                              📝 {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Financial summary */}
              <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">PKR {Number(order.subtotal).toLocaleString()}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-emerald-600">Discount {order.promo_code && `(${order.promo_code})`}</span>
                    <span className="text-emerald-600">-PKR {Number(order.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-body">
                  <span className="text-text-secondary">Delivery Fee</span>
                  <span className="text-text-primary">PKR {Number(order.delivery_fee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-display font-bold pt-1 border-t border-gray-200 mt-1">
                  <span className="text-text-primary">Total</span>
                  <span className="text-brand-primary">PKR {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ─── Menu Item Form Modal ───────────────────────────────────────────────────
function MenuItemModal({ isOpen, onClose, item, categories, onSave, isSaving }) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState({
    name: item?.name || '',
    category_id: item?.category_id || '',
    description: item?.description || '',
    base_price: item?.base_price || '',
    image_url: item?.image_url || '',
    is_available: item?.is_available ?? true,
    is_spicy: item?.is_spicy ?? false,
    tags: Array.isArray(item?.tags) ? item.tags.join(', ') : '',
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id || !form.base_price) {
      toast.error('Please fill in name, category, and price')
      return
    }
    const payload = {
      name: form.name.trim(),
      category_id: form.category_id,
      description: form.description.trim() || null,
      base_price: parseFloat(form.base_price),
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
      is_spicy: form.is_spicy,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    onSave(payload)
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-text-primary text-sm font-body focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none"
  const labelClass = "block text-text-secondary text-xs font-body font-medium mb-1.5"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Menu Item' : 'Add New Item'} size="lg" id="menu-item-modal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Item Name *</label>
            <input
              id="menu-item-name"
              className={inputClass}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Margherita Pizza"
            />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select
              id="menu-item-category"
              className={inputClass}
              value={form.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            id="menu-item-description"
            className={`${inputClass} resize-none`}
            rows={2}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="A classic pizza with fresh mozzarella and basil..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Base Price (PKR) *</label>
            <input
              id="menu-item-price"
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={form.base_price}
              onChange={(e) => handleChange('base_price', e.target.value)}
              placeholder="499"
            />
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <div className="flex gap-2">
              <input
                id="menu-item-image"
                className={`${inputClass} flex-1`}
                value={form.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {form.image_url && (
                <img src={form.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input
            id="menu-item-tags"
            className={inputClass}
            value={form.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="bestseller, new, popular"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => handleChange('is_available', e.target.checked)}
              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary/50"
            />
            <span className="text-text-primary text-sm font-body">Available</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_spicy}
              onChange={(e) => handleChange('is_spicy', e.target.checked)}
              className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500/50"
            />
            <span className="text-text-primary text-sm font-body">🌶️ Spicy</span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} id="menu-modal-cancel">Cancel</Button>
          <Button variant="neon" type="submit" loading={isSaving} id="menu-modal-save" className="flex-1">
            {isEdit ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}


// ─── Create Promo Modal ─────────────────────────────────────────────────────
function CreatePromoModal({ isOpen, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    code: '',
    discount_percent: '',
    discount_flat: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
    active: true,
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.code.trim()) {
      toast.error('Promo code is required')
      return
    }
    if (!form.discount_percent && !form.discount_flat) {
      toast.error('Set either a % or flat discount')
      return
    }
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : null,
      discount_flat: form.discount_flat ? parseFloat(form.discount_flat) : null,
      min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      active: form.active,
    }
    onSave(payload)
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-text-primary text-sm font-body focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none"
  const labelClass = "block text-text-secondary text-xs font-body font-medium mb-1.5"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Promo Code" size="md" id="create-promo-modal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Promo Code *</label>
          <input
            id="promo-code-input"
            className={`${inputClass} uppercase`}
            value={form.code}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="SITARA30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Discount % (e.g. 20)</label>
            <input
              id="promo-discount-percent"
              type="number"
              min="0"
              max="100"
              step="1"
              className={inputClass}
              value={form.discount_percent}
              onChange={(e) => handleChange('discount_percent', e.target.value)}
              placeholder="20"
            />
          </div>
          <div>
            <label className={labelClass}>Flat Discount (PKR)</label>
            <input
              id="promo-discount-flat"
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={form.discount_flat}
              onChange={(e) => handleChange('discount_flat', e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min Order Amount (PKR)</label>
            <input
              id="promo-min-order"
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={form.min_order_amount}
              onChange={(e) => handleChange('min_order_amount', e.target.value)}
              placeholder="500"
            />
          </div>
          <div>
            <label className={labelClass}>Max Uses</label>
            <input
              id="promo-max-uses"
              type="number"
              min="1"
              step="1"
              className={inputClass}
              value={form.max_uses}
              onChange={(e) => handleChange('max_uses', e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Expires At</label>
          <input
            id="promo-expires-at"
            type="datetime-local"
            className={inputClass}
            value={form.expires_at}
            onChange={(e) => handleChange('expires_at', e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => handleChange('active', e.target.checked)}
            className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary/50"
          />
          <span className="text-text-primary text-sm font-body">Active</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} id="promo-modal-cancel">Cancel</Button>
          <Button variant="neon" type="submit" loading={isSaving} id="promo-modal-save" className="flex-1">
            Create Promo
          </Button>
        </div>
      </form>
    </Modal>
  )
}


// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Item" size="sm" id="delete-confirm-modal">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-text-primary font-body text-sm mb-1">
          Are you sure you want to delete
        </p>
        <p className="text-brand-primary font-display font-bold text-base mb-4">
          "{itemName}"?
        </p>
        <p className="text-text-secondary text-xs font-body mb-6">
          This action cannot be undone. All variants and addons will also be removed.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} id="delete-cancel" className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={isDeleting} id="delete-confirm" className="flex-1">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}


// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [orderFilter, setOrderFilter] = useState('')
  const queryClient = useQueryClient()

  // Menu item modal state
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)

  // Promo modal state
  const [promoModalOpen, setPromoModalOpen] = useState(false)

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories')
      return res.data
    }
  })

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/orders')
      return res.data
    },
    refetchInterval: 3000
  })

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['adminMenu'],
    queryFn: async () => {
      const res = await apiClient.get('/api/menu', { params: { available_only: false } })
      return res.data
    }
  })

  const { data: analytics = { total_orders: 0, total_revenue: 0, pending_orders: 0 } } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/analytics/summary')
      return res.data
    },
    refetchInterval: 3000
  })

  const { data: promos = [], isLoading: isLoadingPromos } = useQuery({
    queryKey: ['adminPromos'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/promos')
      return res.data
    }
  })

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      return apiClient.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success("Order status updated!")
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to update order status")
    }
  })

  const createMenuItemMutation = useMutation({
    mutationFn: async (data) => {
      return apiClient.post('/api/admin/menu', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] })
      toast.success("Menu item created!")
      setMenuModalOpen(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to create item")
    }
  })

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ itemId, data }) => {
      return apiClient.patch(`/api/admin/menu/${itemId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] })
      toast.success("Menu item updated!")
      setMenuModalOpen(false)
      setEditingItem(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to update item")
    }
  })

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId) => {
      return apiClient.delete(`/api/admin/menu/${itemId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] })
      toast.success("Menu item deleted!")
      setDeleteModalOpen(false)
      setDeletingItem(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to delete item")
    }
  })

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, isAvailable }) => {
      return apiClient.patch(`/api/admin/menu/${itemId}`, { is_available: isAvailable })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] })
      toast.success("Availability updated!")
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to update availability")
    }
  })

  const createPromoMutation = useMutation({
    mutationFn: async (data) => {
      return apiClient.post('/api/admin/promos', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromos'] })
      toast.success("Promo code created!")
      setPromoModalOpen(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to create promo")
    }
  })

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveMenuItem = (data) => {
    if (editingItem) {
      updateMenuItemMutation.mutate({ itemId: editingItem.id, data })
    } else {
      createMenuItemMutation.mutate(data)
    }
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setMenuModalOpen(true)
  }

  const openAddModal = () => {
    setEditingItem(null)
    setMenuModalOpen(true)
  }

  const openDeleteModal = (item) => {
    setDeletingItem(item)
    setDeleteModalOpen(true)
  }

  // Filter orders
  const filteredOrders = orderFilter
    ? orders.filter(o => o.status === orderFilter)
    : orders

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: analytics.pending_orders || 0 },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'promos', label: 'Promos', icon: Tag },
  ]

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg pt-16 min-h-screen"
    >
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-gray-200 min-h-screen pt-6 px-3 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="mb-6 px-3">
            <div className="badge-hot inline-block">Admin Panel</div>
          </div>
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              id={`admin-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-display font-medium transition-all ${
                activeTab === id
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span className="ml-auto bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 max-w-full overflow-x-auto">
          {/* Mobile tabs */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-4">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                id={`admin-mobile-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-display font-semibold transition-all ${
                  activeTab === id ? 'bg-brand-primary text-white' : 'glass text-text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="font-display font-bold text-2xl text-text-primary">Dashboard Overview</h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ShoppingBag} label="Total Orders" value={analytics.total_orders} color="primary" />
                <StatCard icon={DollarSign} label="Total Revenue" value={`PKR ${analytics.total_revenue.toLocaleString()}`} color="green" />
                <StatCard icon={Package} label="Pending Orders" value={analytics.pending_orders} color="secondary" />
                <StatCard icon={Users} label="Menu Items" value={menuItems.length} color="green" />
              </div>

              {/* Sales chart */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-text-primary mb-6">Revenue (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={SALES_DATA}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#4B5563', fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#E11D48" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#E11D48', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent orders */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-text-primary mb-4">Recent Orders</h3>
                {isLoadingOrders ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-text-secondary text-sm font-body">No orders placed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-none">
                        <div className="flex-1">
                          <div className="font-display font-semibold text-text-primary text-sm">
                            {order.profiles?.full_name || 'Guest Customer'}
                          </div>
                          <div className="text-text-secondary text-xs font-body">
                            #{order.id.slice(0, 8).toUpperCase()} · {order.order_items?.length || 0} items
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[order.status] || ''}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <div className="text-brand-primary font-display font-bold text-sm">
                          PKR {Number(order.total).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="font-display font-bold text-2xl text-text-primary">Order Management</h1>
                {/* Status filter */}
                <div className="flex gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setOrderFilter('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                      !orderFilter ? 'bg-brand-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  {STATUS_OPTIONS.map(s => {
                    const count = orders.filter(o => o.status === s).length
                    if (count === 0) return null
                    return (
                      <button
                        key={s}
                        onClick={() => setOrderFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                          orderFilter === s ? 'bg-brand-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                        }`}
                      >
                        {STATUS_LABELS[s]} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>

              {isLoadingOrders ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-xl" />
                  <div className="h-24 bg-gray-200 rounded-xl" />
                  <div className="h-24 bg-gray-200 rounded-xl" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-text-secondary text-sm font-body">
                    {orderFilter ? `No ${STATUS_LABELS[orderFilter]?.toLowerCase()} orders.` : 'No orders available.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={(orderId, newStatus) => updateStatusMutation.mutate({ orderId, newStatus })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Menu ── */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-bold text-2xl text-text-primary">Menu Management</h1>
                <Button variant="neon" size="sm" onClick={openAddModal} id="admin-add-menu-item">
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>

              {isLoadingMenu ? (
                <div className="h-40 bg-gray-200 animate-pulse rounded-xl" />
              ) : menuItems.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-text-secondary text-sm font-body mb-4">No menu items yet.</p>
                  <Button variant="neon" size="sm" onClick={openAddModal} id="admin-add-first-item">
                    <Plus className="w-4 h-4" /> Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Image</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Item</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Price</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => {
                        const category = categories.find((c) => c.id === item.category_id) || item.category
                        return (
                          <tr key={item.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-display font-semibold text-text-primary text-xs line-clamp-1">{item.name}</div>
                              {item.is_spicy && <span className="text-[10px]">🌶️</span>}
                              {item.tags?.length > 0 && (
                                <div className="flex gap-1 mt-0.5">
                                  {item.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-text-secondary rounded text-[9px] font-body">{tag}</span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell">
                              <span className="text-text-secondary text-xs font-body">{category?.name || 'Uncategorized'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-brand-primary font-display font-semibold text-xs">PKR {Number(item.base_price).toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleAvailabilityMutation.mutate({ itemId: item.id, isAvailable: !item.is_available })}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${item.is_available ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                              >
                                {item.is_available ? 'Available' : 'Unavailable'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  id={`admin-edit-${item.id}`}
                                  onClick={() => openEditModal(item)}
                                  className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`admin-delete-${item.id}`}
                                  onClick={() => openDeleteModal(item)}
                                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Menu item modal */}
              {menuModalOpen && (
                <MenuItemModal
                  isOpen={menuModalOpen}
                  onClose={() => { setMenuModalOpen(false); setEditingItem(null) }}
                  item={editingItem}
                  categories={categories}
                  onSave={handleSaveMenuItem}
                  isSaving={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                />
              )}

              {/* Delete confirm modal */}
              {deleteModalOpen && (
                <DeleteConfirmModal
                  isOpen={deleteModalOpen}
                  onClose={() => { setDeleteModalOpen(false); setDeletingItem(null) }}
                  onConfirm={() => deleteMenuItemMutation.mutate(deletingItem.id)}
                  itemName={deletingItem?.name || 'this item'}
                  isDeleting={deleteMenuItemMutation.isPending}
                />
              )}
            </div>
          )}

          {/* ── Promos ── */}
          {activeTab === 'promos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-bold text-2xl text-text-primary">Promo Codes</h1>
                <Button variant="neon" size="sm" onClick={() => setPromoModalOpen(true)} id="admin-create-promo">
                  <Plus className="w-4 h-4" /> Create Promo
                </Button>
              </div>

              {isLoadingPromos ? (
                <div className="h-40 bg-gray-200 animate-pulse rounded-xl" />
              ) : promos.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-text-secondary text-sm font-body mb-4">No promo codes yet.</p>
                  <Button variant="neon" size="sm" onClick={() => setPromoModalOpen(true)} id="admin-create-first-promo">
                    <Plus className="w-4 h-4" /> Create Your First Promo
                  </Button>
                </div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Code</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Discount</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Min Order</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider hidden md:table-cell">Usage</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider hidden md:table-cell">Expires</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promos.map((promo) => {
                        const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
                        const isActive = promo.active && !isExpired
                        return (
                          <tr key={promo.id || promo.code} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <code className="font-mono text-brand-primary text-xs bg-brand-primary/10 px-2 py-0.5 rounded font-bold">
                                {promo.code}
                              </code>
                            </td>
                            <td className="py-3 px-4 text-text-primary text-xs font-body font-semibold">
                              {promo.discount_percent
                                ? `${Number(promo.discount_percent)}%`
                                : promo.discount_flat
                                ? `PKR ${Number(promo.discount_flat).toLocaleString()}`
                                : '—'}
                            </td>
                            <td className="py-3 px-4 text-text-secondary text-xs font-body hidden sm:table-cell">
                              PKR {Number(promo.min_order_amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-text-secondary text-xs font-body hidden md:table-cell">
                              {promo.used_count || 0}{promo.max_uses ? `/${promo.max_uses}` : ''}
                            </td>
                            <td className="py-3 px-4 text-text-secondary text-xs font-body hidden md:table-cell">
                              {promo.expires_at
                                ? new Date(promo.expires_at).toLocaleDateString('en-PK', { dateStyle: 'medium' })
                                : 'Never'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : isExpired
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}>
                                {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Create promo modal */}
              {promoModalOpen && (
                <CreatePromoModal
                  isOpen={promoModalOpen}
                  onClose={() => setPromoModalOpen(false)}
                  onSave={(data) => createPromoMutation.mutate(data)}
                  isSaving={createPromoMutation.isPending}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </motion.div>
  )
}
