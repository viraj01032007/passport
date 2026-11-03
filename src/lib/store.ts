/**
 * Demo booking engine – runs entirely in the browser (localStorage).
 * Swap these functions for real API calls (e.g. POST /api/appointments) when the
 * Express/MongoDB backend is connected. All data here is synthetic.
 */

export type ServiceId = 'passport' | 'tenant' | 'character'

export const SERVICES: { id: ServiceId; name: string; desc: string; docs: string[] }[] = [
  {
    id: 'passport',
    name: 'Passport Police Verification',
    desc: 'Address & identity check linked to your passport application.',
    docs: ['Passport application reference (ARN / file number)', 'Proof of address', 'Photo identity document', 'Self-attested copies of the above'],
  },
  {
    id: 'tenant',
    name: 'Tenant Verification',
    desc: 'For landlords registering tenant details, where the station offers it.',
    docs: ['Rent / leave-and-licence agreement', 'Tenant photo identity', 'Owner identity & property proof', 'Recent photographs'],
  },
  {
    id: 'character',
    name: 'Character Verification',
    desc: 'Character / conduct verification for employment, where authorised.',
    docs: ['Request letter from employer (if any)', 'Photo identity document', 'Proof of address', 'Recent photographs'],
  },
]

export type Station = { id: string; name: string; area: string; services: ServiceId[] }

/** Single verification location. Address/services must be confirmed with the department before any real use. */
export const STATIONS: Station[] = [
  { id: 'nm-cp-office', name: 'Office of the Commissioner of Police, Navi Mumbai', area: 'CBD Belapur, Navi Mumbai', services: ['passport', 'tenant', 'character'] },
]

/** Admin-configurable in the full system. */
export const SLOT_CONFIG = { start: '09:00', end: '13:00', minutes: 15, capacity: 5 }

export type Appointment = {
  id: string
  token: string
  queueNo: string
  service: ServiceId
  stationId: string
  date: string // yyyy-mm-dd
  slot: string // "09:15"
  name: string
  mobile: string
  email: string
  reference: string
  pin: string
  status: 'Confirmed' | 'Cancelled' | 'Checked in' | 'Completed'
  createdAt: number
}

const KEY = 'policeflow.appointments.v1'

function read(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Appointment[]
  } catch {
    return []
  }
}
function write(list: Appointment[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable – demo continues in memory only */
  }
}

/** Synthetic background load so slots look realistically used. Deterministic per station/date/slot. */
function seededLoad(stationId: string, date: string, slot: string) {
  let h = 0
  for (const c of stationId + date + slot) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % (SLOT_CONFIG.capacity + 1) // 0..capacity
}

export function slotsFor(stationId: string, date: string) {
  const [sh, sm] = SLOT_CONFIG.start.split(':').map(Number)
  const [eh, em] = SLOT_CONFIG.end.split(':').map(Number)
  const out: { time: string; label: string; booked: number; capacity: number; full: boolean }[] = []
  const live = read().filter((a) => a.stationId === stationId && a.date === date && a.status !== 'Cancelled')
  for (let m = sh * 60 + sm; m < eh * 60 + em; m += SLOT_CONFIG.minutes) {
    const time = fmt(m)
    const booked = Math.min(SLOT_CONFIG.capacity, seededLoad(stationId, date, time) + live.filter((a) => a.slot === time).length)
    out.push({ time, label: `${time}–${fmt(m + SLOT_CONFIG.minutes)}`, booked, capacity: SLOT_CONFIG.capacity, full: booked >= SLOT_CONFIG.capacity })
  }
  return out
}

function fmt(mins: number) {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

function randomToken(len = 24) {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('')
}

export class BookingError extends Error {}

export function book(input: Omit<Appointment, 'id' | 'token' | 'queueNo' | 'status' | 'createdAt'>): Appointment {
  const list = read()
  const ref = input.reference.trim().toUpperCase()

  // Duplicate prevention: one active appointment per application reference + service.
  const dup = list.find((a) => a.status !== 'Cancelled' && a.service === input.service && a.reference.toUpperCase() === ref)
  if (dup) throw new BookingError(`An active appointment (${dup.id}) already exists for this application reference.`)

  // Capacity check at the moment of booking (the server repeats this atomically).
  const slot = slotsFor(input.stationId, input.date).find((s) => s.time === input.slot)
  if (!slot) throw new BookingError('That time slot does not exist.')
  if (slot.full) throw new BookingError('This slot just filled up. Please choose another time.')

  const appt: Appointment = {
    ...input,
    reference: ref,
    id: `PF-${input.date.replace(/-/g, '').slice(2)}-${randomToken(5)}`,
    token: randomToken(),
    queueNo: `Q${String(slot.booked + 1).padStart(2, '0')}-${input.slot.replace(':', '')}`,
    status: 'Confirmed',
    createdAt: Date.now(),
  }
  write([...list, appt])
  return appt
}

export function findAppointment(idOrRef: string) {
  const q = idOrRef.trim().toUpperCase()
  return read()
    .filter((a) => a.id.toUpperCase() === q || a.reference.toUpperCase() === q)
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

export function cancelAppointment(id: string) {
  write(read().map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a)))
}

export const serviceName = (id: ServiceId) => SERVICES.find((s) => s.id === id)?.name ?? id
export const stationById = (id: string) => STATIONS.find((s) => s.id === id)

export function nextWorkingDays(n = 7) {
  const days: string[] = []
  const d = new Date()
  while (days.length < n) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0)
      days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return days
}
