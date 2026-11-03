import { useEffect, useRef, useState, type FormEvent } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff, ImageUp, Keyboard, Loader2 } from 'lucide-react'

/**
 * Reads a PoliceFlow pass QR three ways: live camera, a photo of the pass, or typed code/ID.
 * The camera needs HTTPS (or localhost) and the browser's permission.
 */
export default function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const raf = useRef<number>()
  const [on, setOn] = useState(false)
  const [starting, setStarting] = useState(false)
  const [err, setErr] = useState('')
  const [manual, setManual] = useState('')

  const stop = () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    setOn(false)
  }
  useEffect(() => stop, [])

  const decode = (src: CanvasImageSource, w: number, h: number) => {
    const c = canvas.current
    if (!c || !w || !h) return null
    c.width = w
    c.height = h
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(src, 0, 0, w, h)
    const img = ctx.getImageData(0, 0, w, h)
    return jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' })?.data ?? null
  }

  const start = async () => {
    setErr('')
    setStarting(true)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      stream.current = s
      const v = video.current!
      v.srcObject = s
      await v.play()
      setOn(true)
      const tick = () => {
        if (v.readyState >= 2) {
          const text = decode(v, v.videoWidth, v.videoHeight)
          if (text) { stop(); onResult(text); return }
        }
        raf.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      setErr('Camera unavailable. Allow camera access, use HTTPS, or upload a photo of the pass instead.')
      stop()
    } finally {
      setStarting(false)
    }
  }

  const fromFile = (f: File | undefined) => {
    if (!f) return
    setErr('')
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height))
      const text = decode(img, Math.round(img.width * scale), Math.round(img.height * scale))
      URL.revokeObjectURL(url)
      if (text) onResult(text)
      else setErr('No QR code found in that photo. Try a clearer, closer shot.')
    }
    img.src = url
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (manual.trim()) onResult(manual.trim())
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-navy-900 sm:aspect-video">
        <video ref={video} muted playsInline className={`h-full w-full object-cover ${on ? '' : 'hidden'}`} />
        {on && (
          <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative h-56 w-56 rounded-3xl border-2 border-cyan/80 shadow-[0_0_0_9999px_rgba(11,31,51,.45)]">
              <div className="scanline absolute inset-x-3 h-0.5 rounded-full bg-cyan" />
            </div>
          </div>
        )}
        {!on && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-slate-300">
            <div>
              <Camera className="mx-auto h-10 w-10 text-cyan" strokeWidth={1.5} />
              <p className="mt-3 text-sm">Scan the QR code on the citizen’s pass</p>
            </div>
          </div>
        )}
        <canvas ref={canvas} className="hidden" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {on ? (
          <button onClick={stop} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-bold text-navy">
            <CameraOff className="h-4 w-4" /> Stop camera
          </button>
        ) : (
          <button onClick={start} disabled={starting} className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3 font-bold text-white hover:bg-royal disabled:opacity-60">
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Start camera
          </button>
        )}
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-bold text-navy hover:border-royal">
          <ImageUp className="h-4 w-4" /> Upload photo
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { fromFile(e.target.files?.[0]); e.target.value = '' }} />
        </label>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Appointment ID or QR code text</span>
          <Keyboard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Or type appointment ID (PF-…)" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-sm font-semibold outline-none focus:border-royal focus:ring-4 focus:ring-royal/10" />
        </label>
        <button className="rounded-xl bg-royal px-4 font-bold text-white">Find</button>
      </form>

      {err && <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{err}</p>}
    </div>
  )
}
