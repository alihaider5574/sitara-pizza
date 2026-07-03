import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Pages
import Home from './pages/Home'
import Menu from './pages/Menu'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Account from './pages/Account'
import AdminDashboard from './pages/admin/Dashboard'
import AdminLogin from './pages/admin/Login'

function NotFound() {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center text-center">
      <div>
        <div className="text-8xl mb-4 font-display font-bold neon-text">404</div>
        <h1 className="font-display font-bold text-text-primary text-2xl mb-2">Page Not Found</h1>
        <p className="text-text-muted font-body mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-neon px-6 py-3 rounded-xl inline-block font-display font-semibold text-sm">
          Go Home
        </a>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />
  if (adminOnly && user.email !== 'admin@sitara.com') {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

export default function AppRouter() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:itemId" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route path="/checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="/track/:orderId?" element={
          <ProtectedRoute><OrderTracking /></ProtectedRoute>
        } />
        <Route path="/track" element={
          <ProtectedRoute><OrderTracking /></ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute><Account /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}
