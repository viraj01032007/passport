import { useEffect, useState } from 'react'
import { load, save } from './storage'
import { addLog } from './audit'
import type { Session } from './auth'

/** Website content the head admin can edit from the admin panel. Stored in this browser for the demo. */
export type NewsItem = { id: string; cat: NewsCat; date: string; title: string; text: string; image?: string }
export type NewsCat = 'Cybercrime Alerts' | 'Citizen Information' | 'Police Initiatives' | 'Public Awareness' | 'Important Announcements'
export const NEWS_CATS: NewsCat[] = ['Cybercrime Alerts', 'Citizen Information', 'Police Initiatives', 'Public Awareness', 'Important Announcements']

export type SiteContent = {
  notice: string
  heroImages: (string | null)[] // data URLs; null = designed backdrop
  news: NewsItem[]
}

export const DEFAULT_CONTENT: SiteContent = {
  notice: '',
  heroImages: [null, null, null],
  news: [
    { id: 'n1', cat: 'Cybercrime Alerts', date: '2026-10-28', title: 'Fake “KYC update” messages are rising', text: 'Banks never ask for OTPs or PINs. If you lose money, call 1930 within the first hour.' },
    { id: 'n2', cat: 'Citizen Information', date: '2026-10-21', title: 'What to bring for passport verification', text: 'Original identity and address proofs, your application reference and self-attested copies.' },
    { id: 'n3', cat: 'Police Initiatives', date: '2026-10-14', title: 'Slot-based verification proposal', text: 'PoliceFlow proposes 15-minute slots with a fixed capacity so citizens wait less at the counter.' },
    { id: 'n4', cat: 'Public Awareness', date: '2026-10-07', title: 'Tenant verification protects both sides', text: 'Registering tenant details helps landlords and tenants and keeps neighbourhoods safer.' },
    { id: 'n5', cat: 'Important Announcements', date: '2026-09-30', title: 'Report misuse of your documents', text: 'If you suspect your identity documents are being misused, report it through the official citizen portal.' },
  ],
}

const KEY = 'policeflow.content.v1'

export function getContent(): SiteContent {
  return { ...DEFAULT_CONTENT, ...load<Partial<SiteContent>>(KEY, {}) }
}

export function updateContent(actor: Session, patch: Partial<SiteContent>, action: string, target?: string) {
  const ok = save(KEY, { ...getContent(), ...patch })
  if (!ok) throw new Error('Could not save. The browser storage may be full; try a smaller photo.')
  addLog({ by: actor.username, name: actor.name, role: actor.role, action, target })
}

export function useContent() {
  const [c, setC] = useState(getContent)
  useEffect(() => {
    const on = (e: Event) => { if ((e as CustomEvent).detail === KEY) setC(getContent()) }
    window.addEventListener('pf-store', on)
    return () => window.removeEventListener('pf-store', on)
  }, [])
  return c
}

/** Resize and compress an uploaded photo so it fits comfortably in storage. */
export function imageToDataUrl(file: File, maxW = 1800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Use a JPG, PNG or WebP image.'))
    if (file.size > 15 * 1024 * 1024) return reject(new Error('Image is larger than 15 MB.'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')) }
    img.src = url
  })
}
