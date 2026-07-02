import { Link } from 'react-router-dom'
import { Zap, Share2, Share, MessageCircle, Phone, MapPin, Mail } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-bg-surface">
      {/* Glow divider */}
      <div className="neon-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-primary to-neon-secondary flex items-center justify-center shadow-glow-primary">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-lg text-white leading-none">Sitara</div>
                <div className="text-xs text-text-muted font-body">Pizza & Fried Chicks</div>
              </div>
            </Link>
            <p className="text-text-secondary text-sm font-body leading-relaxed max-w-xs">
              Karachi's most lit fast-food experience. Fire pizza, crispy chicks, legendary taste.
              Order online, track in real-time.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { Icon: Share2, href: '#', id: 'footer-instagram' },
                { Icon: Share, href: '#', id: 'footer-facebook' },
                { Icon: MessageCircle, href: '#', id: 'footer-twitter' },
              ].map(({ Icon, href, id }) => (
                <a
                  key={id}
                  id={id}
                  href={href}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-neon-primary hover:border-neon-primary/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/menu', label: 'Menu' },
                { to: '/menu?category=deals', label: 'Today\'s Deals' },
                { to: '/track', label: 'Track Order' },
                { to: '/account', label: 'My Account' },
                { to: '/login', label: 'Login / Sign Up' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-text-secondary hover:text-neon-primary text-sm font-body transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white mb-4 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-text-secondary text-sm font-body">
                <Phone className="w-4 h-4 mt-0.5 text-neon-primary flex-shrink-0" />
                <a href="tel:+92300000000" className="hover:text-white transition-colors">
                  +92 300 000 0000
                </a>
              </li>
              <li className="flex items-start gap-3 text-text-secondary text-sm font-body">
                <Mail className="w-4 h-4 mt-0.5 text-neon-primary flex-shrink-0" />
                <a href="mailto:hello@sitarapizza.com" className="hover:text-white transition-colors">
                  hello@sitarapizza.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-text-secondary text-sm font-body">
                <MapPin className="w-4 h-4 mt-0.5 text-neon-primary flex-shrink-0" />
                <span>Karachi, Pakistan</span>
              </li>
            </ul>

            {/* Payment badges */}
            <div className="mt-5">
              <p className="text-text-muted text-xs mb-2 font-body uppercase tracking-wider">We Accept</p>
              <div className="flex gap-2 flex-wrap">
                {['COD', 'JazzCash', 'EasyPaisa'].map((method) => (
                  <span
                    key={method}
                    className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-text-secondary text-xs font-body"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="neon-divider mt-8 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-text-muted text-xs font-body">
          <span>© {year} Sitara Pizza & Fried Chicks. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
