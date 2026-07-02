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
import { mockMenuItems, mockCategories } from '../../data/mockMenu'
import Button from '../../components/ui/Button'

const MOCK_ORDERS = [
  { id: 'ord-001', status: 'pending', total: 1299, customer: 'Ahmed Ali', created_at: '2026-07-02T14:22:00Z', items: 3 },
  { id: 'ord-002', status: 'preparing', total: 799, customer: 'Sara Khan', created_at: '2026-07-02T13:55:00Z', items: 1 },
  { id: 'ord-003', status: 'out_for_delivery', total: 2499, customer: 'Omar Sheikh', created_at: '2026-07-02T12:30:00Z', items: 5 },
  { id: 'ord-004', status: 'delivered', total: 649, customer: 'Fatima Rizvi', created_at: '2026-07-02T11:10:00Z', items: 2 },
  { id: 'ord-005', status: 'delivered', total: 999, customer: 'Bilal Chaudhry', created_at: '2026-07-02T10:05:00Z', items: 4 },
]

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
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  preparing: 'text-neon-primary bg-neon-primary/10 border-neon-primary/20',
  out_for_delivery: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
}

function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colors = {
    primary: 'text-neon-primary bg-neon-primary/10',
    secondary: 'text-neon-secondary bg-neon-secondary/10',
    cyan: 'text-neon-cyan bg-neon-cyan/10',
    green: 'text-green-400 bg-green-400/10',
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-green-400 text-xs font-body flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-text-primary">{value}</div>
      <div className="text-text-muted text-xs font-body mt-1">{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass p-3 rounded-xl text-xs font-body">
      <div className="text-text-secondary mb-1">{label}</div>
      <div className="text-neon-primary font-display font-bold">PKR {payload[0].value.toLocaleString()}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [menuItems, setMenuItems] = useState(mockMenuItems)

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
    )
  }

  const toggleItemAvailability = (itemId) => {
    setMenuItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, is_available: !i.is_available } : i)
    )
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
        <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 min-h-screen pt-6 px-3 sticky top-16 h-[calc(100vh-4rem)]">
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
                  ? 'bg-neon-primary/15 text-neon-primary border border-neon-primary/20'
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
                  activeTab === id ? 'bg-neon-primary text-text-primary' : 'glass text-text-secondary'
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
                <StatCard icon={ShoppingBag} label="Today's Orders" value="47" trend="+12%" color="primary" />
                <StatCard icon={DollarSign} label="Today's Revenue" value="PKR 58,400" trend="+8%" color="cyan" />
                <StatCard icon={Package} label="Pending Orders" value="5" color="secondary" />
                <StatCard icon={Users} label="Active Users" value="1,240" trend="+3%" color="green" />
              </div>

              {/* Sales chart */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-text-primary mb-6">Revenue (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={SALES_DATA}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF4D2E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF4D2E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#A0A0C0', fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#A0A0C0', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#FF4D2E" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#FF4D2E', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent orders */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold text-text-primary mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-none">
                      <div className="flex-1">
                        <div className="font-display font-semibold text-text-primary text-sm">{order.customer}</div>
                        <div className="text-text-muted text-xs font-body">#{order.id.slice(4).toUpperCase()} · {order.items} items</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <div className="text-neon-primary font-display font-bold text-sm">
                        PKR {order.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h1 className="font-display font-bold text-2xl text-text-primary">Order Management</h1>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="glass-card p-5 flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-display font-bold text-text-primary text-sm">#{order.id.slice(4).toUpperCase()}</span>
                        <span className="text-text-secondary font-body text-xs">{order.customer}</span>
                      </div>
                      <div className="text-text-muted text-xs font-body">
                        {order.items} items · PKR {order.total.toLocaleString()} · {new Date(order.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
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
                        className="appearance-none bg-bg-elevated border border-white/8 rounded-xl pl-3 pr-8 py-2 text-text-primary text-xs font-body focus:border-neon-primary/40 transition-colors cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Menu ── */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-bold text-2xl text-text-primary">Menu Management</h1>
                <Button variant="neon" size="sm" id="admin-add-item-btn">+ Add Item</Button>
              </div>
              <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-text-muted font-body font-medium text-xs uppercase tracking-wider">Item</th>
                      <th className="text-left py-3 px-4 text-text-muted font-body font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="text-left py-3 px-4 text-text-muted font-body font-medium text-xs uppercase tracking-wider">Price</th>
                      <th className="text-left py-3 px-4 text-text-muted font-body font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-text-muted font-body font-medium text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => {
                      const category = mockCategories.find((c) => c.id === item.category_id)
                      return (
                        <tr key={item.id} className="border-b border-white/5 last:border-none hover:bg-white/2 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-display font-semibold text-text-primary text-xs line-clamp-1">{item.name}</div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className="text-text-secondary text-xs font-body">{category?.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-neon-primary font-display font-semibold text-xs">PKR {item.base_price.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_available ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                id={`admin-toggle-${item.id}`}
                                onClick={() => toggleItemAvailability(item.id)}
                                className="text-xs text-text-secondary hover:text-text-primary transition-colors font-body"
                              >
                                {item.is_available ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Promos ── */}
          {activeTab === 'promos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-bold text-2xl text-text-primary">Promo Codes</h1>
                <Button variant="neon" size="sm" id="admin-add-promo-btn">+ Create Promo</Button>
              </div>
              <div className="glass-card p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-2 px-3 text-text-muted font-body text-xs uppercase tracking-wider">Code</th>
                      <th className="text-left py-2 px-3 text-text-muted font-body text-xs uppercase tracking-wider">Discount</th>
                      <th className="text-left py-2 px-3 text-text-muted font-body text-xs uppercase tracking-wider">Min Order</th>
                      <th className="text-left py-2 px-3 text-text-muted font-body text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: 'SITARA20', discount: '20%', min: 'PKR 500', active: true },
                      { code: 'WELCOME50', discount: 'PKR 50 flat', min: 'PKR 300', active: true },
                      { code: 'OLDCODE', discount: '10%', min: 'None', active: false },
                    ].map((promo) => (
                      <tr key={promo.code} className="border-b border-white/5 last:border-none">
                        <td className="py-3 px-3">
                          <code className="font-mono text-neon-cyan text-xs bg-neon-cyan/10 px-2 py-0.5 rounded">
                            {promo.code}
                          </code>
                        </td>
                        <td className="py-3 px-3 text-text-primary text-xs font-body">{promo.discount}</td>
                        <td className="py-3 px-3 text-text-secondary text-xs font-body">{promo.min}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${promo.active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
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
