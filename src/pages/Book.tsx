import { useMemo, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, Check, Loader2 } from 'lucide-react'
import {
  BookingError, SERVICES, STATIONS, book, nextWorkingDays, slotsFor, type Appointment, type ServiceId,
} from '../lib/store'
import PassCard from '../components/PassCard'
import DemoBadge from '../components/DemoBadge'

const STEPS = ['Service', 'Details', 'Location', 'Date & time']

type Details = { name: string; mobile: string; email: string; reference: string; pin: string }

function validate(d: Details) {
  const e: Partial<Record<keyof Details, string>> = {}
  if (d.name.trim().length < 3) e.name = 'Enter your full name as on the application.'
  if (!/^[6-9]\d{9}$/.test(d.mobile)) e.mobile = 'Enter a valid 10-digit mobile number.'
  if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter a valid email address.'
  if (!/^[A-Za-z0-9-]{6,20}$/.test(d.reference.trim())) e.reference = '6–20 letters, numbers or hyphens.'
  if (!/^\d{6}$/.test(d.pin)) e.pin = 'Enter a 6-digit PIN code.'
  return e
}

export default function Book() {
  const [params] = useSearchParams()
  const initialService = SERVICES.find((s) => s.id === params.get('service'))?.id
  const initialStation = STATIONS.find((s) => s.id === params.get('station'))?.id ?? (STATIONS.length === 1 ? STATIONS[0].id : undefined)

  const [step, setStep] = useState(0)
  const [service, setService] = useState<ServiceId | undefined>(initialService)
  const [details, setDetails] = useState<Details>({ name: '', mobile: '', email: '', reference: '', pin: '' })
  const [touched, setTouched] = useState(false)
  const [stationId, setStationId] = useState<string | undefined>(initialStation)
  const days = useMemo(() => nextWorkingDays(6), [])
  const [date, setDate] = useState(days[0])
  const [slot, setSlot] = useState<string>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Appointment>()

  const errors = validate(details)
  const stations = STATIONS.filter((s) => !service || s.services.includes(service))
  const slots = stationId ? slotsFor(stationId, date) : []

  const canNext =
    (step === 0 && !!service) ||
    (step === 1 && Object.keys(errors).length === 0) ||
    (step === 2 && !!stationId && stations.some((s) => s.id === stationId)) ||
    (step === 3 && !!slot)

  const next = async () => {
    if (step === 1) setTouched(true)
    if (!canNext) return
    if (step < 3) return setStep(step + 1)
    setBusy(true)
    setError('')
    await new Promise((r) => setTimeout(r, 500))
    try {
      setDone(book({ ...details, service: service!, stationId: stationId!, date, slot: slot! }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof BookingError ? e.message : 'Something went wrong. Please try again.')
      setSlot(undefined)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Page>
        <div className="mx-auto max-w-2xl text-center print:hidden">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald/15 text-emerald-600">
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Appointment confirmed</h1>
          <p className="mt-2 text-navy-600">Save or print your pass. You will need it at the station.</p>
        </div>
        <div className="mt-10"><PassCard appt={done} /></div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Book an appointment</h1>
          <DemoBadge />
        </div>

        {/* progress */}
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <div className={`h-1.5 rounded-full transition-colors duration-500 ${i <= step ? 'bg-gradient-to-r from-royal to-cyan' : 'bg-slate-200'}`} />
              <p className={`mt-2 text-[11px] font-bold sm:text-xs ${i === step ? 'text-navy' : 'text-slate-400'}`}>
                <span className="hidden sm:inline">{i + 1}. </span>{s}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              {step === 0 && (
                <fieldset>
                  <legend className="text-lg font-extrabold">Select verification category</legend>
                  <div className="mt-5 grid gap-3">
                    {SERVICES.map((s) => (
                      <Choice key={s.id} active={service === s.id} onClick={() => { setService(s.id); setSlot(undefined) }}>
                        <p className="font-bold">{s.name}</p>
                        <p className="mt-0.5 text-sm text-navy-600">{s.desc}</p>
                      </Choice>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset>
                  <legend className="text-lg font-extrabold">Application details</legend>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" value={details.name} onChange={(v) => setDetails({ ...details, name: v })} error={touched ? errors.name : ''} autoComplete="name" className="sm:col-span-2" />
                    <Field label="Mobile number" value={details.mobile} onChange={(v) => setDetails({ ...details, mobile: v.replace(/\D/g, '').slice(0, 10) })} error={touched ? errors.mobile : ''} inputMode="numeric" autoComplete="tel-national" />
                    <Field label="Email" type="email" value={details.email} onChange={(v) => setDetails({ ...details, email: v })} error={touched ? errors.email : ''} autoComplete="email" />
                    <Field label="Application / reference number" value={details.reference} onChange={(v) => setDetails({ ...details, reference: v.toUpperCase() })} error={touched ? errors.reference : ''} hint="Use a made-up value for this demo." />
                    <Field label="PIN code" value={details.pin} onChange={(v) => setDetails({ ...details, pin: v.replace(/\D/g, '').slice(0, 6) })} error={touched ? errors.pin : ''} inputMode="numeric" autoComplete="postal-code" />
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset>
                  <legend className="text-lg font-extrabold">Verification location</legend>
                  <div className="mt-5 grid gap-3">
                    {stations.map((s) => (
                      <Choice key={s.id} active={stationId === s.id} onClick={() => { setStationId(s.id); setSlot(undefined) }}>
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 shrink-0 text-royal" />
                          <div>
                            <p className="font-bold">{s.name}</p>
                            <p className="text-sm text-navy-600">{s.area}</p>
                          </div>
                        </div>
                      </Choice>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset>
                  <legend className="text-lg font-extrabold">Pick a date and time</legend>
                  <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
                    {days.map((d) => {
                      const dt = new Date(d + 'T00:00')
                      return (
                        <button
                          key={d}
                          onClick={() => { setDate(d); setSlot(undefined) }}
                          className={`shrink-0 rounded-2xl border px-4 py-3 text-center transition ${date === d ? 'border-navy bg-navy text-white' : 'border-slate-200 hover:border-royal'}`}
                        >
                          <span className="block text-[11px] font-semibold uppercase opacity-70">{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                          <span className="block text-lg font-extrabold">{dt.getDate()}</span>
                          <span className="block text-[11px] font-semibold opacity-70">{dt.toLocaleDateString('en-IN', { month: 'short' })}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={s.full}
                        onClick={() => setSlot(s.time)}
                        className={`rounded-xl border px-2 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300 ${
                          slot === s.time ? 'border-royal bg-royal text-white' : 'border-slate-200 hover:border-royal'
                        }`}
                      >
                        {s.label}
                        <span className={`block text-[10px] font-semibold ${slot === s.time ? 'text-white/80' : 'text-slate-400'}`}>
                          {s.full ? 'Full' : `${s.capacity - s.booked} of ${s.capacity} left`}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Each 15-minute slot accepts a limited number of applicants. Full slots cannot be booked.</p>
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3.5 font-bold text-navy disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={next}
              disabled={busy || (step !== 1 && !canNext)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-7 py-3.5 font-bold text-white shadow-card transition hover:bg-royal disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {step === 3 ? 'Confirm booking' : 'Continue'}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </Page>
  )
}

export function Page({ children }: { children: ReactNode }) {
  return <main className="ambient min-h-[70vh] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">{children}</main>
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative w-full rounded-2xl border-2 p-4 text-left transition ${active ? 'border-royal bg-royal/5' : 'border-slate-200 hover:border-slate-300'}`}
    >
      {children}
      {active && (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-royal text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

function Field({
  label, value, onChange, error, hint, className = '', ...rest
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string; className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-bold text-navy">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition focus:ring-4 ${
          error ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-royal focus:ring-royal/10'
        }`}
      />
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}
