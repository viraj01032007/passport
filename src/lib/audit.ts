import { load, save } from './storage'

export type LogEntry = {
  id: string
  at: number
  by: string // username
  name: string // display name
  role: 'admin' | 'staff' | 'system'
  action: string
  target?: string // appointment id, username, content item…
  note?: string
}

const KEY = 'policeflow.audit.v1'

export function readLog(): LogEntry[] {
  return load<LogEntry[]>(KEY, []).sort((a, b) => b.at - a.at)
}

export function addLog(e: Omit<LogEntry, 'id' | 'at'>) {
  const list = load<LogEntry[]>(KEY, [])
  list.push({ ...e, id: crypto.randomUUID(), at: Date.now() })
  save(KEY, list.slice(-2000))
}
