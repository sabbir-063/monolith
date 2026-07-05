import { motion } from 'framer-motion'
import Brick3D from './Brick3D'
import { Stamp } from './primitives'
import './Hero.css'

export default function Hero({ onReserve, reduced }) {
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
            One material · Ten thousand years
          </motion.span>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            MONO<span>LITH</span>
          </motion.h1>

          <motion.p
            className="hero__lede"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The original red brick. Handcrafted from a single piece of earth,
            fired at 1000&deg;C, and engineered to outlive every device you own.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            <button className="btn btn--primary" onClick={onReserve}>
              Reserve yours <span className="btn__arrow">&rarr;</span>
            </button>
            <span className="hero__price">From <strong>৳ 24,000</strong></span>
          </motion.div>
        </div>

        <div className="hero__stage">
          <Brick3D reduced={reduced} />
          <p className="hero__drag">Drag to rotate</p>
        </div>
      </div>

      <div className="hero__foot wrap">
        <Stamp />
        <a className="hero__scroll" href="#manifesto">
          <span>Scroll</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
        <p className="hero__edition">Edition&nbsp;001 / &infin;</p>
      </div>
    </header>
  )
}
