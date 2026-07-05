import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Manifesto.css'

gsap.registerPlugin(ScrollTrigger)

export default function Manifesto() {
  const sectionRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const { lang, t } = useLanguage()

  const linesData = [
    [t('manifesto_line1_1'), t('manifesto_line1_2')],
    [t('manifesto_line2_1'), t('manifesto_line2_2')],
    [t('manifesto_line3_1')],
    [t('manifesto_line4_1'), t('manifesto_line4_2')],
  ]

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
  }, [reduced, lang])

  return (
    <section className="manifesto" id="manifesto" ref={sectionRef}>
      <div className="manifesto__inner wrap">
        <span className="eyebrow">{t('manifesto_eyebrow')}</span>
        <div className="manifesto__lines">
          {linesData.map((line, i) => (
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
