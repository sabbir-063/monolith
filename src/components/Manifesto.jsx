import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'
import './Manifesto.css'

gsap.registerPlugin(ScrollTrigger)

const LINES = [
  ['Some objects', 'beg for your attention.'],
  ['They blink. They buzz.', 'They ask to be upgraded.'],
  ['The MONOLITH does none of this.'],
  ['It simply', 'endures.'],
]

export default function Manifesto() {
  const sectionRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray('.manifesto__line')
      gsap.set(lines, { opacity: 0.14 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=' + lines.length * 320,
          pin: true,
          scrub: 0.6,
        },
      })

      lines.forEach((line) => {
        tl.to(line, { opacity: 1, duration: 1, ease: 'none' })
          .to(line, { opacity: 0.14, duration: 1, ease: 'none' }, '+=0.4')
      })
      // keep the last line lit
      tl.to(lines[lines.length - 1], { opacity: 1, duration: 1 }, '>-0.4')
    }, sectionRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section className="manifesto" id="manifesto" ref={sectionRef}>
      <div className="manifesto__inner wrap">
        <span className="eyebrow">The Manifesto</span>
        <div className="manifesto__lines">
          {LINES.map((line, i) => (
            <p className="manifesto__line" key={i}>
              {line.map((part, j) => (
                <span key={j}>{part}</span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
