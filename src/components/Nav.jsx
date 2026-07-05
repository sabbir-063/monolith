import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Nav({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false)

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

  return (
    <nav className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#top" className="nav__brand" onClick={go('#top')}>
        MONO<span>LITH</span>
      </a>
      <div className="nav__links">
        <a href="#manifesto" className="nav__link" onClick={go('#manifesto')}>Manifesto</a>
        <a href="#specs" className="nav__link" onClick={go('#specs')}>Specs</a>
        <a href="#play" className="nav__link" onClick={go('#play')}>Play</a>
        <motion.a
          href="#reserve"
          className="btn btn--primary nav__cta"
          onClick={go('#reserve')}
          whileTap={{ scale: 0.96 }}
        >
          Reserve
        </motion.a>
      </div>
    </nav>
  )
}
