import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

/* Reveal — adds .is-in when the element scrolls into view (CSS does the rest). */
export function Reveal({ children, className = '', style, as: Tag = 'div' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-in')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.18 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  )
}

/* CountUp — animates a number from 0 → `to` the first time it becomes visible. */
export function CountUp({ to, decimals = 0, suffix = '', prefix = '', duration = 1500 }) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  const started = useRef(false)
  const { lang } = useLanguage()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now) => {
              const p = Math.min(1, (now - start) / duration)
              const eased = 1 - Math.pow(1 - p, 3)
              setVal(to * eased)
              if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

/* Stamp — the embossed maker's mark pressed into every brick. */
export function Stamp({ className = '' }) {
  return (
    <div className={`stamp ${className}`} aria-hidden="true">
      <div className="stamp__inner">
        <span className="stamp__m">M</span>
        <span className="stamp__t">EST · MMXXVI</span>
      </div>
    </div>
  )
}

/* MasonryDivider — running-bond brick motif used between sections. */
export function MasonryDivider({ rows = 3, perRow = 26 }) {
  return (
    <div className="masonry" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="masonry__row" key={r}>
          {Array.from({ length: perRow }).map((_, c) => (
            <span className="masonry__brick" key={c} />
          ))}
        </div>
      ))}
    </div>
  )
}
