import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import heroPizzaImage from '../../assets/hero-pizza.png'

export default function HeroSection() {
  const containerRef = useRef(null)
  const navigate = useNavigate()
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-bg-base"
    >
      {/* Decorative background elements */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-brand-secondary/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Column: Copy & CTA */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
            <Star className="w-4 h-4 text-brand-secondary fill-brand-secondary" />
            <span className="text-sm font-semibold text-text-primary">Shahkot's #1 Rated Fast Food</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] text-text-primary tracking-tight">
            Craving perfection? <br />
            <span className="neon-text">We deliver.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary font-body max-w-lg leading-relaxed">
            Experience the finest wood-fired pizzas and legendary crispy fried chicken. Hot, fresh, and delivered straight to your door in minutes.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/menu')}
              className="group text-lg px-8 shadow-lg shadow-brand-primary/20"
            >
              Order Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                document.getElementById('featured-deals')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-text-primary border-gray-200 hover:bg-gray-50"
            >
              View Deals
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex items-center gap-6 border-t border-gray-100">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Customer" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-brand-secondary fill-brand-secondary" />
                ))}
              </div>
              <span className="text-sm font-medium text-text-secondary mt-1">10k+ Happy Customers</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Hero Image */}
        <motion.div 
          style={{ y: y1, opacity }}
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          {/* Decorative backdrop for pizza */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 to-brand-secondary/10 rounded-full blur-3xl transform scale-75" />
          
          <motion.img 
            src={heroPizzaImage}
            alt="Delicious Pepperoni Pizza"
            className="relative z-10 w-full max-w-[500px] object-contain drop-shadow-2xl"
            animate={{ 
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
