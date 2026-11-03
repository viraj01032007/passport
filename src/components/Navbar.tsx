import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, ShieldCheck, X } from 'lucide-react'

const links = [
  { to: '/#services', label: 'Services' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/#stations', label: 'Location' },
  { to: '/track', label: 'Track' },
  { to: '/#faq', label: 'Help' },
]

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="PoliceFlow home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-cyan shadow-card">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>
        Police<span className="text-royal">Flow</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-slate-200/70 bg-white/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo />
        <ul className="hidden items-center gap-7 text-sm font-semibold text-navy-600 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className="link-underline pb-1 transition-colors hover:text-navy">
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            to="/book"
            className="hidden rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-royal sm:inline-flex"
          >
            Book Appointment
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-navy lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white/95 px-4 pb-10 pt-4 backdrop-blur-xl lg:hidden"
          >
            <ul className="divide-y divide-slate-100">
              {links.map((l, i) => (
                <motion.li key={l.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link to={l.to} className="flex items-center justify-between py-4 text-lg font-bold text-navy">
                    {l.label}
                    <span className="text-royal">→</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Link to="/book" className="mt-6 flex w-full items-center justify-center rounded-2xl bg-navy py-4 text-base font-bold text-white">
              Book Your Appointment
            </Link>
            <Link to="/track" className="mt-3 flex w-full items-center justify-center rounded-2xl border border-slate-200 py-4 text-base font-bold text-navy">
              Track Your Application
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
