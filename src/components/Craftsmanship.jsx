import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Reveal, MasonryDivider, SplitWords, useCardFx } from './primitives'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Craftsmanship.css'

gsap.registerPlugin(ScrollTrigger)

export default function Craftsmanship() {
  const { lang, t } = useLanguage()
  const sectionRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const fx = useCardFx(4)

  const stepsData = [
    {
      no: t('craft_step1_no'),
      title: t('craft_step1_title'),
      body: t('craft_step1_body'),
    },
    {
      no: t('craft_step2_no'),
      title: t('craft_step2_title'),
      body: t('craft_step2_body'),
    },
    {
      no: t('craft_step3_no'),
      title: t('craft_step3_title'),
      body: t('craft_step3_body'),
    },
    {
      no: t('craft_step4_no'),
      title: t('craft_step4_title'),
      body: t('craft_step4_body'),
    },
  ]

  // The kiln line — draws across the top of the steps as you scroll through them
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.craft__progress-bar',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.craft__steps',
            start: 'top 85%',
            end: 'bottom 40%',
            scrub: 0.4,
          },
        },
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced, lang])

  return (
    <section className="craft section" id="craft" ref={sectionRef}>
      <MasonryDivider />
      <div className="wrap">
        <div className="craft__head">
          <div>
            <Reveal>
              <span className="eyebrow">{t('craft_eyebrow')}</span>
            </Reveal>
            <h2 className="craft__title">
              <SplitWords text={t('craft_title_1')} /> <br />
              <SplitWords text={t('craft_title_2')} delay={140} /> <br />
              <em><SplitWords text={t('craft_title_3')} delay={300} /></em>{' '}
              <SplitWords text={t('craft_title_4')} delay={430} />
            </h2>
          </div>
          <Reveal className="craft__head-note" variant="right" delay={250}>
            <p>
              {t('craft_head_note')}
            </p>
          </Reveal>
        </div>

        <div className="craft__progress" aria-hidden="true">
          <div className="craft__progress-bar" />
        </div>
        <ol className="craft__steps">
          {stepsData.map((s, i) => (
            <Reveal as="li" className="craft__step fx-card spot" key={s.no} delay={i * 120} {...fx}>
              <span className="craft__no">{s.no}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
