import { useState, useEffect } from 'react'

/**
 * Returns true when the user has asked the OS for reduced motion.
 * We gate the heavy effects (smooth scroll, 3D auto-rotate, scroll pinning)
 * on this so the site stays comfortable for everyone.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
