import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { initSectionReveal } from '../../animations/heroTimeline'

function useCounter(target, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, trigger])
  return count
}

const stats = [
  { value: 50000, suffix: '+', label: 'Orders Delivered', prefix: '' },
  { value: 4.9, suffix: '★', label: 'Average Rating', prefix: '', isFloat: true },
  { value: 12, suffix: '+', label: 'Delivery Zones', prefix: '' },
  { value: 30, suffix: ' min', label: 'Avg Delivery Time', prefix: '<' },
]

export default function AnimatedCounters() {
  const sectionRef = useRef(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const ctx = initSectionReveal(sectionRef.current)
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      ctx?.revert()
      observer.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} className="py-16 relative" id="stats">
      <div className="neon-divider mb-16" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, suffix, label, prefix, isFloat }) => {
            const count = useCounter(isFloat ? value * 10 : value, 2000, triggered)
            const display = isFloat ? (count / 10).toFixed(1) : count.toLocaleString()

            return (
              <motion.div
                key={label}
                className="reveal-item glass-card p-6 text-center"
                whileHover={{ scale: 1.03 }}
              >
                <div className="font-display font-bold text-3xl sm:text-4xl neon-text mb-1">
                  {prefix}{display}{suffix}
                </div>
                <div className="text-text-secondary text-sm font-body">{label}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
