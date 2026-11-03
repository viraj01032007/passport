import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight, BadgeCheck, Building2, CalendarDays, ChevronDown, FileSearch, FileText, Fingerprint, Home as HomeIcon,
  MapPin, QrCode, ScanLine, ShieldCheck, Timer, UserCheck,
} from 'lucide-react'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Reveal from '../components/Reveal'
import DemoBadge from '../components/DemoBadge'
import { SERVICES, STATIONS, nextWorkingDays, slotsFor } from '../lib/store'

const Dot = () => <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" />

function SectionHead({ eyebrow, title, sub, center = false }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-royal">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">{sub}</p>}
    </Reveal>
  )
}

export default function Home() {
  return (
    <>
      <Hero />

      {/* MARQUEE 01 – digital services */}
      <section aria-label="Digital services" className="bg-navy py-5 sm:py-6">
        <Marquee
          items={['STRATEGY', 'SECURITY', 'VERIFICATION', 'TRANSPARENCY', 'DIGITAL GOVERNANCE']}
          direction="left"
          duration={30}
          repeat={3}
          separator={<span className="text-cyan">•</span>}
          itemClassName="text-xl font-extrabold tracking-tight text-white sm:text-3xl"
        />
      </section>

      <HowItWorks />

      {/* MARQUEE 03 – process */}
      <section aria-label="Verification process" className="border-y border-slate-200 bg-white py-6 sm:py-8">
        <Marquee
          items={['BOOK', 'PREPARE', 'ARRIVE', 'SCAN', 'VERIFY', 'COMPLETE']}
          direction="left"
          duration={26}
          repeat={3}
          gap="2rem"
          separator={<span className="text-royal/40">→</span>}
          itemClassName="text-3xl font-extrabold tracking-tight text-transparent [-webkit-text-stroke:1.5px_#102A43] transition-colors hover:text-navy sm:text-5xl"
        />
      </section>

      <Services />

      {/* MARQUEE 02 – citizen experience (opposite direction) */}
      <section aria-label="Citizen experience" className="bg-gradient-to-r from-royal to-[#1d4ed8] py-5 sm:py-6">
        <Marquee
          items={['FASTER SERVICES', 'LESS WAITING', 'BETTER MANAGEMENT', 'CITIZEN FIRST']}
          direction="right"
          duration={34}
          repeat={3}
          separator={<Dot />}
          itemClassName="text-lg font-bold tracking-[0.12em] text-white sm:text-2xl"
        />
      </section>

      <Readiness />
      <Stations />

      {/* MARQUEE 04 – oversized transition */}
      <section aria-label="Your time matters" className="overflow-hidden bg-canvas py-10 sm:py-16">
        <Marquee
          items={['YOUR TIME MATTERS.', 'YOUR SERVICE SHOULD TOO.']}
          direction="left"
          duration={50}
          repeat={2}
          gap="3rem"
          pauseOnHover={false}
          separator={<ShieldCheck className="h-10 w-10 text-cyan sm:h-16 sm:w-16 lg:h-20 lg:w-20" strokeWidth={1.5} />}
          itemClassName="whitespace-nowrap text-[3.25rem] font-extrabold leading-none tracking-[-0.04em] text-navy sm:text-[6rem] lg:text-[9rem]"
        />
      </section>

      <WhyVerification />
      <Faq />
      <CtaBand />
    </>
  )
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  const steps = [
    { icon: CalendarDays, title: 'Book a slot', text: 'Choose your service, station and a 15-minute slot that still has room.' },
    { icon: FileSearch, title: 'Prepare documents', text: 'See exactly what to bring and check your details before you leave home.' },
    { icon: QrCode, title: 'Arrive with your pass', text: 'Show your digital pass. Its QR holds only a random, expiring token.' },
    { icon: BadgeCheck, title: 'Complete verification', text: 'The officer completes the verification. Track the status online.' },
  ]
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="How it works" title="Four steps. No guesswork." sub="A clear path from booking to completion, so you know what happens next at every stage." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="absolute right-5 top-4 text-5xl font-extrabold text-slate-100 transition-colors group-hover:text-cyan/20">0{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-cyan">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Services ---------------- */
function Services() {
  const icons = [Fingerprint, HomeIcon, UserCheck]
  return (
    <section id="services" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead eyebrow="Services" title="Verification services" sub="Available services depend on each station's authorisation." />
          <Reveal>
            <Link to="/book" className="inline-flex items-center gap-1.5 font-bold text-royal link-underline">
              Start a booking <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = icons[i]
            return (
              <Reveal key={s.id} delay={i * 0.08}>
                <Link
                  to={`/book?service=${s.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:border-royal/30 hover:shadow-lift"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-royal to-cyan text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-navy">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{s.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-royal">
                    Book this service <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Readiness ---------------- */
function Readiness() {
  const items = [
    { label: 'Identity document', state: 'Submitted', ok: true },
    { label: 'Address proof', state: 'Submitted', ok: true },
    { label: 'Application reference', state: 'Matches entered details', ok: true },
    { label: 'Supporting document', state: 'Pending', ok: false },
  ]
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div aria-hidden className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-cyan/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <Reveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan">Pre-arrival readiness</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Arrive prepared, not uncertain.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            The readiness score shows how complete your paperwork is before your visit. It is a preparation aid only. It is not
            identity authentication, an approval or a final police decision, and nobody is rejected automatically.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-300">Document readiness</p>
              <DemoBadge />
            </div>
            <p className="mt-2 text-5xl font-extrabold">85%</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-royal to-cyan" initial={{ width: 0 }} whileInView={{ width: '85%' }} viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeOut' }} />
            </div>
            <ul className="mt-6 space-y-3">
              {items.map((it) => (
                <li key={it.label} className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2.5 font-semibold">
                    <FileText className="h-4 w-4 text-cyan" /> {it.label}
                  </span>
                  <span className={`text-xs font-bold ${it.ok ? 'text-emerald' : 'text-amber-300'}`}>{it.state}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------- Stations ---------------- */
function Stations() {
  const date = nextWorkingDays(1)[0]
  return (
    <section id="stations" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Verification location" title="Appointment availability" sub="All verifications take place at one office. Open slots shown are for the next working day and are simulated." />
        <div className="mx-auto mt-12 grid max-w-xl gap-5">
          {STATIONS.map((st, i) => {
            const slots = slotsFor(st.id, date)
            const open = slots.filter((s) => !s.full).length
            const ratio = open / slots.length
            const level = ratio > 0.5 ? ['Low', 'bg-emerald', 'text-emerald-600'] : ratio > 0.25 ? ['Moderate', 'bg-amber-400', 'text-amber-600'] : ['High', 'bg-rose-500', 'text-rose-600']
            return (
              <Reveal key={st.id} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-royal/10 text-royal">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <DemoBadge />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-navy">{st.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-600">
                    <MapPin className="h-3.5 w-3.5" /> {st.area}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-canvas p-3">
                      <p className="text-xs font-semibold text-slate-500">Open slots</p>
                      <p className="mt-0.5 text-xl font-extrabold text-navy">{open}<span className="text-sm font-semibold text-slate-400">/{slots.length}</span></p>
                    </div>
                    <div className="rounded-2xl bg-canvas p-3">
                      <p className="text-xs font-semibold text-slate-500">Expected crowd</p>
                      <p className={`mt-1 flex items-center gap-1.5 text-base font-extrabold ${level[2]}`}>
                        <span className={`h-2 w-2 rounded-full ${level[1]}`} /> {level[0]}
                      </p>
                    </div>
                  </div>
                  <Link to={`/book?station=${st.id}`} className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-navy transition hover:border-royal hover:text-royal">
                    <Timer className="h-4 w-4" /> Book a slot here
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Why verification ---------------- */
function WhyVerification() {
  const points = [
    { icon: ShieldCheck, title: 'Why it is required', text: 'Verification confirms that the details in your application, such as your address, are accurate.' },
    { icon: ScanLine, title: 'What the officer checks', text: 'Usually your identity documents and your address details, as set out in official guidance.' },
    { icon: FileSearch, title: 'If details are wrong', text: 'You may be asked for more information or documents. The outcome is decided by the police, not by this tool.' },
  ]
  return (
    <section className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Explain my verification" title="Understand the process" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl bg-white p-6 shadow-card">
                <p.icon className="h-6 w-6 text-royal" />
                <h3 className="mt-4 text-lg font-extrabold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">General information only. Refer to the official Passport Seva and police websites for current requirements.</p>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
function Faq() {
  const faqs = [
    ['Is this an official police website?', 'No. PoliceFlow is a proposed prototype for demonstration. It is not affiliated with Navi Mumbai Police or any government body.'],
    ['Can I reschedule or cancel?', 'Yes. Find your booking on the Track page and cancel it, then book a new slot. Cancelled slots are released to other citizens.'],
    ['What does the QR code on my pass contain?', 'Only a random, non-guessable appointment token. It holds no Aadhaar, passport or other personal numbers.'],
    ['Does a high readiness score mean approval?', 'No. The score only shows how complete your preparation is. The police make the final verification decision.'],
  ]
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHead center eyebrow="FAQs" title="Common questions" />
        <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-bold text-navy sm:px-6"
                aria-expanded={open === i}
              >
                {q}
                <ChevronDown className={`h-5 w-5 shrink-0 text-royal transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-navy-600 sm:px-6">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- CTA ---------------- */
function CtaBand() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-navy-700 to-royal px-6 py-14 text-center text-white sm:px-12 sm:py-20">
        <div aria-hidden className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan/30 blur-3xl" />
        <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-5xl">Ready when you are.</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-200">Pick a slot in under two minutes and arrive with everything you need.</p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/book" className="rounded-2xl bg-white px-7 py-4 font-bold text-navy transition hover:-translate-y-0.5">Book Your Appointment</Link>
          <Link to="/track" className="rounded-2xl border border-white/30 px-7 py-4 font-bold text-white transition hover:bg-white/10">Track Your Application</Link>
        </div>
      </Reveal>
    </section>
  )
}
