import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { pageVariants } from '../animations/pageTransitions'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      if (user.email === 'admin@sitara.com') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [user, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    const { error } = await signIn({ email, password })
    if (error) {
      toast.error(error.message || 'Login failed')
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      // Navigation is handled by useEffect to prevent race conditions with AuthContext state updates.
    }
  }

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle()
    if (error) toast.error(error.message)
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg min-h-screen flex items-center justify-center px-4"
    >
      {/* Background orbs */}
      <div className="glow-orb glow-orb-primary w-96 h-96 top-0 right-0 opacity-30" />
      <div className="glow-orb glow-orb-secondary w-80 h-80 bottom-0 left-0 opacity-20" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.jpg" alt="Sitara Logo" className="w-12 h-12 object-contain rounded-full shadow-md" />
            <span className="font-display font-bold text-xl text-text-primary">Sitara</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary font-body text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="glass-card p-7">
          {/* Google sign in */}
          <button
            id="login-google-btn"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white/4 hover:bg-white/8 hover:border-white/20 text-text-primary font-body text-sm transition-all mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-text-muted text-xs font-body">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Email</label>
              <input
                {...register('email')}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 pr-10 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors"
                />
                <button
                  type="button"
                  id="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
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
              id="login-submit-btn"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-text-secondary font-body text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/signup" id="login-signup-link" className="text-brand-primary hover:text-text-primary transition-colors font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
