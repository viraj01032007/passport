import type { CSSProperties, ReactNode } from 'react'

type Props = {
  items: ReactNode[]
  direction?: 'left' | 'right'
  /** seconds for one full loop – lower is faster */
  duration?: number
  /** spacing between items, any CSS length */
  gap?: string
  /** repeat the list inside each track so short lists still fill wide screens */
  repeat?: number
  pauseOnHover?: boolean
  separator?: ReactNode
  className?: string
  itemClassName?: string
  label?: string
}

/**
 * Seamless CSS-only infinite marquee.
 * Two identical tracks sit side by side; each translates by exactly -100% of its own
 * width, so when the first finishes the second is in exactly the same spot – no jump.
 */
export default function Marquee({
  items,
  direction = 'left',
  duration = 40,
  gap = '2.5rem',
  repeat = 2,
  pauseOnHover = true,
  separator,
  className = '',
  itemClassName = '',
  label,
}: Props) {
  const list = Array.from({ length: repeat }, () => items).flat()
  const style = { '--duration': `${duration}s`, '--gap': gap } as CSSProperties

  const track = (hidden: boolean) => (
    <ul className="marquee__track" aria-hidden={hidden || undefined}>
      {list.map((item, i) => (
        <li key={i} className={`flex shrink-0 items-center gap-[var(--gap)] ${itemClassName}`}>
          <span>{item}</span>
          {separator && <span aria-hidden="true">{separator}</span>}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className={`marquee ${direction === 'right' ? 'marquee--right' : ''} ${pauseOnHover ? 'marquee--pause' : ''} ${className}`}
      style={style}
      role="marquee"
      aria-label={label}
    >
      {track(false)}
      {track(true)}
    </div>
  )
}
