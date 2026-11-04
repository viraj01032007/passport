import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Globe, Headset, Menu, Phone, ShieldCheck, ShieldAlert, X } from 'lucide-react'
import { LANGS, useLang, useT } from '../lib/i18n'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="PoliceFlow home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-white shadow-card">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>
          Police<span className={light ? 'text-cyan' : 'text-royal'}>Flow</span>
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.14em] ${light ? 'text-slate-400' : 'text-slate-500'}`}>
          Smart verification · Navi Mumbai
        </span>
      </span>
    </Link>
  )
}

export function TopBar() {
  const t = useT()
  const { lang, setLang } = useLang()
  const lines = [
    { n: '112', l: t('top.emergency') },
    { n: '1091', l: t('top.women') },
    { n: '1930', l: t('top.cyber') },
  ]
  return (
    <div className="bg-navy-900 text-[12px] text-slate-300 print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <ul className="no-scrollbar flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap">
          {lines.map((x) => (
            <li key={x.n}>
              <a href={`tel:${x.n}`} className="flex items-center gap-1.5 hover:text-white">
                <Phone className="h-3 w-3 text-cyan" />
                <span className="font-extrabold text-white">{x.n}</span>
                <span className="hidden sm:inline">{x.l}</span>
              </a>
            </li>
          ))}
          <li className="hidden md:block">
            <Link to="/contact" className="flex items-center gap-1.5 hover:text-white">
              <Headset className="h-3 w-3 text-cyan" /> {t('top.assist')}
            </Link>
          </li>
        </ul>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 text-slate-300 lg:flex">
            <ShieldAlert className="h-3 w-3" /> {t('top.proposal')}
          </span>
          <label className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-cyan" />
            <span className="sr-only">Language</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as typeof lang)}
              className="cursor-pointer rounded-md border border-white/15 bg-transparent px-1.5 py-0.5 font-semibold text-white outline-none focus:ring-2 focus:ring-cyan/50"
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id} className="text-navy">{l.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}

type Item = { to: string; label: string; desc?: string; external?: boolean }

function useMenu() {
  const t = useT()
  const menu: { label: string; to?: string; items?: Item[] }[] = [
    { label: t('nav.home'), to: '/' },
    {
      label: t('nav.about'),
      items: [
        { to: '/about', label: 'About PoliceFlow', desc: 'Purpose, principles and data privacy' },
        { to: '/#institution', label: 'Governance approach', desc: 'How the proposed system is run' },
        { to: 'https://www.navimumbaipolice.gov.in/', label: 'Official Navi Mumbai Police site', desc: 'Opens the official website', external: true },
      ],
    },
    {
      label: t('nav.services'),
      items: [
        { to: '/book?service=passport', label: 'Passport verification', desc: 'Book a verification slot' },
        { to: '/book?service=tenant', label: 'Tenant verification', desc: 'For landlords and tenants' },
        { to: '/book?service=character', label: 'Character verification', desc: 'For employment purposes' },
        { to: '/#services', label: 'All citizen services', desc: 'Including official government portals' },
      ],
    },
    { label: t('nav.process'), to: '/#journey' },
    { label: t('nav.stations'), to: '/#stations' },
    { label: t('nav.contact'), to: '/contact' },
  ]
  return menu
}

function MenuLink({ item, className, onClick }: { item: Item; className?: string; onClick?: () => void }) {
  return item.external ? (
    <a href={item.to} target="_blank" rel="noreferrer" className={className} onClick={onClick}>{item.label} ↗{item.desc && <span className="mt-0.5 block text-xs font-medium text-slate-500">{item.desc}</span>}</a>
  ) : (
    <Link to={item.to} className={className} onClick={onClick}>{item.label}{item.desc && <span className="mt-0.5 block text-xs font-medium text-slate-500">{item.desc}</span>}</Link>
  )
}

export default function Navbar() {
  const t = useT()
  const menu = useMenu()
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState<number | null>(null)
  const [mobileSub, setMobileSub] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash, search } = useLocation()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => { setOpen(false); setDrop(null) }, [pathname, hash, search])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!navRef.current?.contains(e.target as Node)) setDrop(null) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setDrop(null); setOpen(false) } }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [])

  return (
    <header className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'border-slate-200 shadow-[0_8px_30px_-12px_rgba(16,42,67,.25)]' : 'border-transparent'}`}>
      <nav ref={navRef} className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[76px] lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-1 text-[14px] font-bold text-navy xl:flex">
          {menu.map((m, i) => (
            <li key={m.label} className="relative" onMouseEnter={() => m.items && setDrop(i)} onMouseLeave={() => m.items && setDrop(null)}>
              {m.items ? (
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 ${drop === i ? 'bg-slate-100' : ''}`}
                  aria-expanded={drop === i}
                  onClick={() => setDrop(drop === i ? null : i)}
                >
                  {m.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${drop === i ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link to={m.to!} className="block rounded-lg px-3 py-2 transition-colors hover:bg-slate-100">{m.label}</Link>
              )}
              <AnimatePresence>
                {m.items && drop === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full w-72 pt-2"
                  >
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lift">
                      {m.items.map((it) => (
                        <MenuLink key={it.label} item={it} className="block rounded-xl px-3 py-2.5 text-sm font-bold text-navy transition hover:bg-canvas" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/track" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-navy hover:bg-slate-100 lg:block">{t('nav.track')}</Link>
          <Link to="/login" className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-navy transition hover:border-royal hover:text-royal sm:block">{t('nav.login')}</Link>
          <Link to="/book" className="hidden rounded-xl bg-royal px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-navy md:block">{t('nav.book')}</Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-navy xl:hidden"
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
            className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-68px)] overflow-y-auto border-t border-slate-100 bg-white px-4 pb-24 pt-2 sm:px-6 xl:hidden"
          >
            <ul className="divide-y divide-slate-100">
              {menu.map((m, i) => (
                <li key={m.label}>
                  {m.items ? (
                    <>
                      <button onClick={() => setMobileSub(mobileSub === i ? null : i)} className="flex w-full items-center justify-between py-4 text-lg font-bold text-navy" aria-expanded={mobileSub === i}>
                        {m.label}
                        <ChevronDown className={`h-5 w-5 text-royal transition-transform ${mobileSub === i ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileSub === i && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="mb-3 space-y-1 rounded-2xl bg-canvas p-2">
                              {m.items.map((it) => (
                                <MenuLink key={it.label} item={it} className="block rounded-xl px-3 py-2.5 text-[15px] font-bold text-navy" onClick={() => setOpen(false)} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link to={m.to!} className="flex items-center justify-between py-4 text-lg font-bold text-navy">
                      {m.label} <span className="text-royal">→</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3">
              <Link to="/book" className="flex items-center justify-center rounded-2xl bg-royal py-4 font-bold text-white">{t('nav.book')}</Link>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/track" className="flex items-center justify-center rounded-2xl border border-slate-200 py-3.5 font-bold text-navy">{t('nav.track')}</Link>
                <Link to="/login" className="flex items-center justify-center rounded-2xl border border-slate-200 py-3.5 font-bold text-navy">{t('nav.login')}</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
