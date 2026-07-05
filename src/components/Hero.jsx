import { motion } from 'framer-motion'
import Brick3D from './Brick3D'
import { Stamp } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Hero.css'

export default function Hero({ onReserve, reduced }) {
  const { lang, t } = useLanguage()

  return (
    <header className="hero" id="top">
      <div className="hero__bg" aria-hidden="true" />

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

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            {lang === 'en' ? (
              <>MONO<span>LITH</span></>
            ) : (
              <>মনো<span>লিথ</span></>
            )}
          </motion.h1>

          <motion.p
            className="hero__lede"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('hero_lede')}
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            <button className="btn btn--primary" onClick={onReserve}>
              {t('hero_reserve')} <span className="btn__arrow">&rarr;</span>
            </button>
            <span className="hero__price">{t('hero_price_from')} <strong>৳ {(24000).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</strong></span>
          </motion.div>
        </div>

        <div className="hero__stage">
          <Brick3D reduced={reduced} />
          <p className="hero__drag">{t('hero_drag')}</p>
        </div>
      </div>

      <div className="hero__foot wrap">
        <Stamp />
        <a className="hero__scroll" href="#manifesto">
          <span>{t('hero_scroll')}</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
        <p className="hero__edition">{t('hero_edition')}&nbsp;{lang === 'bn' ? '০০১' : '001'} / &infin;</p>
      </div>
    </header>
  )
}
