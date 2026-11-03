import { useState } from 'react'
import { ScanLine, SearchX } from 'lucide-react'
import QrScanner from '../../components/QrScanner'
import { allAppointments, findByToken, type Appointment } from '../../lib/store'
import { addLog } from '../../lib/audit'
import { ApplicantPanel, PortalShell, RequireRole, StatusPill, useStoreTick } from './shared'

export default function StaffDesk() {
  return <RequireRole role="staff">{(s) => <Desk session={s} />}</RequireRole>
}

function Desk({ session }: { session: Parameters<typeof ApplicantPanel>[0]['session'] }) {
  useStoreTick()
  const [current, setCurrent] = useState<Appointment | null>(null)
  const [miss, setMiss] = useState('')
  const queue = allAppointments().filter((a) => a.status !== 'Cancelled' && a.status !== 'Accepted' && a.status !== 'Declined')

  const onScan = (text: string) => {
    const a = findByToken(text)
    if (!a) { setCurrent(null); setMiss(text); return }
    setMiss('')
    setCurrent(a)
    addLog({ by: session.username, name: session.name, role: session.role, action: 'Opened file (scan)', target: a.id })
  }
  const live = current ? allAppointments().find((a) => a.id === current.id) ?? current : null

  return (
    <PortalShell session={session} title="Verification desk">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-extrabold text-navy"><ScanLine className="h-5 w-5 text-royal" /> Scan pass</h2>
            <QrScanner onResult={onScan} />
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="font-extrabold text-navy">Waiting queue <span className="text-slate-400">({queue.length})</span></h2>
            {queue.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No open files. New bookings appear here.</p>
            ) : (
              <ul className="mt-3 max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                {queue.map((a) => (
                  <li key={a.id}>
                    <button onClick={() => onScan(a.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-3 text-left text-sm hover:bg-canvas ${live?.id === a.id ? 'bg-canvas' : ''}`}>
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-navy">{a.name}</span>
                        <span className="block text-xs text-slate-500">{a.date} · {a.slot} · {a.queueNo}</span>
                      </span>
                      <StatusPill s={a.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section>
          {live ? (
            <ApplicantPanel key={live.id + live.status} appt={live} session={session} onChange={setCurrent} />
          ) : (
            <div className="grid min-h-[320px] place-items-center rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
              {miss ? (
                <div>
                  <SearchX className="mx-auto h-10 w-10 text-rose-500" />
                  <p className="mt-3 font-bold text-navy">No appointment matches this code</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-500">{miss}</p>
                </div>
              ) : (
                <div>
                  <ScanLine className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-bold text-navy">Scan a pass or pick from the queue</p>
                  <p className="mt-1 text-sm text-slate-500">The applicant’s details and document checklist will open here.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  )
}
