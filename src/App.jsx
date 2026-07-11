import { useEffect, useRef, useCallback, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'

import Nav from './components/Nav'
import Hero from './components/Hero'
import Manifesto from './components/Manifesto'
import Craftsmanship from './components/Craftsmanship'
import Specs from './components/Specs'
import StackGame from './components/StackGame'
import Testimonials from './components/Testimonials'
import Configurator from './components/Configurator'
import Footer from './components/Footer'
import { usePrefersReducedMotion } from './hooks/useReducedMotion'
import { initTracker } from './lib/tracker'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const reduced = usePrefersReducedMotion()
  const lenisRef = useRef(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Initialize analytics tracker on mount
  useEffect(() => {
    initTracker()
  }, [])

  // Smooth scroll + GSAP ScrollTrigger sync (skipped when reduced motion is on)
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)
    const onRaf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(onRaf)
    gsap.ticker.lagSmoothing(0)

    // make sure pinned triggers measure correctly once mounted
    const refresh = () => ScrollTrigger.refresh()
    const t = setTimeout(refresh, 300)

    return () => {
      clearTimeout(t)
      gsap.ticker.remove(onRaf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = useCallback(
    (selector) => {
      const el = document.querySelector(selector)
      if (!el) return
      if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -8 })
      else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    },
    [reduced],
  )

  const notify = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  return (
    <>
      <Nav onNavigate={scrollTo} />

      <main>
        <Hero onReserve={() => scrollTo('#reserve')} reduced={reduced} />
        <Manifesto />
        <Craftsmanship />
        <Specs />
        <StackGame />
        <Testimonials />
        <Configurator notify={notify} />
      </main>

      <Footer notify={notify} />

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
          >
            <span aria-hidden="true">●</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
