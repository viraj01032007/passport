import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle, ArrowRight, ArrowUpRight, Baby, BadgeCheck, Bell, Building2, CalendarCheck2, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, ExternalLink, FileSearch, FileText, Fingerprint, HeartPulse, Home as HomeIcon, Landmark, Lock, MapPin, Megaphone,
  MessageCircleQuestion, MonitorSmartphone, Navigation, Phone, QrCode, ScrollText, Search, ShieldAlert, ShieldCheck, Siren, UserRound,
  Users, type LucideIcon,
} from 'lucide-react'
import HeroSlider from '../components/HeroSlider'
import Marquee from '../components/Marquee'
import Reveal from '../components/Reveal'
import DemoBadge from '../components/DemoBadge'
import VerticalMarquee from '../components/VerticalMarquee'
import { pick, useLang, useT, type Lang } from '../lib/i18n'
import { STATIONS } from '../lib/store'
import { useContent, type NewsCat } from '../lib/content'

type L3 = { en: string; mr: string; hi: string }

function SectionHead({ eyebrow, title, sub, center = false, light = false }: { eyebrow: string; title: string; sub?: string; center?: boolean; light?: boolean }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] ${light ? 'text-cyan' : 'text-royal'} ${center ? 'justify-center' : ''}`}>
        <span className="h-px w-6 bg-current" /> {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.9rem] lg:leading-[1.08] ${light ? 'text-white' : 'text-navy'}`}>{title}</h2>
      {sub && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? 'text-slate-300' : 'text-ink'}`}>{sub}</p>}
    </Reveal>
  )
}

export default function Home() {
  return (
    <>
      <Notice />
      <HeroSlider />

      <section aria-label="Values" className="bg-navy py-4 sm:py-5">
        <Marquee
          items={['TRUST', 'SERVICE', 'SECURITY', 'TRANSPARENCY', 'CITIZEN FIRST', 'SMART GOVERNANCE']}
          duration={36}
          repeat={2}
          separator={<span className="text-cyan">•</span>}
          itemClassName="text-lg font-extrabold tracking-[0.08em] text-white sm:text-2xl"
        />
      </section>
      <section aria-label="Steps" className="border-b border-slate-200 bg-white py-3.5 sm:py-4">
        <Marquee
          items={['BOOK YOUR SLOT', 'PREPARE YOUR DOCUMENTS', 'ARRIVE ON TIME', 'COMPLETE VERIFICATION']}
          direction="right"
          duration={44}
          repeat={2}
          separator={<ArrowRight className="h-4 w-4 text-royal" />}
          itemClassName="text-sm font-bold tracking-[0.18em] text-navy-600 sm:text-base"
        />
      </section>

      <QuickServices />
      <Journey />
      <Helplines />
      <Stations />
      <News />
      <Institution />
      <Explainer />
      <Faq />
      <CtaBand />
    </>
  )
}

function Notice() {
  const { notice } = useContent()
  if (!notice.trim()) return null
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <p className="mx-auto flex max-w-7xl items-start gap-2 px-4 py-2.5 text-sm font-semibold text-amber-900 sm:px-6 lg:px-8">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
      </p>
    </div>
  )
}

/* ---------------- Quick citizen services ---------------- */
type Svc = { icon: LucideIcon; t: L3; d: L3; to: string; external?: boolean }
const SERVICES: Svc[] = [
  { icon: Fingerprint, to: '/book?service=passport', t: { en: 'Passport Verification', mr: 'पासपोर्ट पडताळणी', hi: 'पासपोर्ट सत्यापन' }, d: { en: 'Book your verification slot at the Commissionerate.', mr: 'आयुक्तालयात पडताळणीची वेळ घ्या.', hi: 'आयुक्तालय में सत्यापन स्लॉट बुक करें.' } },
  { icon: ScrollText, to: 'https://www.passportindia.gov.in/', external: true, t: { en: 'Police Clearance', mr: 'पोलीस क्लिअरन्स', hi: 'पुलिस क्लीयरेंस' }, d: { en: 'Apply for a Police Clearance Certificate through Passport Seva.', mr: 'पासपोर्ट सेवेद्वारे पोलीस क्लिअरन्स प्रमाणपत्रासाठी अर्ज करा.', hi: 'पासपोर्ट सेवा के ज़रिए PCC के लिए आवेदन करें.' } },
  { icon: Megaphone, to: 'https://citizen.mahapolice.gov.in/', external: true, t: { en: 'Citizen Complaints', mr: 'नागरिक तक्रार', hi: 'नागरिक शिकायत' }, d: { en: 'Register a complaint on the Maharashtra Police citizen portal.', mr: 'महाराष्ट्र पोलीस नागरिक पोर्टलवर तक्रार नोंदवा.', hi: 'महाराष्ट्र पुलिस नागरिक पोर्टल पर शिकायत दर्ज करें.' } },
  { icon: FileText, to: 'https://citizen.mahapolice.gov.in/', external: true, t: { en: 'Online FIR Information', mr: 'ऑनलाइन एफआयआर माहिती', hi: 'ऑनलाइन एफआईआर जानकारी' }, d: { en: 'View FIR and related services on the official citizen portal.', mr: 'अधिकृत नागरिक पोर्टलवर एफआयआर सेवा पहा.', hi: 'आधिकारिक नागरिक पोर्टल पर एफआईआर सेवाएँ देखें.' } },
  { icon: MonitorSmartphone, to: 'https://cybercrime.gov.in/', external: true, t: { en: 'Cybercrime Assistance', mr: 'सायबर गुन्हे सहाय्य', hi: 'साइबर अपराध सहायता' }, d: { en: 'Report online fraud. For money lost, call 1930 immediately.', mr: 'ऑनलाइन फसवणूक नोंदवा. पैसे गेल्यास त्वरित 1930 वर कॉल करा.', hi: 'ऑनलाइन धोखाधड़ी रिपोर्ट करें. पैसे गए हों तो तुरंत 1930 पर कॉल करें.' } },
  { icon: Building2, to: '/#stations', t: { en: 'Police Station Directory', mr: 'पोलीस ठाणे निर्देशिका', hi: 'पुलिस थाना निर्देशिका' }, d: { en: 'Find stations by area and open directions.', mr: 'परिसरानुसार ठाणी शोधा आणि मार्ग पहा.', hi: 'क्षेत्र से थाने खोजें और रास्ता देखें.' } },
  { icon: CalendarCheck2, to: '/book', t: { en: 'Appointment Booking', mr: 'भेट नोंदणी', hi: 'अपॉइंटमेंट बुकिंग' }, d: { en: 'Pick a 15-minute slot with live capacity.', mr: 'उपलब्ध जागांसह १५ मिनिटांची वेळ निवडा.', hi: 'उपलब्ध क्षमता के साथ 15 मिनट का स्लॉट चुनें.' } },
  { icon: Search, to: '/track', t: { en: 'Application Tracking', mr: 'अर्जाचा मागोवा', hi: 'आवेदन ट्रैकिंग' }, d: { en: 'Check status, view your pass or cancel.', mr: 'स्थिती तपासा, पास पहा किंवा रद्द करा.', hi: 'स्थिति देखें, पास देखें या रद्द करें.' } },
]

function ServiceCard({ s, hidden = false, compact = false }: { s: Svc; hidden?: boolean; compact?: boolean }) {
  const t = useT()
  const { lang } = useLang()
  const cls = `group flex h-full gap-4 rounded-2xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-royal/30 hover:shadow-lift ${compact ? 'flex-col p-4' : 'items-start p-4 sm:p-5'}`
  const inner = (
    <>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${s.external ? 'bg-slate-100 text-navy group-hover:bg-navy group-hover:text-white' : 'bg-royal/10 text-royal group-hover:bg-royal group-hover:text-white'}`}>
        <s.icon className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-extrabold leading-snug text-navy">{pick(lang, s.t)}</span>
          {s.external
            ? <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-navy" />
            : <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-royal transition-transform duration-300 group-hover:translate-x-1" />}
        </span>
        <span className="mt-1 text-[13px] leading-relaxed text-ink">{pick(lang, s.d)}</span>
        <span className={`mt-2.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.external ? 'bg-slate-100 text-slate-600' : 'bg-royal/10 text-royal'}`}>
          {s.external ? t('svc.official') : t('svc.pf')}
        </span>
      </span>
    </>
  )
  const tab = hidden ? -1 : undefined
  return s.external
    ? <a href={s.to} target="_blank" rel="noreferrer" tabIndex={tab} className={cls}>{inner}</a>
    : <Link to={s.to} tabIndex={tab} className={cls}>{inner}</Link>
}

function QuickServices() {
  const t = useT()
  const loc = STATIONS[0]
  return (
    <section id="services" className="scroll-mt-24 bg-canvas py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[280px_1fr] md:gap-8 lg:grid-cols-[370px_1fr] lg:gap-14 lg:px-8">
        {/* LEFT – vertical information marquee (tablet & desktop) */}
        <div className="order-2 min-w-0 md:order-1">
          <div className="relative hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 md:block lg:p-4">
            <p className="flex items-center gap-2 px-2 pb-3 pt-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-navy-600">
              <span className="pulse-dot" /> {t('svc.eyebrow')}
            </p>
            <VerticalMarquee
              label={t('svc.eyebrow')}
              duration={32}
              gap="0.875rem"
              className="h-[560px] lg:h-[600px]"
              render={(hidden) => SERVICES.map((s) => <ServiceCard key={s.t.en} s={s} hidden={hidden} />)}
            />
          </div>

          {/* mobile – compact swipe row */}
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden" role="region" aria-label={t('svc.eyebrow')}>
            {SERVICES.map((s) => (
              <div key={s.t.en} className="w-[72%] shrink-0 snap-start min-[480px]:w-[46%]">
                <ServiceCard s={s} compact />
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400 md:hidden">Swipe for more services →</p>
        </div>

        {/* RIGHT – heading and primary actions */}
        <div className="order-1 min-w-0 md:order-2">
          <SectionHead eyebrow={t('svc.eyebrow')} title={t('svc.title')} sub={t('svc.sub')} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Reveal className="lg:col-span-2">
              <Link to="/book" className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-royal p-6 text-white shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan/25 blur-2xl" />
                <div className="relative">
                  <CalendarCheck2 className="h-8 w-8 text-cyan" />
                  <p className="mt-4 text-2xl font-extrabold sm:text-3xl">{t('nav.book')}</p>
                  <p className="mt-1 max-w-md text-sm text-slate-200">Passport, tenant and character verification at {loc.name}.</p>
                </div>
                <span className="relative inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-navy transition group-hover:gap-3">
                  Start booking <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Reveal>
            <Reveal delay={0.06}>
              <Link to="/track" className="group flex h-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-royal/10 text-royal"><Search className="h-6 w-6" /></span>
                <span className="flex-1">
                  <span className="block font-extrabold text-navy">{t('nav.track')}</span>
                  <span className="block text-sm text-ink">Status, digital pass or cancel</span>
                </span>
                <ArrowRight className="h-5 w-5 text-royal transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
            <Reveal delay={0.12}>
              <a href="#stations" className="group flex h-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald/10 text-emerald-600"><MapPin className="h-6 w-6" /></span>
                <span className="flex-1">
                  <span className="block font-extrabold text-navy">Verification location</span>
                  <span className="block text-sm text-ink">{loc.area}</span>
                </span>
                <ArrowRight className="h-5 w-5 text-royal transition-transform group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="rounded-full bg-royal/10 px-2 py-0.5 font-bold text-royal">{t('svc.pf')}</span> opens on this site</span>
            <span className="flex items-center gap-1.5"><span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{t('svc.official')}</span> opens a government website</span>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Journey ---------------- */
const STEPS: { icon: LucideIcon; t: L3; d: L3 }[] = [
  { icon: CalendarCheck2, t: { en: 'Book', mr: 'नोंदणी', hi: 'बुक करें' }, d: { en: 'Select your verification category, location and an available appointment slot.', mr: 'पडताळणीचा प्रकार, ठिकाण आणि उपलब्ध वेळ निवडा.', hi: 'सत्यापन श्रेणी, स्थान और उपलब्ध स्लॉट चुनें.' } },
  { icon: FileSearch, t: { en: 'Prepare', mr: 'तयारी', hi: 'तैयारी' }, d: { en: 'Upload documents and complete preliminary readiness checks.', mr: 'कागदपत्रे अपलोड करा आणि प्राथमिक तयारी तपासणी पूर्ण करा.', hi: 'दस्तावेज़ अपलोड करें और प्रारंभिक तैयारी जाँच पूरी करें.' } },
  { icon: QrCode, t: { en: 'Arrive', mr: 'उपस्थित राहा', hi: 'पहुँचें' }, d: { en: 'Bring your verification pass and report at your allocated time.', mr: 'पडताळणी पास घेऊन ठरलेल्या वेळी हजर राहा.', hi: 'सत्यापन पास लेकर तय समय पर पहुँचें.' } },
  { icon: BadgeCheck, t: { en: 'Verify', mr: 'पडताळणी', hi: 'सत्यापन' }, d: { en: "Present your QR code and complete the authorised officer's verification process.", mr: 'QR कोड दाखवा आणि अधिकृत अधिकाऱ्याची पडताळणी प्रक्रिया पूर्ण करा.', hi: 'QR कोड दिखाएँ और अधिकृत अधिकारी की सत्यापन प्रक्रिया पूरी करें.' } },
]

function Journey() {
  const t = useT()
  const { lang } = useLang()
  const ref = useRef<HTMLOListElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const reduce = useReducedMotion()
  return (
    <section id="journey" className="relative scroll-mt-24 overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t('jr.eyebrow')} title={t('jr.title')} center />
        <ol ref={ref} className="relative mt-14 grid gap-6 md:grid-cols-4 md:gap-5">
          {/* horizontal line (desktop) */}
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-[3px] rounded-full bg-slate-200 md:block">
            <motion.div className="journey-line h-full rounded-full bg-gradient-to-r from-royal via-cyan to-emerald" initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: inView ? 1 : 0 }} transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }} />
          </div>
          {/* vertical line (mobile) */}
          <div aria-hidden className="absolute bottom-8 left-8 top-8 w-[3px] rounded-full bg-slate-200 md:hidden">
            <motion.div className="h-full w-full origin-top rounded-full bg-gradient-to-b from-royal via-cyan to-emerald" initial={{ scaleY: reduce ? 1 : 0 }} animate={{ scaleY: inView ? 1 : 0 }} transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }} />
          </div>
          {STEPS.map((s, i) => (
            <motion.li
              key={s.t.en}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.35 }}
              className="relative flex gap-5 md:flex-col md:items-center md:text-center"
            >
              <span className="relative z-10 grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-4 border-white bg-navy text-cyan shadow-lift">
                <s.icon className="h-7 w-7" />
              </span>
              <div className="pt-1 md:pt-0">
                <p className="text-xs font-extrabold tracking-[0.2em] text-royal">0{i + 1}</p>
                <h3 className="mt-1 text-xl font-extrabold uppercase tracking-wide text-navy">{pick(lang, s.t)}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink">{pick(lang, s.d)}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <Reveal className="mt-12 text-center">
          <Link to="/book" className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-bold text-white transition hover:bg-royal">
            {t('nav.book')} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------- Helplines ---------------- */
function Helplines() {
  const t = useT()
  const lines: { n: string; l: string; icon: LucideIcon }[] = [
    { n: '112', l: 'Emergency', icon: Siren },
    { n: '1091', l: 'Women helpline', icon: UserRound },
    { n: '1098', l: 'Childline', icon: Baby },
    { n: '14567', l: 'Senior citizens', icon: Users },
    { n: '1930', l: 'Cybercrime', icon: ShieldAlert },
    { n: '108', l: 'Ambulance', icon: HeartPulse },
  ]
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-24">
      <div aria-hidden className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-royal/40 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -left-20 h-[24rem] w-[24rem] rounded-full bg-cyan/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
        <SectionHead eyebrow="24×7" title={t('help.title')} sub={t('help.sub')} light />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {lines.map((x, i) => (
            <Reveal key={x.n} delay={i * 0.05}>
              <div className="h-full">
                <a href={`tel:${x.n}`} className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan/50 hover:bg-white/10 sm:p-5">
                  <x.icon className="h-5 w-5 text-cyan" />
                  <span className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">{x.n}</span>
                  <span className="mt-1 flex items-center justify-between text-sm font-semibold text-slate-300">
                    {x.l} <Phone className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </span>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Verification location ---------------- */
function Stations() {
  const t = useT()
  const loc = STATIONS[0]
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Commissioner of Police Office CBD Belapur Navi Mumbai')}`
  return (
    <section id="stations" className="scroll-mt-24 bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t('st.eyebrow')} title="Verification location" />
        <Reveal className="mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-royal p-6 text-white shadow-lift sm:p-10">
            <div aria-hidden className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-cyan/25 blur-3xl" />
            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/20 px-3 py-1 text-xs font-bold text-emerald-200">
                  <BadgeCheck className="h-3.5 w-3.5" /> All verifications take place here
                </span>
                <h3 className="mt-4 text-2xl font-extrabold sm:text-4xl">{loc.name}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-slate-200"><MapPin className="h-4 w-4" /> {loc.area}</p>
                <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                  {['Passport verification', 'Tenant verification', 'Character verification'].map((x) => (
                    <li key={x} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-semibold">{x}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:w-64 md:grid-cols-1">
                <Link to="/book" className="flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-bold text-navy transition hover:-translate-y-0.5">
                  <CalendarCheck2 className="h-4 w-4" /> Book a slot
                </Link>
                <a href={maps} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/30 py-3.5 font-bold transition hover:bg-white/10">
                  <Navigation className="h-4 w-4" /> Get directions
                </a>
              </div>
            </div>
          </div>
        </Reveal>
        <p className="mt-4 text-xs text-slate-500">
          For phone numbers and office hours, see the official{' '}
          <a href="https://www.navimumbaipolice.gov.in/" target="_blank" rel="noreferrer" className="font-semibold text-royal underline">Navi Mumbai Police website</a>.
        </p>
      </div>
    </section>
  )
}

/* ---------------- News carousel ---------------- */
const CAT_STYLE: Record<NewsCat, { icon: LucideIcon; tone: string }> = {
  'Cybercrime Alerts': { icon: ShieldAlert, tone: 'from-rose-500 to-orange-400' },
  'Citizen Information': { icon: ClipboardList, tone: 'from-royal to-cyan' },
  'Police Initiatives': { icon: CalendarCheck2, tone: 'from-emerald to-teal-400' },
  'Public Awareness': { icon: Lock, tone: 'from-indigo-500 to-royal' },
  'Important Announcements': { icon: Bell, tone: 'from-amber-500 to-rose-400' },
}

function News() {
  const t = useT()
  const { news } = useContent()
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 400), behavior: 'smooth' })
  }
  return (
    <section className="overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <SectionHead eyebrow={t('news.eyebrow')} title={t('news.title')} />
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scroll(-1)} aria-label="Previous news" className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-navy transition hover:border-royal hover:text-royal"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => scroll(1)} aria-label="Next news" className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-navy transition hover:border-royal hover:text-royal"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><DemoBadge /> Sample articles for demonstration. Not official announcements.</p>
      </div>
      <div ref={ref} className="no-scrollbar mx-auto mt-8 flex max-w-7xl snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 lg:px-8">
        {news.length === 0 && <p className="text-sm text-slate-500">No updates right now.</p>}
        {news.map((item, i) => { const n = { ...item, ...CAT_STYLE[item.cat] }; return (
          <Reveal key={n.id} delay={i * 0.06} className="w-[82%] shrink-0 snap-start min-[480px]:w-[60%] md:w-[40%] lg:w-[31%]">
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${n.tone}`}>
                {n.image ? (
                  <img src={n.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    <n.icon className="absolute -bottom-6 -right-6 h-40 w-40 text-white/25 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1} />
                  </>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-navy">{n.cat}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <time className="text-xs font-semibold text-slate-500" dateTime={n.date}>
                  {new Date(n.date + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </time>
                <h3 className="mt-2 text-lg font-extrabold leading-snug text-navy">{n.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink">{n.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-royal">
                  Read more <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </article>
          </Reveal>
        ) })}
      </div>
    </section>
  )
}

/* ---------------- Institution ---------------- */
function Institution() {
  const panels = [
    { icon: Landmark, title: 'A proposal for the Commissionerate', text: 'PoliceFlow is an independent proposal to organise verification appointments for Navi Mumbai Police. It has not been adopted or endorsed by the department.' },
    { icon: Lock, title: 'Privacy by design', text: 'QR codes hold only random tokens. Aadhaar and passport numbers are never shown in URLs, passes or public pages. Officers see only what their duty needs.' },
    { icon: ScrollText, title: 'Official information stays official', text: 'Leadership, orders, notices and legal procedures are published only on the official website. PoliceFlow links to it rather than copying it.' },
  ]
  return (
    <section id="institution" className="scroll-mt-24 bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Institutional information" title="How PoliceFlow would be governed" />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {panels.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-card">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-cyan"><p.icon className="h-6 w-6" /></span>
                <h3 className="mt-5 text-xl font-extrabold text-navy">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-5">
          <a href="https://www.navimumbaipolice.gov.in/" target="_blank" rel="noreferrer"
            className="group flex flex-col items-start justify-between gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-6 transition hover:border-royal sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-lg font-extrabold text-navy">Leadership, notices and official announcements</p>
              <p className="mt-1 text-sm text-ink">Published on the official Navi Mumbai Police website.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition group-hover:bg-royal">
              Visit official site <ExternalLink className="h-4 w-4" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------- Explainer + assistant ---------------- */
const EXPLAIN: { icon: LucideIcon; t: L3; d: L3 }[] = [
  { icon: Fingerprint, t: { en: 'Passport-related verification', mr: 'पासपोर्ट संबंधित पडताळणी', hi: 'पासपोर्ट संबंधित सत्यापन' }, d: { en: 'Confirms the identity and address details in your passport application.', mr: 'पासपोर्ट अर्जातील ओळख व पत्त्याची माहिती निश्चित करते.', hi: 'पासपोर्ट आवेदन में पहचान और पते की जानकारी की पुष्टि करता है.' } },
  { icon: HomeIcon, t: { en: 'Address verification', mr: 'पत्ता पडताळणी', hi: 'पता सत्यापन' }, d: { en: 'Checks that you live at the address you gave.', mr: 'दिलेल्या पत्त्यावर तुम्ही राहता याची खात्री करते.', hi: 'जाँचता है कि आप दिए गए पते पर रहते हैं.' } },
  { icon: ScrollText, t: { en: 'Police clearance procedures', mr: 'पोलीस क्लिअरन्स प्रक्रिया', hi: 'पुलिस क्लीयरेंस प्रक्रिया' }, d: { en: 'Clearance certificates follow their own official process and portal.', mr: 'क्लिअरन्स प्रमाणपत्रांसाठी स्वतंत्र अधिकृत प्रक्रिया व पोर्टल आहे.', hi: 'क्लीयरेंस प्रमाणपत्र की अपनी आधिकारिक प्रक्रिया और पोर्टल है.' } },
  { icon: FileText, t: { en: 'Required supporting documents', mr: 'आवश्यक कागदपत्रे', hi: 'ज़रूरी दस्तावेज़' }, d: { en: 'Originals of identity and address proof, plus self-attested copies.', mr: 'ओळख व पत्त्याचे मूळ पुरावे आणि स्वसाक्षांकित प्रती.', hi: 'पहचान और पते के मूल प्रमाण, साथ में स्व-सत्यापित प्रतियाँ.' } },
  { icon: ShieldCheck, t: { en: 'What happens during verification', mr: 'पडताळणी दरम्यान काय होते', hi: 'सत्यापन के दौरान क्या होता है' }, d: { en: 'The officer checks your documents and may ask simple questions about your details.', mr: 'अधिकारी कागदपत्रे तपासतात आणि माहितीबाबत साधे प्रश्न विचारू शकतात.', hi: 'अधिकारी दस्तावेज़ जाँचते हैं और आपकी जानकारी पर सरल प्रश्न पूछ सकते हैं.' } },
  { icon: Bell, t: { en: 'What happens after the visit', mr: 'भेटीनंतर काय होते', hi: 'मुलाक़ात के बाद क्या होता है' }, d: { en: 'The police submit their report through the official channel. Track progress here.', mr: 'पोलीस अधिकृत माध्यमातून अहवाल सादर करतात. प्रगती येथे पहा.', hi: 'पुलिस आधिकारिक माध्यम से रिपोर्ट भेजती है. प्रगति यहाँ देखें.' } },
]

const QA: { q: L3; a: L3 }[] = [
  { q: { en: 'How do I book an appointment?', mr: 'भेटीची वेळ कशी घ्यायची?', hi: 'अपॉइंटमेंट कैसे बुक करें?' }, a: { en: 'Tap “Book Appointment”, choose your service, enter your details and pick a 15-minute slot that still has room. You will get a digital pass.', mr: '“भेटीची वेळ घ्या” वर टॅप करा, सेवा निवडा, माहिती भरा आणि उपलब्ध १५ मिनिटांची वेळ निवडा. तुम्हाला डिजिटल पास मिळेल.', hi: '“अपॉइंटमेंट बुक करें” पर टैप करें, सेवा चुनें, जानकारी भरें और खाली 15 मिनट का स्लॉट चुनें. आपको डिजिटल पास मिलेगा.' } },
  { q: { en: 'Which documents should I bring?', mr: 'कोणती कागदपत्रे आणावीत?', hi: 'कौन से दस्तावेज़ लाने हैं?' }, a: { en: 'Original identity proof, original address proof, your application reference and self-attested copies. Your pass lists the exact checklist for your service.', mr: 'मूळ ओळखपत्र, मूळ पत्त्याचा पुरावा, अर्ज क्रमांक आणि स्वसाक्षांकित प्रती. तुमच्या पासवर सेवेनुसार यादी असते.', hi: 'मूल पहचान प्रमाण, मूल पता प्रमाण, आवेदन संदर्भ और स्व-सत्यापित प्रतियाँ. आपके पास पर सेवा के अनुसार सूची होती है.' } },
  { q: { en: 'Can I reschedule?', mr: 'वेळ बदलता येईल का?', hi: 'क्या समय बदल सकते हैं?' }, a: { en: 'Yes. Open Track Application, cancel the current booking and book a new slot. The old slot is released for others.', mr: 'होय. “अर्जाची स्थिती” उघडा, सध्याची भेट रद्द करा आणि नवीन वेळ घ्या.', hi: 'हाँ. “आवेदन की स्थिति” खोलें, मौजूदा बुकिंग रद्द करें और नया स्लॉट बुक करें.' } },
  { q: { en: 'Does a high readiness score mean approval?', mr: 'जास्त तयारी गुण म्हणजे मंजुरी का?', hi: 'क्या उच्च तैयारी स्कोर का अर्थ स्वीकृति है?' }, a: { en: 'No. It only shows how prepared your documents are. The police make the final verification decision.', mr: 'नाही. तो फक्त कागदपत्रांची तयारी दाखवतो. अंतिम निर्णय पोलिसांचा असतो.', hi: 'नहीं. यह केवल दस्तावेज़ों की तैयारी दिखाता है. अंतिम निर्णय पुलिस का होता है.' } },
]

function Explainer() {
  const t = useT()
  const { lang, setLang } = useLang()
  const [active, setActive] = useState(0)
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t('exp.eyebrow')} title={t('exp.title')} />
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {EXPLAIN.map((e, i) => (
              <Reveal key={e.t.en} delay={(i % 2) * 0.06}>
                <div className="flex h-full gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-royal/30 hover:bg-canvas">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-royal/10 text-royal"><e.icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="font-extrabold text-navy">{pick(lang, e.t)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink">{pick(lang, e.d)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-navy text-white shadow-lift">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5">
                <p className="flex items-center gap-2 font-extrabold"><MessageCircleQuestion className="h-5 w-5 text-cyan" /> {t('asst.title')}</p>
                <div className="flex rounded-full bg-white/10 p-1 text-xs font-bold" role="group" aria-label="Assistant language">
                  {(['en', 'mr', 'hi'] as Lang[]).map((l) => (
                    <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-full px-2.5 py-1 transition ${lang === l ? 'bg-white text-navy' : 'text-slate-300'}`}>
                      {l === 'en' ? 'EN' : l === 'mr' ? 'मरा' : 'हिं'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-3 p-5">
                <p className="text-xs text-slate-400">{t('asst.hint')}</p>
                <AnimatePresence mode="wait">
                  <motion.div key={`${lang}-${active}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-3">
                    <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-royal px-4 py-2.5 text-sm font-semibold">{pick(lang, QA[active].q)}</p>
                    <p className="w-fit max-w-[92%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm leading-relaxed text-slate-100">{pick(lang, QA[active].a)}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
                {QA.map((x, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${i === active ? 'border-cyan bg-cyan/15 text-white' : 'border-white/15 text-slate-300 hover:border-white/40'}`}>
                    {pick(lang, x.q)}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs text-slate-500">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> General information only. Follow the official Passport Seva and police websites for current requirements.
        </p>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
function Faq() {
  const faqs = [
    ['Is this an official police website?', 'No. PoliceFlow is an independent prototype proposed for Navi Mumbai Police. It is not affiliated with or endorsed by the department or any government body.'],
    ['Where does verification take place?', 'At the Office of the Commissioner of Police, Navi Mumbai, at the slot you book.'],
    ['What does the QR code on my pass contain?', 'Only a random, non-guessable appointment token. It holds no Aadhaar, passport or other personal numbers.'],
    ['Can I reschedule or cancel?', 'Yes. Find your booking on the Track page, cancel it and book a new slot.'],
  ]
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-24 border-t border-slate-200 bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHead center eyebrow="FAQs" title="Common questions" />
        <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-bold text-navy sm:px-6" aria-expanded={open === i}>
                {q}
                <ChevronDown className={`h-5 w-5 shrink-0 text-royal transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink sm:px-6">{a}</p>
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
  const t = useT()
  return (
    <section className="bg-canvas px-4 pb-20 sm:px-6 lg:px-8">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy-900 via-navy to-royal px-6 py-14 text-center text-white sm:px-12 sm:py-20">
        <div aria-hidden className="hero-aurora absolute inset-0 opacity-60" />
        <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-5xl">{t('cta.title')}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-200">{t('cta.sub')}</p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/book" className="rounded-xl bg-white px-7 py-4 font-bold text-navy transition hover:-translate-y-0.5">{t('hero.book')}</Link>
          <Link to="/track" className="rounded-xl border border-white/30 px-7 py-4 font-bold text-white transition hover:bg-white/10">{t('hero.track')}</Link>
        </div>
      </Reveal>
    </section>
  )
}
