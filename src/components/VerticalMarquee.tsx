import type { CSSProperties, ReactNode } from 'react'

type Props = {
  /** Render the items. `hidden` is true for the duplicate copy, so links can be removed from tab order. */
  render: (hidden: boolean) => ReactNode[]
  /** seconds per full loop – higher is slower */
  duration?: number
  gap?: string
  className?: string
  label?: string
}

/**
 * Seamless bottom-to-top marquee. Two identical columns are stacked; each moves up by exactly
 * its own height (gap included as bottom padding), so the second copy lands where the first
 * started and the loop never shows a jump or an empty gap. Pauses on hover and keyboard focus.
 */
export default function VerticalMarquee({ render, duration = 30, gap = '1rem', className = '', label }: Props) {
  const style = { '--vduration': `${duration}s`, '--vgap': gap } as CSSProperties
  const column = (hidden: boolean) => (
    <ul className="vmarquee__track" aria-hidden={hidden || undefined}>
      {render(hidden).map((node, i) => (
        <li key={i}>{node}</li>
      ))}
    </ul>
  )
  return (
    <div className={`vmarquee ${className}`} style={style} role="region" aria-label={label}>
      {column(false)}
      {column(true)}
    </div>
  )
}
