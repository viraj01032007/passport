import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer, ShieldCheck } from 'lucide-react'
import { SERVICES, serviceName, stationById, type Appointment } from '../lib/store'

/** Mobile-friendly digital pass that also prints cleanly on A4 (see @media print in index.css). */
export default function PassCard({ appt, actions = true }: { appt: Appointment; actions?: boolean }) {
  const station = stationById(appt.stationId)
  const docs = SERVICES.find((s) => s.id === appt.service)?.docs ?? []
  const [h, m] = appt.slot.split(':').map(Number)
  const reportAt = new Date(0, 0, 0, h, m - 15)
  const reporting = `${String(reportAt.getHours()).padStart(2, '0')}:${String(reportAt.getMinutes()).padStart(2, '0')}`
  const dateLabel = new Date(appt.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="mx-auto max-w-3xl">
      <article id="pass" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lift">
        <header className="flex items-center justify-between gap-4 bg-navy px-5 py-4 text-white sm:px-8">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-cyan" />
            <div>
              <p className="font-extrabold">PoliceFlow Verification Pass</p>
              <p className="text-[11px] text-slate-300">Prototype – not an official police document</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${appt.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald/20 text-emerald-200'}`}>
            {appt.status}
          </span>
        </header>

        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:p-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <Item k="Applicant" v={appt.name} wide />
            <Item k="Appointment ID" v={appt.id} mono />
            <Item k="Queue token" v={appt.queueNo} mono />
            <Item k="Application ref." v={maskRef(appt.reference)} mono />
            <Item k="Service" v={serviceName(appt.service)} />
            <Item k="Station" v={station?.name ?? '-'} wide />
            <Item k="Date" v={dateLabel} wide />
            <Item k="Slot" v={appt.slot} />
            <Item k="Report by" v={reporting} />
          </dl>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-4">
            <QRCodeSVG value={`PF1:${appt.token}`} size={148} level="M" fgColor="#102A43" />
            <p className="mt-2 text-center text-[10px] font-semibold text-slate-500">Random appointment token<br />No personal data stored</p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-5 sm:px-8">
          <h3 className="text-sm font-extrabold">Bring these originals</h3>
          <ul className="mt-2 grid gap-1.5 text-sm text-navy-600 sm:grid-cols-2">
            {docs.map((d) => <li key={d} className="flex gap-2"><span className="text-royal">✓</span>{d}</li>)}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Arrive by the reporting time. To reschedule, cancel this appointment on the Track page and book a new slot. Demo pass for
            illustration only; it does not replace any official document.
          </p>
        </div>
      </article>

      {actions && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
          <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-6 py-3.5 font-bold text-white hover:bg-royal">
            <Download className="h-4 w-4" /> Download PDF
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-navy">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      )}
      {actions && <p className="mt-3 text-center text-xs text-slate-500 print:hidden">“Download PDF” opens the print dialog. Choose “Save as PDF”.</p>}
    </div>
  )
}

function maskRef(ref: string) {
  return ref.length <= 4 ? ref : `${'•'.repeat(Math.min(6, ref.length - 4))}${ref.slice(-4)}`
}

function Item({ k, v, wide, mono }: { k: string; v: string; wide?: boolean; mono?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
      <dd className={`mt-0.5 font-bold text-navy ${mono ? 'font-mono text-[13px]' : ''}`}>{v}</dd>
    </div>
  )
}
