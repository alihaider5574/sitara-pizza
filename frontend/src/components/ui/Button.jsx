import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

/**
 * Reusable Button component with neon, ghost, and outline variants.
 *
 * @param {object} props
 * @param {'neon'|'ghost'|'outline'|'danger'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.loading
 * @param {boolean} props.fullWidth
 * @param {string} props.id - Required for accessibility and testing
 */
const Button = forwardRef(({
  variant = 'neon',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  id,
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-primary/50 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  const variants = {
    neon: 'btn-neon text-text-primary shadow-card',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/6',
    outline: 'bg-transparent text-neon-primary border border-neon-primary/40 hover:bg-neon-primary/10 hover:border-neon-primary',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
  }

  return (
    <motion.button
      ref={ref}
      id={id}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={clsx(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : children}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button
