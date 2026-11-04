import { useEffect, useState } from 'react'

/**
 * Stores large uploads (photos and videos) in IndexedDB, which allows far more space than
 * localStorage. Demo only: in production upload to the backend or object storage instead.
 */
const DB = 'policeflow-media'
const STORE = 'files'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function putMedia(key: string, blob: Blob) {
  const db = await open()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Could not save the file. Storage may be full.'))
  })
}

export async function getMedia(key: string): Promise<Blob | null> {
  try {
    const db = await open()
    return await new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key)
      req.onsuccess = () => resolve((req.result as Blob) ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function deleteMedia(key: string) {
  try {
    const db = await open()
    db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key)
  } catch { /* ignore */ }
}

/** Returns an object URL for a stored file, or the value itself when it is already a URL. */
export function useMediaUrl(src: string | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!src) { setUrl(null); return }
    if (!src.startsWith('idb:')) { setUrl(src); return }
    let made: string | null = null
    let alive = true
    getMedia(src.slice(4)).then((b) => {
      if (!alive || !b) return
      made = URL.createObjectURL(b)
      setUrl(made)
    })
    return () => { alive = false; if (made) URL.revokeObjectURL(made) }
  }, [src])
  return url
}
