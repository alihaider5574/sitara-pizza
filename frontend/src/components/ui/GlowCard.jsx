/**
 * GlowCard — a glassmorphism card that pulses a neon glow on hover.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'none'} props.glow - Glow color on hover
 * @param {boolean} props.hoverable - Whether to apply hover lift/glow
 * @param {string} props.className
 */
import { motion } from 'framer-motion'

export default function GlowCard({
  children,
  glow = 'primary',
  hoverable = true,
  className = '',
  ...props
}) {
  const glowClasses = {
    primary: 'hover:shadow-card-hover hover:border-neon-primary/25',
    secondary: 'hover:shadow-glow-secondary hover:border-neon-secondary/25',
    none: '',
  }

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`glass-card ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
