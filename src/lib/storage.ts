/** Small localStorage helpers that never throw (private mode, blocked storage, quota). */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('pf-store', { detail: key }))
    return true
  } catch {
    return false
  }
}
