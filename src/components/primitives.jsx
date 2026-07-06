import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext.jsx'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'

/* Reveal — adds .is-in when the element scrolls into view (CSS does the rest).
   variant: 'up' (default) | 'clip' | 'blur' | 'left' | 'right' | 'scale'
   delay:   ms before the entrance starts (use i * 90 for cascades) */
export function Reveal({ children, className = '', style, as: Tag = 'div', variant = 'up', delay = 0, ...rest }) {
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
  const variantClass = variant === 'up' ? '' : `reveal--${variant}`
  return (
    <Tag
      ref={ref}
      className={`reveal ${variantClass} ${className}`}
      style={{ ...style, '--rv-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* SplitWords — splits a string into words that rise out of a clip mask,
   one after the other, when scrolled into view. Survives the EN/BN toggle
   because "seen" state lives in React, not on the DOM node. */
export function SplitWords({ text, as: Tag = 'span', className = '', stagger = 55, delay = 0, ...rest }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView])

  const words = String(text).split(' ')
  return (
    <Tag ref={ref} className={`split ${inView ? 'is-in' : ''} ${className}`} {...rest}>
      {words.map((w, i) => (
        <span className="split__mask" key={`${w}-${i}`}>
          <span className="split__word" style={{ transitionDelay: `${delay + i * stagger}ms` }}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}

/* SplitChars — mount-animated character cascade (for the hero title).
   Uses grapheme segmentation so Bangla conjuncts stay intact. */
export function segmentGraphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(seg.segment(text), (s) => s.segment)
  }
  return Array.from(text)
}

export function SplitChars({ text, delay = 0, stagger = 45, className = '' }) {
  const chars = useMemo(() => segmentGraphemes(String(text)), [text])
  return (
    <span className={`chars ${className}`} role="text" aria-label={text}>
      {chars.map((c, i) => (
        <span className="chars__mask" key={i} aria-hidden="true">
          <span className="chars__c" style={{ animationDelay: `${delay + i * stagger}ms` }}>
            {c === ' ' ? ' ' : c}
          </span>
        </span>
      ))}
    </span>
  )
}

/* Magnetic — the child subtly follows the cursor and springs back on leave. */
export function Magnetic({ children, strength = 0.32, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.5 })

  const onMove = useCallback(
    (e) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      x.set((e.clientX - (r.left + r.width / 2)) * strength)
      y.set((e.clientY - (r.top + r.height / 2)) * strength)
    },
    [strength, x, y],
  )
  const onLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  if (reduced) return <span className={className}>{children}</span>
  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.span>
  )
}

/* useCardFx — mousemove handlers that drive the .fx-card tilt and the
   .spot spotlight glow via CSS custom properties. Spread onto the card. */
export function useCardFx(maxTilt = 5) {
  const onMouseMove = useCallback(
    (e) => {
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
      el.style.setProperty('--rx', `${(py - 0.5) * -2 * maxTilt}deg`)
      el.style.setProperty('--ry', `${(px - 0.5) * 2 * maxTilt}deg`)
    },
    [maxTilt],
  )
  const onMouseLeave = useCallback((e) => {
    const el = e.currentTarget
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])
  return { onMouseMove, onMouseLeave }
}

/* CountUp — animates a number from 0 → `to` the first time it becomes visible. */
export function CountUp({ to, decimals = 0, suffix = '', prefix = '', duration = 1500 }) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  const [done, setDone] = useState(false)
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
              else setDone(true)
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
    <span ref={ref} className={`countup ${done ? 'is-done' : ''}`}>
      {prefix}
      {val.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

/* Ticker — a number that rolls smoothly to each new value (configurator total). */
export function Ticker({ value, format = (n) => n, duration = 550 }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const from = prev.current
    const to = value
    prev.current = value
    if (from === to) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <span className="ticker">{format(Math.round(display))}</span>
}

/* Embers — slow-drifting kiln sparks for dark sections. Purely decorative. */
export function Embers({ count = 14 }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 3.5,
        dur: 9 + Math.random() * 11,
        delay: -Math.random() * 20,
        drift: (Math.random() - 0.5) * 140,
        o: 0.2 + Math.random() * 0.45,
      })),
    [count],
  )
  return (
    <div className="embers" aria-hidden="true">
      {embers.map((e, i) => (
        <span
          key={i}
          className="embers__p"
          style={{
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            '--dur': `${e.dur}s`,
            '--delay': `${e.delay}s`,
            '--drift': `${e.drift}px`,
            '--o': e.o,
          }}
        />
      ))}
    </div>
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

/* MasonryDivider — running-bond brick motif; each brick "lays" itself
   left-to-right, row by row, when the divider scrolls into view. */
export function MasonryDivider({ rows = 3, perRow = 26 }) {
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
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className="masonry" ref={ref} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="masonry__row" key={r}>
          {Array.from({ length: perRow }).map((_, c) => (
            <span className="masonry__brick" key={c} style={{ '--d': `${r * 140 + c * 22}ms` }} />
          ))}
        </div>
      ))}
    </div>
  )
}
