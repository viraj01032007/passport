import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { CalendarCheck2, FileCheck2, ImagePlus, Users } from 'lucide-react'
import DemoBadge from './DemoBadge'

/** Drop a licensed photograph at /public/images/officer.jpg – see public/images/README.txt */
const PHOTO_SRC = '/images/officer.jpg'

export default function OfficerVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [finePointer, setFinePointer] = useState(false)
  const [photoOk, setPhotoOk] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setFinePointer(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const parallax = finePointer && !reduce
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 20 })
  const sy = useSpring(my, { stiffness: 80, damping: 20 })
  const imgX = useTransform(sx, (v) => v * -14)
  const imgY = useTransform(sy, (v) => v * -10)
  const cardX = useTransform(sx, (v) => v * 18)
  const cardY = useTransform(sy, (v) => v * 14)

  const onMove = (e: PointerEvent) => {
    if (!parallax || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={reduce ? false : { opacity: 0, scale: 0.97, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative mx-auto w-full max-w-[560px] md:max-w-none"
    >
      {/* decorative ring */}
      <div aria-hidden className="absolute -inset-3 rounded-[2.25rem] bg-gradient-to-br from-cyan/30 via-royal/10 to-transparent blur-2xl sm:-inset-5" />

      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/70 bg-navy shadow-lift sm:rounded-[2rem] md:aspect-auto md:h-[min(78vh,720px)] md:min-h-[460px]">
        {photoOk ? (
          <motion.img
            src={PHOTO_SRC}
            onError={() => setPhotoOk(false)}
            alt="Police officer at the reception desk of a modern police station"
            className="absolute inset-0 h-[108%] w-[108%] max-w-none -translate-x-[4%] -translate-y-[4%] object-cover object-[60%_center]"
            style={parallax ? { x: imgX, y: imgY } : undefined}
            loading="eager"
          />
        ) : (
          <PhotoPlaceholder />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/5 to-transparent" />

        {/* top chip */}
        <div className="glass absolute right-3 top-3 flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold text-navy shadow-card sm:right-5 sm:top-5 sm:text-xs">
          <CalendarCheck2 className="h-3.5 w-3.5 text-royal" />
          Slot 10:15 – 10:30
        </div>
      </div>

      {/* floating glass status card */}
      <motion.div
        style={parallax ? { x: cardX, y: cardY } : undefined}
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="glass absolute -bottom-6 left-3 right-3 rounded-2xl p-4 shadow-lift sm:-bottom-8 sm:right-auto sm:-left-6 sm:w-72 sm:p-5 md:-left-10"
        aria-label="Example verification status (demonstration data)"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-royal">Smart Verification</p>
          <DemoBadge />
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="pulse-dot" />
          <p className="text-sm font-bold text-navy">Appointment Confirmed</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2.5">
          <div className="rounded-xl bg-white/70 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <FileCheck2 className="h-3.5 w-3.5" /> Document Readiness
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-royal to-cyan"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: '92%' }}
                  transition={{ duration: 1.4, delay: 1.1, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs font-extrabold text-navy">92%</span>
            </div>
          </div>
          <div className="rounded-xl bg-white/70 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Users className="h-3.5 w-3.5" /> Queue Status
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald" /> Low
            </p>
          </div>
        </div>
        <p className="mt-2.5 text-[10px] leading-snug text-slate-500">Illustrative example only — not live police operational data.</p>
      </motion.div>
    </motion.div>
  )
}

function PhotoPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_70%_20%,#1E3A5F,#102A43_55%,#0B1E31)] p-8 text-center">
      <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
      <ImagePlus className="relative h-10 w-10 text-cyan/80" strokeWidth={1.5} />
      <p className="relative mt-3 text-sm font-bold text-white">Officer photograph</p>
      <p className="relative mt-1 max-w-[16rem] text-xs leading-relaxed text-slate-300">
        Add a licensed photo at <code className="rounded bg-white/10 px-1">public/images/officer.jpg</code>
      </p>
    </div>
  )
}
