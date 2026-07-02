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

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async ({ email, password, fullName, phone }) => {
    setLoading(true)
    const { error } = await signUp({ email, password, fullName, phone })
    if (error) {
      toast.error(error.message || 'Signup failed')
    } else {
      toast.success('Account created! Check your email to confirm.')
      navigate('/login')
    }
    setLoading(false)
  }

  const inputCls = 'w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-text-primary text-sm font-body focus:border-brand-primary/40 transition-colors'

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-bg min-h-screen flex items-center justify-center px-4 py-12"
    >
      <div className="glow-orb glow-orb-secondary w-96 h-96 top-0 left-0 opacity-25" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-text-primary">Sitara</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-text-primary">Create Account</h1>
          <p className="text-text-secondary font-body text-sm mt-1">Join Sitara and start ordering</p>
        </div>

        <div className="glass-card p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Full Name *</label>
              <input {...register('fullName')} id="signup-fullname" type="text" placeholder="Your Name" className={inputCls} />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Email *</label>
              <input {...register('email')} id="signup-email" type="email" placeholder="you@example.com" className={inputCls} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Phone (optional)</label>
              <input {...register('phone')} id="signup-phone" type="tel" placeholder="+92 300 0000000" className={inputCls} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Password *</label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className={`${inputCls} pr-10`}
                />
                <button type="button" id="signup-toggle-password" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-body mb-1.5">Confirm Password *</label>
              <input {...register('confirmPassword')} id="signup-confirm-password" type="password" placeholder="Re-enter password" className={inputCls} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" variant="neon" fullWidth size="lg" loading={loading} id="signup-submit-btn">
              Create Account
            </Button>
          </form>

          <p className="text-center text-text-secondary font-body text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" id="signup-login-link" className="text-brand-primary hover:text-text-primary transition-colors font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
