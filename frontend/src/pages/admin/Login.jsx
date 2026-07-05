import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { pageVariants } from '../../animations/pageTransitions'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.email === 'admin@sitara.com') {
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    
    // Admin restriction check
    if (email !== 'admin@sitara.com') {
      toast.error('Access Denied: Only admin accounts can log in here.')
      setLoading(false)
      return
    }

    const { data, error } = await signIn({ email, password })
    if (error) {
      toast.error(error.message || 'Login failed')
      setLoading(false)
    } else {
      toast.success('Welcome back, Admin!')
      // Navigation is handled by useEffect to prevent race conditions with AuthContext state updates.
    }
  }

  const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors'

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg min-h-screen flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4 p-1">
            <img src="/logo.jpg" alt="Sitara Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Sitara Pizza</h1>
          <p className="text-text-secondary font-body text-sm mt-1">Admin Portal Login</p>
        </div>

        <div className="glass-card p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Admin Email</label>
              <input
                {...register('email')}
                id="admin-login-email"
                type="email"
                placeholder="admin@sitara.com"
                className={inputCls}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  id="admin-login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              variant="neon"
              fullWidth
              size="lg"
              loading={loading}
              id="admin-login-submit"
            >
              Sign In to Dashboard
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
