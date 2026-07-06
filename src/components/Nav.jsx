import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext.jsx'

const LINKS = [
  { id: 'manifesto', key: 'nav_manifesto' },
  { id: 'specs', key: 'nav_specs' },
  { id: 'play', key: 'nav_play' },
]

export default function Nav({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(null)
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll spy — track which linked section sits in the middle of the viewport
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean)
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
          else setActive((cur) => (cur === e.target.id ? null : cur))
        })
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
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
      <motion.a
        href="#top"
        className="nav__brand"
        onClick={go('#top')}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {lang === 'en' ? (
          <>MONO<span>LITH</span></>
        ) : (
          <>মনো<span>লিথ</span></>
        )}
      </motion.a>
      <div className="nav__links">
        {LINKS.map((l, i) => (
          <motion.a
            key={l.id}
            href={`#${l.id}`}
            className={`nav__link ${active === l.id ? 'is-active' : ''}`}
            onClick={go(`#${l.id}`)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.09 }}
          >
            {t(l.key)}
            {active === l.id && (
              <motion.span
                className="nav__underline"
                layoutId="nav-underline"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
          </motion.a>
        ))}
        <motion.a
          href="#reserve"
          className="btn btn--primary nav__cta"
          onClick={go('#reserve')}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {t('nav_reserve')}
        </motion.a>
        <motion.button
          className="nav__link"
          onClick={toggleLang}
          aria-label={lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
          style={{ fontWeight: 600, color: 'var(--kiln)' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {lang === 'en' ? 'বাং' : 'EN'}
        </motion.button>
      </div>
    </nav>
  )
}
