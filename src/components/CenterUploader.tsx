import { useState, type DragEvent } from 'react'
import { CheckCircle2, ImagePlus, Link2, Loader2, Trash2, UploadCloud, XCircle } from 'lucide-react'
import { useContent, type CenterMedia } from '../lib/content'
import { clearCenter, saveCenterFile, setCenterLink, updateCenterDisplay } from '../lib/centerMedia'
import type { Session } from '../lib/auth'

type Msg = { ok: boolean; text: string } | null

/** Upload / replace / remove the homepage centre photo or video. Used in the admin panel and on the homepage. */
export default function CenterUploader({ session, compact = false, onDone }: { session: Session; compact?: boolean; onDone?: () => void }) {
  const { center } = useContent()
  const [fit, setFit] = useState<CenterMedia['fit']>(center?.fit ?? 'cover')
  const [caption, setCaption] = useState(center?.caption ?? '')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)
  const [over, setOver] = useState(false)

  const run = async (fn: () => Promise<unknown> | void, ok: string) => {
    setMsg(null)
    setBusy(true)
    try {
      await fn()
      setMsg({ ok: true, text: ok })
      onDone?.()
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message || 'Something went wrong. Try again.' })
    } finally {
      setBusy(false)
    }
  }
  const pick = (f?: File | null) => f && run(() => saveCenterFile(session, f, { fit, caption }), 'Saved. It now shows in the centre of the homepage.')
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]) }

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-center transition ${compact ? 'py-5' : 'py-8'} ${over ? 'border-royal bg-royal/5' : 'border-slate-300 bg-white hover:border-royal hover:bg-royal/5'} ${busy ? 'pointer-events-none opacity-60' : ''}`}
      >
        {busy ? <Loader2 className="h-7 w-7 animate-spin text-royal" /> : <UploadCloud className="h-7 w-7 text-royal" />}
        <span className="text-sm font-bold text-navy">{busy ? 'Saving…' : center ? 'Replace photo or video' : 'Upload photo or video'}</span>
        <span className="text-xs text-slate-500">Tap to choose, or drag a file here · Photo up to 25 MB · Video up to 80 MB</span>
        <input type="file" accept="image/*,video/*,.heic,.heif,.mov" className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; pick(f) }} />
      </label>

      {msg && (
        <p role="status" className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>
          {msg.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />} {msg.text}
        </p>
      )}

      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Image or video link</span>
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste an image / .mp4 link" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-royal" />
        </label>
        <button disabled={!link.trim() || busy} onClick={() => run(async () => { await setCenterLink(session, link, { fit, caption }); setLink('') }, 'Link saved.')} className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-navy hover:border-royal disabled:opacity-40">Use</button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-bold text-navy">Display
          <select value={fit} onChange={(e) => { const v = e.target.value as CenterMedia['fit']; setFit(v); if (center) run(() => updateCenterDisplay(session, { fit: v, caption }), 'Display updated.') }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm font-semibold">
            <option value="cover">Fill the frame</option>
            <option value="contain">Show whole</option>
          </select>
        </label>
        <label className="block text-xs font-bold text-navy">Caption (optional)
          <input value={caption} onChange={(e) => setCaption(e.target.value)} onBlur={() => center && caption !== (center.caption ?? '') && run(() => updateCenterDisplay(session, { fit, caption }), 'Caption updated.')} maxLength={120} className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm font-normal" />
        </label>
      </div>

      {center && (
        <button disabled={busy} onClick={() => run(() => clearCenter(session), 'Removed. The centre is empty again.')} className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" /> Remove from homepage
        </button>
      )}
      {!compact && <p className="flex items-center gap-1.5 text-xs text-slate-500"><ImagePlus className="h-3.5 w-3.5" /> Videos play muted and loop. Use only photos and videos you have the rights to.</p>}
    </div>
  )
}
