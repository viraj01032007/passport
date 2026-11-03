import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck2, CheckCircle2, ExternalLink, KeyRound, Loader2, MapPin, Phone, Smartphone } from 'lucide-react'
import { Page } from './Book'
import { findByMobile, serviceName, type Appointment } from '../lib/store'
import DemoBadge from '../components/DemoBadge'

function PageHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-royal">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      {sub && <p className="mt-3 text-lg text-ink">{sub}</p>}
    </div>
  )
}

function Block({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <h2 className="text-xl font-extrabold text-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink">{children}</div>
    </section>
  )
}

export function About() {
  return (
    <Page>
      <PageHead eyebrow="About" title="About PoliceFlow" sub="An independent proposal to make police verification organised, predictable and transparent." />
      <div className="mx-auto mt-10 grid max-w-3xl gap-5">
        <Block title="The problem">
          <p>Citizens visiting for passport and other verifications often face long waits, unclear document requirements and little visibility into progress.</p>
        </Block>
        <Block title="The proposal">
          <p>PoliceFlow offers 15-minute appointment slots with fixed capacity, a pre-arrival document checklist, a digital pass with a secure QR token, and online status tracking. Verification takes place at the Office of the Commissioner of Police, Navi Mumbai.</p>
          <p>The outcome of any verification is decided only by authorised police officers. PoliceFlow does not use facial recognition or automated risk scoring.</p>
        </Block>
        <Block id="privacy" title="Privacy policy (prototype)">
          <p>This demo stores bookings only in your own browser. In a production deployment, data would be encrypted, access would be role-based and audit-logged, and QR codes would carry only random, expiring tokens. Aadhaar and passport numbers are never shown in URLs, passes or public pages.</p>
        </Block>
        <Block id="terms" title="Terms and conditions (prototype)">
          <p>PoliceFlow is a demonstration. Passes generated here are not official documents and do not guarantee any appointment or outcome.</p>
        </Block>
        <Block id="accessibility" title="Accessibility">
          <p>The site supports keyboard navigation, screen readers, reduced-motion settings, and English, Marathi and Hindi. Tell us about any barrier you face through the contact page.</p>
        </Block>
      </div>
    </Page>
  )
}

export function Contact() {
  return (
    <Page>
      <PageHead eyebrow="Contact" title="Help & contact" />
      <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
        <Block title="Verification location">
          <p className="flex gap-2"><MapPin className="mt-1 h-4 w-4 shrink-0 text-royal" /> Office of the Commissioner of Police, Navi Mumbai, CBD Belapur</p>
          <Link to="/book" className="inline-flex items-center gap-2 font-bold text-royal"><CalendarCheck2 className="h-4 w-4" /> Book a slot</Link>
        </Block>
        <Block title="Emergency">
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-royal" /> Dial <strong className="text-navy">112</strong> for any emergency.</p>
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-royal" /> Cyber fraud: <strong className="text-navy">1930</strong></p>
        </Block>
        <div className="md:col-span-2">
          <Block title="Official contact details">
            <p>Phone numbers and addresses for police stations and the Commissionerate are published on the official website.</p>
            <a href="https://www.navimumbaipolice.gov.in/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-royal">
              navimumbaipolice.gov.in <ExternalLink className="h-4 w-4" />
            </a>
          </Block>
        </div>
      </div>
    </Page>
  )
}

export function Login() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [stage, setStage] = useState<'mobile' | 'otp' | 'done'>('mobile')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [list, setList] = useState<Appointment[]>([])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (stage === 'mobile') {
      if (!/^[6-9]\d{9}$/.test(mobile)) return setErr('Enter a valid 10-digit mobile number.')
      setBusy(true); await new Promise((r) => setTimeout(r, 600)); setBusy(false)
      return setStage('otp')
    }
    if (otp !== '123456') return setErr('Incorrect OTP. In this demo the OTP is 123456.')
    setBusy(true); await new Promise((r) => setTimeout(r, 500)); setBusy(false)
    setList(findByMobile(mobile))
    setStage('done')
  }

  return (
    <Page>
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Citizen login</h1>
          <DemoBadge />
        </div>
        {stage !== 'done' ? (
          <form onSubmit={submit} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-bold"><Smartphone className="h-4 w-4 text-royal" /> Mobile number</span>
              <input value={mobile} disabled={stage === 'otp'} inputMode="numeric" autoComplete="tel-national" onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-royal focus:ring-4 focus:ring-royal/10 disabled:bg-slate-50" />
            </label>
            {stage === 'otp' && (
              <motion.label initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 block">
                <span className="flex items-center gap-2 text-sm font-bold"><KeyRound className="h-4 w-4 text-royal" /> One-time password</span>
                <input value={otp} inputMode="numeric" autoComplete="one-time-code" autoFocus onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-royal focus:ring-4 focus:ring-royal/10" />
                <span className="mt-1 block text-xs text-slate-500">Simulated OTP for this demo: 123456</span>
              </motion.label>
            )}
            {err && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{err}</p>}
            <button disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 font-bold text-white hover:bg-royal disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {stage === 'mobile' ? 'Send OTP' : 'Verify & continue'}
            </button>
          </form>
        ) : null}
        {stage !== 'done' && (
          <p className="mt-5 text-center text-sm text-slate-500">
            Police staff? <Link to="/staff/login" className="font-bold text-royal">Staff login</Link> · <Link to="/admin/login" className="font-bold text-royal">Admin login</Link>
          </p>
        )}
        {stage === 'done' && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
            <p className="flex items-center gap-2 font-bold text-emerald-600"><CheckCircle2 className="h-5 w-5" /> Signed in as {mobile}</p>
            <h2 className="mt-5 font-extrabold">My appointments</h2>
            {list.length === 0 ? (
              <p className="mt-2 text-sm text-ink">No appointments for this number yet. <Link to="/book" className="font-bold text-royal">Book one</Link>.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {list.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-bold">{serviceName(a.service)}</p>
                      <p className="text-slate-500">{a.date} · {a.slot} · {a.status}</p>
                    </div>
                    <Link to={`/track?id=${a.id}`} className="shrink-0 font-bold text-royal">View</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Page>
  )
}
