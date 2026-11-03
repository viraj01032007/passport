import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CalendarClock, ClipboardCheck, Radar, Search } from 'lucide-react'
import Marquee from './Marquee'
import OfficerVisual from './OfficerVisual'

const trust = [
  { icon: CalendarClock, label: 'Smart Slot Booking' },
  { icon: ClipboardCheck, label: 'Pre-Arrival Preparation' },
  { icon: Radar, label: 'Transparent Tracking' },
]

const phrases = ['SMART GOVERNANCE', 'FASTER VERIFICATION', 'ZERO CONFUSION', 'BETTER CITIZEN EXPERIENCE', 'SECURE DIGITAL SERVICES']

export default function Hero() {
  const reduce = useReducedMotion()
  const up = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
  })

  return (
    <section className="ambient relative -mt-16 overflow-hidden pt-16 lg:-mt-[72px] lg:pt-[72px]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pt-12 md:min-h-[calc(100svh-4rem)] md:grid-cols-2 md:gap-8 md:pb-14 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[55fr_45fr] lg:gap-14 lg:px-8">
        {/* LEFT – typography */}
        <div className="relative z-10 text-center md:text-left">
          <motion.p {...up(0)} className="inline-flex items-center gap-2 rounded-full border border-royal/15 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-royal shadow-sm">
            <span className="pulse-dot" /> Police verification, made predictable
          </motion.p>

          <motion.h1
            {...up(0.08)}
            className="mt-5 text-[2.35rem] font-extrabold uppercase leading-[0.98] tracking-[-0.035em] text-navy sm:text-6xl md:text-[3.4rem] lg:text-[4.6rem] xl:text-[5.2rem]"
          >
            Smarter police verification.{' '}
            <span className="bg-gradient-to-r from-royal to-cyan bg-clip-text text-transparent">
              <span className="underline-accent">Less</span> waiting.
            </span>
          </motion.h1>

          <motion.p {...up(0.18)} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-navy-600 sm:text-lg md:mx-0">
            Book your appointment, prepare your documents and complete your verification journey without unnecessary queues.
          </motion.p>

          <motion.div {...up(0.28)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to="/book"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-7 py-4 text-base font-bold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-royal active:translate-y-0"
            >
              Book Your Appointment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-7 py-4 text-base font-bold text-navy shadow-card transition hover:-translate-y-0.5 hover:border-royal/40"
            >
              <Search className="h-4 w-4 text-royal" />
              Track Your Application
            </Link>
          </motion.div>

          <motion.ul {...up(0.38)} className="mt-8 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 md:justify-start">
            {trust.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/70 px-2 py-3 text-center text-[11px] font-bold leading-tight text-navy-600 sm:flex-row sm:rounded-full sm:px-3.5 sm:py-2 sm:text-xs"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-royal/10 text-royal sm:h-6 sm:w-6">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* RIGHT – officer visual */}
        <div className="relative pb-24 sm:pb-10 md:pb-0">
          <OfficerVisual />
        </div>
      </div>

      {/* hero marquee */}
      <div className="relative border-y border-navy/10 bg-white/60 py-4 backdrop-blur sm:py-5">
        <Marquee
          label="PoliceFlow values"
          items={phrases}
          duration={38}
          repeat={2}
          separator={<span className="inline-block h-2 w-2 rotate-45 rounded-[2px] bg-gradient-to-br from-royal to-cyan" />}
          itemClassName="text-sm font-extrabold tracking-[0.2em] text-navy sm:text-base"
        />
      </div>
    </section>
  )
}
