import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Reveal, Stamp } from './primitives'
import './Configurator.css'

const FINISHES = [
  { id: 'oxblood', name: 'Classic Oxblood', color: '#9b2d20', price: 24000, note: 'The original. Fired to permanence.' },
  { id: 'matte', name: 'Matte Obsidian', color: '#241410', price: 31000, note: 'Limited firing. Deeper, quieter.' },
  { id: 'kiln', name: 'Kiln Orange', color: '#e2562a', price: 38000, note: 'Pulled from the fire at its brightest.' },
]
const ENGRAVE_COST = 4000

export default function Configurator({ notify }) {
  const [finishId, setFinishId] = useState('oxblood')
  const [engrave, setEngrave] = useState('')
  const [bursts, setBursts] = useState([])
  const btnRef = useRef(null)

  const finish = FINISHES.find((f) => f.id === finishId)
  const total = finish.price + (engrave.trim() ? ENGRAVE_COST : 0)

  const reserve = () => {
    // spawn a short dust burst from the button
    const id = Date.now()
    const particles = Array.from({ length: 18 }).map((_, i) => ({
      i,
      angle: (Math.PI * 2 * i) / 18 + Math.random() * 0.4,
      dist: 40 + Math.random() * 60,
    }))
    setBursts((b) => [...b, { id, particles, color: finish.color }])
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900)
    notify(`Reserved — ${finish.name}${engrave.trim() ? ` · “${engrave.trim()}”` : ''}`)
  }

  return (
    <section className="config section" id="reserve">
      <div className="wrap config__wrap">
        <Reveal className="config__intro">
          <span className="eyebrow">Reserve yours</span>
          <h2>Configure the<br />MONOLITH</h2>
          <p>Three finishes. One optional mark. A lifetime — or several — of ownership.</p>
          <Stamp className="config__stamp" />
        </Reveal>

        <Reveal className="config__panel">
          <div
            className="config__preview"
            style={{ '--swatch': finish.color }}
          >
            <div className="config__brick" />
            <p className="config__note">{finish.note}</p>
          </div>

          <div className="config__field">
            <label>Finish</label>
            <div className="config__finishes">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  className={`config__chip ${f.id === finishId ? 'is-active' : ''}`}
                  onClick={() => setFinishId(f.id)}
                  aria-pressed={f.id === finishId}
                >
                  <span className="config__dot" style={{ background: f.color }} />
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="config__field">
            <label htmlFor="engrave">Engraving <span>optional · +৳4,000</span></label>
            <input
              id="engrave"
              type="text"
              maxLength={18}
              value={engrave}
              onChange={(e) => setEngrave(e.target.value)}
              placeholder="e.g. PROPERTY OF NO ONE"
            />
          </div>

          <div className="config__total">
            <span>Total</span>
            <strong>৳ {total.toLocaleString()}</strong>
          </div>

          <motion.button
            ref={btnRef}
            className="btn btn--primary config__add"
            onClick={reserve}
            whileTap={{ scale: 0.97 }}
          >
            Add to cart <span className="btn__arrow">&rarr;</span>
            {bursts.map((burst) => (
              <span className="config__burst" key={burst.id}>
                {burst.particles.map((p) => (
                  <span
                    key={p.i}
                    className="config__particle"
                    style={{
                      background: burst.color,
                      '--dx': `${Math.cos(p.angle) * p.dist}px`,
                      '--dy': `${Math.sin(p.angle) * p.dist}px`,
                    }}
                  />
                ))}
              </span>
            ))}
          </motion.button>
          <p className="config__fine">Ships in a custom timber crate. No assembly. Ever.</p>
        </Reveal>
      </div>
    </section>
  )
}
