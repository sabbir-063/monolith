import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Reveal, Stamp } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import OrderModal from './OrderModal.jsx'
import './Configurator.css'

const FINISHES = [
  { id: 'oxblood', color: '#9b2d20', price: 24000 },
  { id: 'matte',   color: '#241410', price: 31000 },
  { id: 'kiln',    color: '#e2562a', price: 38000 },
]
const ENGRAVE_COST = 4000

export default function Configurator({ notify }) {
  const { lang, t } = useLanguage()

  const [finishId,   setFinishId]   = useState('oxblood')
  const [engrave,    setEngrave]    = useState('')
  const [quantity,   setQuantity]   = useState(1)
  const [bursts,     setBursts]     = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const btnRef = useRef(null)

  const finishesData = FINISHES.map((f) => ({
    ...f,
    name: t(`config_finish_${f.id}_name`),
    note: t(`config_finish_${f.id}_note`),
  }))

  const finish       = finishesData.find((f) => f.id === finishId)
  const hasEngrave   = Boolean(engrave.trim())
  const engraveCost  = hasEngrave ? ENGRAVE_COST * quantity : 0
  const total        = finish.price * quantity + engraveCost

  const fmt = (n) => Number(n).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')

  const addToCart = useCallback(() => {
    // Particle burst
    const id = Date.now()
    const particles = Array.from({ length: 18 }).map((_, i) => ({
      i,
      angle: (Math.PI * 2 * i) / 18 + Math.random() * 0.4,
      dist:  40 + Math.random() * 60,
    }))
    setBursts((b) => [...b, { id, particles, color: finish.color }])
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900)

    // Open modal
    setShowModal(true)
  }, [finish])

  return (
    <>
      <section className="config section" id="reserve">
        <div className="wrap config__wrap">
          <Reveal className="config__intro">
            <span className="eyebrow">{t('config_eyebrow')}</span>
            <h2>
              {lang === 'en' ? (
                <>Configure the<br />MONOLITH</>
              ) : (
                <>মনোলিথ<br />কনফিগার করুন</>
              )}
            </h2>
            <p>{t('config_sub')}</p>
            <Stamp className="config__stamp" />
          </Reveal>

          <Reveal className="config__panel">
            {/* Brick preview */}
            <div className="config__preview" style={{ '--swatch': finish.color }}>
              <div className="config__brick" />
              <p className="config__note">{finish.note}</p>
            </div>

            {/* Finish selector */}
            <div className="config__field">
              <label>{t('config_finish_label')}</label>
              <div className="config__finishes">
                {finishesData.map((f) => (
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

            {/* Quantity picker */}
            <div className="config__field">
              <label>{t('config_qty_label')}</label>
              <div className="config__qty">
                <button
                  className="config__qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >−</button>
                <span className="config__qty-val">
                  {fmt(quantity)}
                </span>
                <button
                  className="config__qty-btn"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  disabled={quantity >= 99}
                  aria-label="Increase quantity"
                >+</button>
              </div>
            </div>

            {/* Engraving */}
            <div className="config__field">
              <label htmlFor="engrave">
                {t('config_engrave_label')} <span>{t('config_engrave_sub')}</span>
              </label>
              <input
                id="engrave"
                type="text"
                maxLength={18}
                value={engrave}
                onChange={(e) => setEngrave(e.target.value)}
                placeholder={t('config_engrave_placeholder')}
              />
            </div>

            {/* Total */}
            <div className="config__total">
              <span>{t('config_total_label')}</span>
              <strong>৳ {fmt(total)}</strong>
            </div>

            {/* CTA */}
            <motion.button
              ref={btnRef}
              className="btn btn--primary config__add"
              onClick={addToCart}
              whileTap={{ scale: 0.97 }}
            >
              {t('config_add_btn')} <span className="btn__arrow">&rarr;</span>

              {/* Particle bursts */}
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

            <p className="config__fine">{t('config_fine')}</p>
          </Reveal>
        </div>
      </section>

      {/* Order Modal */}
      <OrderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        finish={finish}
        quantity={quantity}
        engrave={engrave}
      />
    </>
  )
}
