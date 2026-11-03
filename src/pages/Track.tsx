import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Search, XCircle } from 'lucide-react'
import { cancelAppointment, findAppointment, type Appointment } from '../lib/store'
import PassCard from '../components/PassCard'
import { Page } from './Book'

const FLOW = ['Confirmed', 'Checked in', 'Completed'] as const

export default function Track() {
  const [params] = useSearchParams()
  const initial = params.get('id') ?? ''
  const [q, setQ] = useState(initial.toUpperCase())
  const [result, setResult] = useState<Appointment | null | undefined>(() => (initial ? findAppointment(initial) ?? null : undefined))

  const search = (e: FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    setResult(findAppointment(q) ?? null)
  }

  const cancel = () => {
    if (!result) return
    cancelAppointment(result.id)
    setResult(findAppointment(result.id) ?? null)
  }

  const stage = result ? FLOW.indexOf(result.status as (typeof FLOW)[number]) : -1

  return (
    <Page>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Track your application</h1>
        <p className="mt-2 text-navy-600">Enter your appointment ID (e.g. PF-…) or application reference number.</p>

        <form onSubmit={search} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Appointment ID or reference</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value.toUpperCase())}
              placeholder="PF-261104-XXXXX"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base font-semibold outline-none focus:border-royal focus:ring-4 focus:ring-royal/10"
            />
          </label>
          <button className="rounded-2xl bg-navy px-7 py-4 font-bold text-white hover:bg-royal">Track</button>
        </form>

        {result === null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card">
            <p className="font-bold">No appointment found</p>
            <p className="mt-1 text-sm text-navy-600">Check the ID and try again. Demo bookings are stored only in this browser.</p>
            <Link to="/book" className="mt-5 inline-flex rounded-2xl bg-navy px-6 py-3 font-bold text-white">Book an appointment</Link>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-8">
              {result.status === 'Cancelled' ? (
                <p className="flex items-center gap-2 font-bold text-rose-600"><XCircle className="h-5 w-5" /> This appointment was cancelled and its slot released.</p>
              ) : (
                <ol className="grid grid-cols-3 gap-2">
                  {FLOW.map((s, i) => (
                    <li key={s} className="text-center">
                      {i <= stage ? <CheckCircle2 className="mx-auto h-7 w-7 text-emerald" /> : <Circle className="mx-auto h-7 w-7 text-slate-300" />}
                      <p className={`mt-2 text-xs font-bold sm:text-sm ${i <= stage ? 'text-navy' : 'text-slate-400'}`}>{s}</p>
                    </li>
                  ))}
                </ol>
              )}
              {result.status === 'Confirmed' && (
                <button onClick={cancel} className="mt-6 w-full rounded-2xl border border-rose-200 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 sm:w-auto sm:px-6">
                  Cancel appointment
                </button>
              )}
            </div>
            <PassCard appt={result} actions={result.status !== 'Cancelled'} />
          </motion.div>
        )}
      </div>
    </Page>
  )
}
