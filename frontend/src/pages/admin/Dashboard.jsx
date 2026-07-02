import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Tag,
  TrendingUp, Users, DollarSign, Package, ChevronDown
} from 'lucide-react'
import { pageVariants } from '../../animations/pageTransitions'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import Button from '../../components/ui/Button'
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
  pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  confirmed: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  preparing: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20',
  out_for_delivery: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20',
  delivered: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20',
  cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
}

function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colors = {
    primary: 'text-brand-primary bg-brand-primary/10',
    secondary: 'text-brand-secondary bg-brand-secondary/10',
    cyan: 'text-brand-accent bg-brand-accent/10',
    green: 'text-brand-accent bg-brand-accent/10',
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-brand-accent text-xs font-body flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-text-primary">{value}</div>
      <div className="text-text-secondary text-xs font-body mt-1">{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass p-3 rounded-xl text-xs font-body">
      <div className="text-text-secondary mb-1">{label}</div>
      <div className="text-brand-primary font-display font-bold">PKR {payload[0].value.toLocaleString()}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/categories')
      return res.data
    }
  })

  // Fetch Orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/orders')
      return res.data
    }
  })

  // Fetch Menu Items (include unavailable items too)
  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['adminMenu'],
    queryFn: async () => {
      const res = await apiClient.get('/api/menu', { params: { available_only: false } })
      return res.data
    }
  })

  // Fetch Analytics Summary
  const { data: analytics = { total_orders: 0, total_revenue: 0, pending_orders: 0 } } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/analytics/summary')
      return res.data
    }
  })

  // Update order status mutation
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

  // Toggle item availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, isAvailable }) => {
      return apiClient.patch(`/api/admin/menu/${itemId}`, { is_available: isAvailable })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] })
      toast.success("Menu item availability updated!")
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to update item availability")
    }
  })

  const updateOrderStatus = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus })
  }

  const toggleItemAvailability = (itemId, currentAvailability) => {
    toggleAvailabilityMutation.mutate({ itemId, isAvailable: !currentAvailability })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
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
          {tabs.map(({ id, label, icon: Icon }) => (
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
                  activeTab === id ? 'bg-brand-primary text-text-primary' : 'glass text-text-secondary'
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
                <StatCard icon={Users} label="Active Users" value="1,240" trend="+3%" color="green" />
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
                          {order.status.replace(/_/g, ' ')}
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
              <h1 className="font-display font-bold text-2xl text-text-primary">Order Management</h1>
              {isLoadingOrders ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded" />
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-text-secondary text-sm font-body">No orders available.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="glass-card p-5 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-display font-bold text-text-primary text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-text-secondary font-body text-xs">{order.profiles?.full_name || 'Guest'}</span>
                        </div>
                        <div className="text-text-secondary text-xs font-body">
                          {order.order_items?.length || 0} items · PKR {Number(order.total).toLocaleString()} · {new Date(order.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {/* Status updater */}
                      <div className="relative">
                        <select
                          id={`admin-order-status-${order.id}`}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="appearance-none bg-bg-elevated border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-text-primary text-xs font-body focus:border-brand-primary/40 transition-colors cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary pointer-events-none" />
                      </div>
                    </div>
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
              </div>
              {isLoadingMenu ? (
                <div className="h-40 bg-gray-200 animate-pulse rounded" />
              ) : (
                <div className="glass-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Item</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Price</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-text-secondary font-body font-medium text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => {
                        const category = categories.find((c) => c.id === item.category_id)
                        return (
                          <tr key={item.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-display font-semibold text-text-primary text-xs line-clamp-1">{item.name}</div>
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell">
                              <span className="text-text-secondary text-xs font-body">{category?.name || 'Uncategorized'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-brand-primary font-display font-semibold text-xs">PKR {Number(item.base_price).toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {item.is_available ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                id={`admin-toggle-${item.id}`}
                                onClick={() => toggleItemAvailability(item.id, item.is_available)}
                                className="text-xs text-brand-primary hover:underline transition-colors font-body font-semibold"
                              >
                                {item.is_available ? 'Disable' : 'Enable'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Promos ── */}
          {activeTab === 'promos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-bold text-2xl text-text-primary">Promo Codes</h1>
              </div>
              <div className="glass-card p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-2 px-3 text-text-secondary font-body text-xs uppercase tracking-wider">Code</th>
                      <th className="text-left py-2 px-3 text-text-secondary font-body text-xs uppercase tracking-wider">Discount</th>
                      <th className="text-left py-2 px-3 text-text-secondary font-body text-xs uppercase tracking-wider">Min Order</th>
                      <th className="text-left py-2 px-3 text-text-secondary font-body text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: 'SITARA20', discount: '20%', min: 'PKR 500', active: true },
                      { code: 'WELCOME50', discount: 'PKR 50 flat', min: 'PKR 300', active: true },
                    ].map((promo) => (
                      <tr key={promo.code} className="border-b border-gray-100 last:border-none">
                        <td className="py-3 px-3">
                          <code className="font-mono text-brand-primary text-xs bg-brand-primary/10 px-2 py-0.5 rounded">
                            {promo.code}
                          </code>
                        </td>
                        <td className="py-3 px-3 text-text-primary text-xs font-body">{promo.discount}</td>
                        <td className="py-3 px-3 text-text-secondary text-xs font-body">{promo.min}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${promo.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {promo.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  )
}
