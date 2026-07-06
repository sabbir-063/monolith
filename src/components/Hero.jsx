import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Brick3D from './Brick3D'
import { Stamp, SplitChars, Magnetic, Embers } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

export default function Hero({ onReserve, reduced }) {
  const { lang, t } = useLanguage()
  const heroRef = useRef(null)

  // Parallax exit — the copy drifts up slightly as you scroll into the
  // manifesto. The brick stage is left alone so it stays fully visible.
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.to('.hero__copy', {
        yPercent: -16,
        opacity: 0.45,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <header className="hero" id="top" ref={heroRef}>
      <div className="hero__bg" aria-hidden="true" />
      {!reduced && <Embers count={16} />}

      <div className="hero__grid wrap">
        <div className="hero__copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t('hero_eyebrow')}
          </motion.span>

          <h1 className="hero__title">
            {lang === 'en' ? (
              <>
                <SplitChars text="MONO" delay={250} stagger={55} />
                <span className="hero__title-glow">
                  <SplitChars text="LITH" delay={500} stagger={55} />
                </span>
              </>
            ) : (
              <>
                <SplitChars text="মনো" delay={250} stagger={70} />
                <span className="hero__title-glow">
                  <SplitChars text="লিথ" delay={450} stagger={70} />
                </span>
              </>
            )}
          </h1>

          <motion.p
            className="hero__lede"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            {t('hero_lede')}
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Magnetic>
              <button className="btn btn--primary" onClick={onReserve}>
                {t('hero_reserve')} <span className="btn__arrow">&rarr;</span>
              </button>
            </Magnetic>
            <span className="hero__price">{t('hero_price_from')} <strong>৳ {(24000).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</strong></span>
          </motion.div>
        </div>

        <motion.div
          className="hero__stage"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Brick3D reduced={reduced} />
          <p className="hero__drag">{t('hero_drag')}</p>
        </motion.div>
      </div>

      <motion.div
        className="hero__foot wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
      >
        <Stamp />
        <a className="hero__scroll" href="#manifesto">
          <span>{t('hero_scroll')}</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
        <p className="hero__edition">{t('hero_edition')}&nbsp;{lang === 'bn' ? '০০১' : '001'} / &infin;</p>
      </motion.div>
    </header>
  )
}
