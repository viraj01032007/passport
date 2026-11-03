import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, BadgeCheck, CheckCircle2, Circle, ClipboardCheck, FileQuestion, KeyRound, Loader2, LogOut, RotateCcw,
  ShieldCheck, UserCheck, User as UserIcon, XCircle,
} from 'lucide-react'
import { DEMO_ACCOUNTS, login, logout, useSession, type Role, type Session } from '../../lib/auth'
import { addLog } from '../../lib/audit'
import { SERVICES, serviceName, setStatus, stationById, type Appointment, type Status } from '../../lib/store'

export const fmtTime = (ms: number) =>
  new Date(ms).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function useStoreTick() {
  const [, setN] = useState(0)
  useEffect(() => {
    const on = () => setN((n) => n + 1)
    window.addEventListener('pf-store', on)
    return () => window.removeEventListener('pf-store', on)
  }, [])
}

/* ---------------- Login ---------------- */
export function PortalLogin({ role }: { role: Role }) {
  const nav = useNavigate()
  const session = useSession()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const home = role === 'admin' ? '/admin' : '/staff'
  if (session?.role === role) return <Navigate to={home} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(u, p, role)
      nav(home, { replace: true })
    } catch (x) {
      setErr((x as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const demo = DEMO_ACCOUNTS.filter((a) => a.role === role)

  return (
    <main className="min-h-[75vh] bg-gradient-to-b from-navy-900 to-navy px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="text-center text-white">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-cyan"><ShieldCheck className="h-7 w-7" /></span>
          <h1 className="mt-4 text-3xl font-extrabold">{role === 'admin' ? 'Head admin login' : 'Staff login'}</h1>
          <p className="mt-1 text-sm text-slate-300">{role === 'admin' ? 'Manage applications, staff and website content.' : 'Scan passes and process verifications.'}</p>
        </div>
        <form onSubmit={submit} className="mt-8 rounded-3xl bg-white p-6 shadow-lift sm:p-8">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-bold text-navy"><UserIcon className="h-4 w-4 text-royal" /> Username</span>
            <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoCapitalize="none" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-royal focus:ring-4 focus:ring-royal/10" />
          </label>
          <label className="mt-4 block">
            <span className="flex items-center gap-2 text-sm font-bold text-navy"><KeyRound className="h-4 w-4 text-royal" /> Password</span>
            <input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-royal focus:ring-4 focus:ring-royal/10" />
          </label>
          {err && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{err}</p>}
          <button disabled={busy || !u || !p} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 font-bold text-white hover:bg-royal disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            <p className="font-bold">Demo accounts</p>
            {demo.map((a) => <p key={a.username} className="font-mono">{a.username} / {a.password}</p>)}
            <p className="mt-1">Change these from the admin panel. Demo sign-in runs in the browser and is not secure for real use.</p>
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            {role === 'admin' ? <Link to="/staff/login" className="font-bold text-royal">Staff login instead</Link> : <Link to="/admin/login" className="font-bold text-royal">Head admin login instead</Link>}
          </p>
        </form>
      </div>
    </main>
  )
}

/* ---------------- Guard + shell ---------------- */
export function RequireRole({ role, children }: { role: Role; children: (s: Session) => ReactNode }) {
  const s = useSession()
  const loc = useLocation()
  if (!s || s.role !== role) return <Navigate to={role === 'admin' ? '/admin/login' : '/staff/login'} replace state={{ from: loc.pathname }} />
  return <>{children(s)}</>
}

export function PortalShell({ session, title, children, tabs }: { session: Session; title: string; children: ReactNode; tabs?: ReactNode }) {
  const nav = useNavigate()
  return (
    <main className="min-h-[80vh] bg-canvas">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-royal">{session.role === 'admin' ? 'Head admin' : 'Verification staff'}</p>
            <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-sm sm:block">
              <span className="block font-bold text-navy">{session.name}</span>
              <span className="block text-xs text-slate-500">@{session.username}</span>
            </span>
            <button onClick={() => { logout(); nav('/') }} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-navy hover:border-rose-300 hover:text-rose-600">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
        {tabs && <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{tabs}</div>}
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  )
}

/* ---------------- Status pill ---------------- */
const TONE: Record<Status, string> = {
  Confirmed: 'bg-slate-100 text-slate-700',
  'Checked in': 'bg-sky-100 text-sky-800',
  'Documents verified': 'bg-indigo-100 text-indigo-800',
  'Info requested': 'bg-amber-100 text-amber-800',
  Accepted: 'bg-emerald-100 text-emerald-800',
  Declined: 'bg-rose-100 text-rose-800',
  Cancelled: 'bg-slate-100 text-slate-400 line-through',
}
export function StatusPill({ s }: { s: Status }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${TONE[s]}`}>{s}</span>
}

/* ---------------- Applicant panel (staff + admin) ---------------- */
const mask = (v: string, keep = 4) => (v.length <= keep ? v : '•'.repeat(v.length - keep) + v.slice(-keep))

export function ApplicantPanel({ appt, session, onChange }: { appt: Appointment; session: Session; onChange?: (a: Appointment) => void }) {
  const docs = SERVICES.find((s) => s.id === appt.service)?.docs ?? []
  const [checked, setChecked] = useState<boolean[]>(() => docs.map(() => appt.status === 'Documents verified' || appt.status === 'Accepted'))
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const isAdmin = session.role === 'admin'
  const final = appt.status === 'Accepted' || appt.status === 'Declined' || appt.status === 'Cancelled'
  const allDocs = checked.every(Boolean)

  const act = (status: Status, needNote = false) => {
    setErr('')
    if (needNote && !note.trim()) return setErr('Add a note explaining what is needed or why.')
    const updated = setStatus(appt.id, status, session, note.trim() || undefined)
    addLog({ by: session.username, name: session.name, role: session.role, action: status === 'Accepted' ? 'Accepted file' : status === 'Declined' ? 'Declined file' : `Marked: ${status}`, target: appt.id, note: note.trim() || undefined })
    setNote('')
    if (updated) onChange?.(updated)
  }

  const Btn = ({ onClick, disabled, tone, icon: Icon, children }: { onClick: () => void; disabled?: boolean; tone: string; icon: typeof CheckCircle2; children: ReactNode }) => (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}>
      <Icon className="h-4 w-4" /> {children}
    </button>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Applicant</p>
            <p className="text-xl font-extrabold text-navy">{appt.name}</p>
            <p className="font-mono text-sm text-slate-500">{appt.id} · {appt.queueNo}</p>
          </div>
          <StatusPill s={appt.status} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <Field k="Service" v={serviceName(appt.service)} />
          <Field k="Slot" v={`${appt.date} · ${appt.slot}`} />
          <Field k="Location" v={stationById(appt.stationId)?.area ?? '-'} />
          <Field k="Application ref." v={mask(appt.reference)} mono />
          <Field k="Mobile" v={mask(appt.mobile)} mono />
          <Field k="PIN code" v={appt.pin} mono />
        </dl>
        {appt.acceptedBy && appt.acceptedAt && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <BadgeCheck className="h-4 w-4" /> Accepted by {appt.acceptedBy} on {fmtTime(appt.acceptedAt)}
          </p>
        )}
      </div>

      {!final && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-2 font-extrabold text-navy"><ClipboardCheck className="h-5 w-5 text-royal" /> Physical document check</p>
          <ul className="mt-3 space-y-2">
            {docs.map((d, i) => (
              <li key={d}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-sm hover:bg-canvas">
                  <input type="checkbox" checked={checked[i]} onChange={() => setChecked(checked.map((c, j) => (j === i ? !c : c)))} className="h-4 w-4 accent-[#1D4ED8]" />
                  {d}
                </label>
              </li>
            ))}
          </ul>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-navy">Note (required when requesting info or declining)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-royal focus:ring-4 focus:ring-royal/10" />
          </label>
          {err && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{err}</p>}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Btn onClick={() => act('Checked in')} disabled={appt.status !== 'Confirmed' && appt.status !== 'Info requested'} tone="border border-slate-200 bg-white text-navy hover:border-royal" icon={UserCheck}>Mark arrived</Btn>
            <Btn onClick={() => act('Documents verified')} disabled={!allDocs || appt.status === 'Documents verified'} tone="border border-slate-200 bg-white text-navy hover:border-royal" icon={ClipboardCheck}>Documents checked</Btn>
            <Btn onClick={() => act('Info requested', true)} tone="border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100" icon={FileQuestion}>Request more info</Btn>
            <Btn onClick={() => act('Accepted')} disabled={isAdmin ? false : appt.status !== 'Documents verified'} tone="bg-emerald-600 text-white hover:bg-emerald-700" icon={CheckCircle2}>Accept file</Btn>
            {isAdmin && <Btn onClick={() => act('Declined', true)} tone="border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 sm:col-span-2" icon={XCircle}>Decline (admin)</Btn>}
          </div>
          {!isAdmin && appt.status !== 'Documents verified' && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><AlertTriangle className="h-3.5 w-3.5" /> Tick every document and mark “Documents checked” before accepting.</p>
          )}
        </div>
      )}
      {final && isAdmin && appt.status !== 'Cancelled' && (
        <Btn onClick={() => act('Checked in')} tone="w-full border border-slate-200 bg-white text-navy hover:border-royal" icon={RotateCcw}>Reopen file</Btn>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-extrabold text-navy">History</p>
        <ol className="mt-3 space-y-3">
          {[...(appt.history ?? [])].reverse().map((h, i) => (
            <li key={i} className="flex gap-3 text-sm">
              {i === 0 ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
              <div>
                <p className="font-bold text-navy">{h.action}</p>
                <p className="text-xs text-slate-500">{fmtTime(h.at)} · {h.by === 'citizen' ? 'Citizen' : `${h.name} (@${h.by})`}</p>
                {h.note && <p className="mt-1 rounded-lg bg-canvas px-2 py-1 text-xs text-ink">{h.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  )
}

function Field({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
      <dd className={`truncate font-semibold text-navy ${mono ? 'font-mono text-[13px]' : ''}`}>{v}</dd>
    </div>
  )
}
