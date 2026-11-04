import { deleteMedia, putMedia } from './media'
import { getContent, updateContent, type CenterMedia } from './content'
import type { Session } from './auth'

const MAX_VIDEO = 80 * 1024 * 1024
const MAX_IMAGE = 25 * 1024 * 1024

/** Re-encode any photo the browser can decode (JPG, PNG, WebP, HEIC on Safari…) to a JPEG blob. */
function toJpeg(file: File, maxW = 2000, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process this photo.'))), 'image/jpeg', quality)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This browser cannot open that photo format (often iPhone HEIC). Save it as JPG or PNG and try again.'))
    }
    img.src = url
  })
}

function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(b)
  })
}

function kindOf(f: File): CenterMedia['kind'] | null {
  if (f.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(f.name)) return 'video'
  if (f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name)) return 'image'
  return null
}

async function dropOld(nextSrc?: string) {
  const old = getContent().center?.src
  if (old?.startsWith('idb:') && old !== nextSrc) await deleteMedia(old.slice(4))
}

/** Save an uploaded photo or video as the homepage centre media. Throws with a readable message. */
export async function saveCenterFile(session: Session, file: File, opts: { fit: CenterMedia['fit']; caption?: string }) {
  const kind = kindOf(file)
  if (!kind) throw new Error('Choose a photo (JPG, PNG, WebP, HEIC) or a video (MP4, WebM, MOV).')
  if (kind === 'video' && file.size > MAX_VIDEO) throw new Error('Video is larger than 80 MB. Compress it, or paste a link to the video instead.')
  if (kind === 'image' && file.size > MAX_IMAGE) throw new Error('Photo is larger than 25 MB.')

  const blob = kind === 'image' ? await toJpeg(file) : file
  const key = `center-${Date.now()}`
  let src: string
  try {
    await putMedia(key, blob)
    src = `idb:${key}`
  } catch {
    // IndexedDB blocked (private mode, some in-app browsers): fall back to an inline copy if small enough.
    if (blob.size > 3 * 1024 * 1024) throw new Error('This browser blocked saving large files. Try a normal (non-private) window, or a smaller file.')
    src = await blobToDataUrl(blob)
  }
  await dropOld(src)
  const next: CenterMedia = { kind, src, fit: opts.fit, caption: opts.caption?.trim() || undefined }
  updateContent(session, { center: next }, kind === 'video' ? 'Uploaded centre video' : 'Uploaded centre photo', 'Homepage centre')
  return next
}

export async function setCenterLink(session: Session, url: string, opts: { fit: CenterMedia['fit']; caption?: string }) {
  const u = url.trim()
  if (!/^https?:\/\//.test(u)) throw new Error('Paste a full link starting with https://')
  const kind: CenterMedia['kind'] = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u) ? 'video' : 'image'
  await dropOld(u)
  updateContent(session, { center: { kind, src: u, fit: opts.fit, caption: opts.caption?.trim() || undefined } }, kind === 'video' ? 'Set centre video link' : 'Set centre photo link', 'Homepage centre')
}

export function updateCenterDisplay(session: Session, patch: Partial<Pick<CenterMedia, 'fit' | 'caption'>>) {
  const c = getContent().center
  if (!c) return
  updateContent(session, { center: { ...c, ...patch, caption: patch.caption?.trim() || undefined } }, 'Updated centre display', 'Homepage centre')
}

export async function clearCenter(session: Session) {
  await dropOld()
  updateContent(session, { center: null }, 'Removed centre media', 'Homepage centre')
}
