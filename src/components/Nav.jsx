import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Nav({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (sel) => (e) => {
    e.preventDefault()
    onNavigate(sel)
  }

  const toggleLang = () => {
    setLang(lang === 'en' ? 'bn' : 'en')
  }

  return (
    <nav className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#top" className="nav__brand" onClick={go('#top')}>
        {lang === 'en' ? (
          <>MONO<span>LITH</span></>
        ) : (
          <>মনো<span>লিথ</span></>
        )}
      </a>
      <div className="nav__links">
        <a href="#manifesto" className="nav__link" onClick={go('#manifesto')}>{t('nav_manifesto')}</a>
        <a href="#specs" className="nav__link" onClick={go('#specs')}>{t('nav_specs')}</a>
        <a href="#play" className="nav__link" onClick={go('#play')}>{t('nav_play')}</a>
        <motion.a
          href="#reserve"
          className="btn btn--primary nav__cta"
          onClick={go('#reserve')}
          whileTap={{ scale: 0.96 }}
        >
          {t('nav_reserve')}
        </motion.a>
        <button
          className="nav__link"
          onClick={toggleLang}
          aria-label={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
          style={{ fontWeight: 600, color: 'var(--kiln)' }}
        >
          {lang === 'en' ? 'বাং' : 'EN'}
        </button>
      </div>
    </nav>
  )
}
