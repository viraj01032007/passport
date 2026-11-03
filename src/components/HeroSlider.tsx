import { useCallback, useEffect, useState, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight, CalendarCheck2, ChevronLeft, ChevronRight, FileCheck2, LayoutGrid, Pause, Play, QrCode, Search, ShieldCheck, Users,
} from 'lucide-react'
import { useT } from '../lib/i18n'
import DemoBadge from './DemoBadge'

/**
 * Photos are optional: put licensed images at public/images/hero-1.jpg … hero-3.jpg.
 * Until then each slide renders its own designed backdrop.
 */
const SLIDES = [
  { img: '/images/hero-1.jpg', tag: 'Smart appointments', glow: 'rgba(56,189,248,.35)', Icon: CalendarCheck2, pos: '60% center' },
  { img: '/images/hero-2.jpg', tag: 'Digital preparation', glow: 'rgba(29,78,216,.45)', Icon: FileCheck2, pos: '50% center' },
  { img: '/images/hero-3.jpg', tag: 'Transparent tracking', glow: 'rgba(16,185,129,.30)', Icon: ShieldCheck, pos: '40% center' },
]
const DURATION = 6500

function Backdrop({ i, active }: { i: number; active: boolean }) {
  const s = SLIDES[i]
  const [ok, setOk] = useState(true)
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, clipPath: 'inset(0 0 0 12%)' }}
      animate={{ opacity: 1, clipPath: 'inset(0 0 0 0%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: reduce ? 1 : 1.12 }}
        animate={{ scale: active && !reduce ? 1.02 : 1.08 }}
        transition={{ duration: DURATION / 1000 + 1.5, ease: 'linear' }}
      >
        {ok ? (
          <img src={s.img} alt="" onError={() => setOk(false)} className="h-full w-full object-cover" style={{ objectPosition: s.pos }} />
        ) : (
          <div className="relative h-full w-full bg-[#0B1F33]">
            <div className="absolute inset-0" style={{ background: `radial-gradient(60rem 40rem at 78% 30%, ${s.glow}, transparent 60%), radial-gradient(40rem 30rem at 10% 100%, rgba(29,78,216,.35), transparent 60%)` }} />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
            <s.Icon className="absolute right-[6%] top-1/2 hidden h-[26rem] w-[26rem] -translate-y-1/2 text-white/[0.05] lg:block" strokeWidth={0.6} />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function HeroSlider() {
  const t = useT()
  const reduce = useReducedMotion()
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const running = !paused && !hover && !reduce

  const go = useCallback((n: number) => setIdx((n + SLIDES.length) % SLIDES.length), [])
  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => go(idx + 1), DURATION)
    return () => clearTimeout(id)
  }, [idx, running, go])

  // pointer parallax (desktop only)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const bgX = useTransform(sx, (v) => v * -18)
  const bgY = useTransform(sy, (v) => v * -12)
  const cardX = useTransform(sx, (v) => v * 14)
  const cardY = useTransform(sy, (v) => v * 10)
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  const lines = [t('hero.s1'), t('hero.s2'), t('hero.s3')]
  const S = SLIDES[idx]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative isolate overflow-hidden bg-[#0B1F33] text-white"
      onPointerMove={onMove}
      onPointerLeave={() => { mx.set(0); my.set(0) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <motion.div className="absolute -inset-6" style={{ x: bgX, y: bgY }}>
        <AnimatePresence initial={false}>
          <Backdrop key={idx} i={idx} active />
        </AnimatePresence>
      </motion.div>
      {/* navy overlays for legibility */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0B1F33] via-[#0B1F33]/80 to-[#0B1F33]/20" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0B1F33] via-transparent to-[#0B1F33]/40" />
      <div aria-hidden className="hero-aurora absolute -left-1/4 top-0 h-full w-[150%] opacity-50" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:min-h-[640px] lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="max-w-3xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan backdrop-blur sm:text-xs"
          >
            <span className="pulse-dot" /> {t('hero.eyebrow')}
          </motion.p>

          <h1 className="mt-6 text-[2.5rem] font-extrabold uppercase leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[4.4rem] xl:text-[4.9rem]">
            {lines.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-1">
                <motion.span
                  className={`block ${i === 2 ? 'bg-gradient-to-r from-cyan to-white bg-clip-text text-transparent' : ''}`}
                  initial={reduce ? false : { y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            {t('hero.sub')}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 grid gap-3 sm:flex sm:flex-wrap"
          >
            <Link to="/book" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-royal px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_20px_40px_-15px_rgba(29,78,216,.8)] transition hover:-translate-y-0.5 hover:bg-[#2563EB]">
              {t('hero.book')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <Link to="/track" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-4 text-xs font-extrabold uppercase tracking-wider backdrop-blur transition hover:bg-white/15 sm:px-6 sm:text-sm">
                <Search className="h-4 w-4 text-cyan" /> {t('hero.track')}
              </Link>
              <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-4 text-xs font-extrabold uppercase tracking-wider backdrop-blur transition hover:bg-white/15 sm:px-6 sm:text-sm">
                <LayoutGrid className="h-4 w-4 text-cyan" /> {t('hero.explore')}
              </a>
            </div>
          </motion.div>
        </div>

        {/* floating appointment card */}
        <motion.aside
          style={{ x: cardX, y: cardY }}
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
          className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:justify-self-end lg:w-[360px]"
          aria-label="Example appointment summary (demonstration data)"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-extrabold">{t('card.title')}</p>
            <DemoBadge />
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-1">
            <CardRow icon={CalendarCheck2} label={t('card.booking')} value={t('card.confirmed')} tone="text-emerald-300" />
            <li className="rounded-2xl bg-white/10 p-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold text-slate-300"><FileCheck2 className="h-3.5 w-3.5 text-cyan" /> {t('card.readiness')}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald" initial={reduce ? false : { width: 0 }} animate={{ width: '92%' }} transition={{ duration: 1.5, delay: 1.2 }} />
                </div>
                <span className="text-xs font-extrabold">92%</span>
              </div>
            </li>
            <CardRow icon={QrCode} label={t('card.pass')} value={t('card.ready')} tone="text-cyan" />
            <CardRow icon={Users} label={t('card.queue')} value={t('card.low')} tone="text-emerald-300" dot />
          </ul>
        </motion.aside>
      </div>

      {/* slide controls */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pb-6 sm:px-6 lg:px-8">
          <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-slate-300 sm:block">
            <span className="text-white">0{idx + 1}</span> / 0{SLIDES.length} · {S.tag}
          </span>
          <div className="flex flex-1 gap-1.5 sm:ml-4 sm:max-w-xs">
            {SLIDES.map((s, i) => (
              <button key={s.tag} onClick={() => go(i)} aria-label={`Show slide ${i + 1}: ${s.tag}`} aria-current={i === idx} className="h-6 flex-1">
                <span className="block h-1 overflow-hidden rounded-full bg-white/20">
                  {i === idx && (
                    <motion.span
                      key={`${idx}-${running}`}
                      className="block h-full bg-cyan"
                      initial={{ width: running ? '0%' : '100%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: running ? DURATION / 1000 : 0, ease: 'linear' }}
                    />
                  )}
                  {i < idx && <span className="block h-full bg-white/60" />}
                </span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1.5">
            <CtrlBtn label="Previous slide" onClick={() => go(idx - 1)}><ChevronLeft className="h-4 w-4" /></CtrlBtn>
            <CtrlBtn label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused((p) => !p)}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </CtrlBtn>
            <CtrlBtn label="Next slide" onClick={() => go(idx + 1)}><ChevronRight className="h-4 w-4" /></CtrlBtn>
          </div>
        </div>
      </div>
    </section>
  )
}

function CardRow({ icon: Icon, label, value, tone, dot }: { icon: typeof Users; label: string; value: string; tone: string; dot?: boolean }) {
  return (
    <li className="rounded-2xl bg-white/10 p-3">
      <p className="flex items-center gap-2 text-[11px] font-semibold text-slate-300"><Icon className="h-3.5 w-3.5 text-cyan" /> {label}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-sm font-extrabold ${tone}`}>{dot && <span className="pulse-dot" />}{value}</p>
    </li>
  )
}

function CtrlBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur transition hover:bg-white/15">
      {children}
    </button>
  )
}
