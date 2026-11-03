import { useEffect, useState } from 'react'
import { load, save } from './storage'
import { addLog } from './audit'

/**
 * DEMO authentication. Accounts and password hashes live in this browser only, which is fine for a
 * prototype but NOT secure. In production, move this to the Express API: bcrypt-hashed passwords
 * in MongoDB, JWT sessions in httpOnly cookies, rate-limited login, and server-side role checks.
 */
export type Role = 'admin' | 'staff'
export type User = { username: string; name: string; role: Role; hash: string; active: boolean; createdAt: number }
export type Session = { username: string; name: string; role: Role; at: number }

const USERS = 'policeflow.users.v1'
const SESSION = 'policeflow.session.v1'
const SESSION_MS = 8 * 60 * 60 * 1000 // 8 hours

export async function hashPassword(username: string, password: string) {
  const data = new TextEncoder().encode(`policeflow:${username.toLowerCase()}:${password}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Default demo accounts, created on first use. Change these passwords from the admin panel. */
export const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'Admin@123', name: 'Head Admin', role: 'admin' as Role },
  { username: 'staff1', password: 'Staff@123', name: 'Verification Desk 1', role: 'staff' as Role },
  { username: 'staff2', password: 'Staff@123', name: 'Verification Desk 2', role: 'staff' as Role },
]

async function ensureSeed() {
  const users = load<User[]>(USERS, [])
  if (users.length) return users
  const seeded: User[] = []
  for (const a of DEMO_ACCOUNTS) {
    seeded.push({ username: a.username, name: a.name, role: a.role, hash: await hashPassword(a.username, a.password), active: true, createdAt: Date.now() })
  }
  save(USERS, seeded)
  return seeded
}

export function listUsers(): User[] {
  return load<User[]>(USERS, [])
}

export async function login(username: string, password: string, role: Role): Promise<Session> {
  const users = await ensureSeed()
  const u = users.find((x) => x.username.toLowerCase() === username.trim().toLowerCase())
  const ok = u && u.active && u.role === role && u.hash === (await hashPassword(u.username, password))
  if (!ok) {
    addLog({ by: username || '(blank)', name: username || '(blank)', role: 'system', action: `Failed ${role} login` })
    throw new Error('Wrong username or password, or this account cannot use this login.')
  }
  const s: Session = { username: u.username, name: u.name, role: u.role, at: Date.now() }
  try { sessionStorage.setItem(SESSION, JSON.stringify(s)) } catch { /* ignore */ }
  addLog({ by: u.username, name: u.name, role: u.role, action: 'Signed in' })
  window.dispatchEvent(new CustomEvent('pf-store', { detail: SESSION }))
  return s
}

export function getSession(): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION) || 'null') as Session | null
    if (!s || Date.now() - s.at > SESSION_MS) return null
    return s
  } catch {
    return null
  }
}

export function logout() {
  const s = getSession()
  if (s) addLog({ by: s.username, name: s.name, role: s.role, action: 'Signed out' })
  try { sessionStorage.removeItem(SESSION) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('pf-store', { detail: SESSION }))
}

export function useSession() {
  const [s, setS] = useState(getSession)
  useEffect(() => {
    const on = () => setS(getSession())
    window.addEventListener('pf-store', on)
    return () => window.removeEventListener('pf-store', on)
  }, [])
  return s
}

/* ---------- account management (head admin) ---------- */
export async function addUser(actor: Session, input: { username: string; name: string; password: string; role: Role }) {
  const users = await ensureSeed()
  const username = input.username.trim().toLowerCase()
  if (!/^[a-z0-9._-]{3,20}$/.test(username)) throw new Error('Username: 3–20 letters, numbers, dot, dash or underscore.')
  if (users.some((u) => u.username === username)) throw new Error('That username already exists.')
  if (input.password.length < 8) throw new Error('Password must be at least 8 characters.')
  users.push({ username, name: input.name.trim() || username, role: input.role, hash: await hashPassword(username, input.password), active: true, createdAt: Date.now() })
  save(USERS, users)
  addLog({ by: actor.username, name: actor.name, role: actor.role, action: `Added ${input.role} account`, target: username })
}

export async function setPassword(actor: Session, username: string, password: string) {
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
  const users = await ensureSeed()
  const hash = await hashPassword(username, password)
  save(USERS, users.map((u) => (u.username === username ? { ...u, hash } : u)))
  addLog({ by: actor.username, name: actor.name, role: actor.role, action: 'Changed password', target: username })
}

export function setActive(actor: Session, username: string, active: boolean) {
  if (username === actor.username) throw new Error('You cannot disable your own account.')
  save(USERS, listUsers().map((u) => (u.username === username ? { ...u, active } : u)))
  addLog({ by: actor.username, name: actor.name, role: actor.role, action: active ? 'Enabled account' : 'Disabled account', target: username })
}

export function removeUser(actor: Session, username: string) {
  if (username === actor.username) throw new Error('You cannot remove your own account.')
  save(USERS, listUsers().filter((u) => u.username !== username))
  addLog({ by: actor.username, name: actor.name, role: actor.role, action: 'Removed account', target: username })
}

export { ensureSeed }
