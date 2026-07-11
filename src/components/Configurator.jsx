import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal, Stamp, Ticker } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import OrderModal from './OrderModal.jsx'
import './Configurator.css'
import { trackEvent } from '../lib/tracker'

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
  const qtyDir = useRef(1) // 1 = increased, -1 = decreased (drives the roll direction)

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

  const changeQty = (delta) => {
    qtyDir.current = delta
    setQuantity((q) => {
      const nextQ = Math.min(99, Math.max(1, q + delta))
      trackEvent('configurator_change_quantity', `Changed from ${q} to ${nextQ}`)
      return nextQ;
    })
  }

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

    // Track configurator CTA submit
    trackEvent('configurator_reserve_click', `Finish: ${finishId}, Qty: ${quantity}, Engrave: "${engrave.trim() || 'none'}"`)

    // Open modal
    setShowModal(true)
  }, [finish, finishId, quantity, engrave])

  return (
    <>
      <section className="config section" id="reserve">
        <div className="wrap config__wrap">
          <Reveal className="config__intro" variant="left">
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

          <Reveal className="config__panel" variant="right" delay={150}>
            {/* Brick preview — flips over when the finish changes */}
            <div className="config__preview" style={{ '--swatch': finish.color }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={finish.id}
                  className="config__brick"
                  initial={{ rotateX: -95, opacity: 0, y: -14 }}
                  animate={{ rotateX: 0, opacity: 1, y: 0 }}
                  exit={{ rotateX: 95, opacity: 0, y: 14 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* live engraving preview */}
                  <AnimatePresence>
                    {hasEngrave && (
                      <motion.span
                        className="config__engraving"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.25 }}
                      >
                        {engrave.trim().toUpperCase()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={finish.id}
                  className="config__note"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {finish.note}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Finish selector — active pill slides between chips */}
            <div className="config__field">
              <label>{t('config_finish_label')}</label>
              <div className="config__finishes">
                {finishesData.map((f) => (
                  <button
                    key={f.id}
                    className={`config__chip ${f.id === finishId ? 'is-active' : ''}`}
                    onClick={() => {
                      setFinishId(f.id)
                      trackEvent('configurator_select_finish', f.id)
                    }}
                    aria-pressed={f.id === finishId}
                  >
                    {f.id === finishId && (
                      <motion.span
                        className="config__chip-pill"
                        layoutId="chip-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="config__dot" style={{ background: f.color }} />
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity picker — value rolls up/down */}
            <div className="config__field">
              <label>{t('config_qty_label')}</label>
              <div className="config__qty">
                <button
                  className="config__qty-btn"
                  onClick={() => changeQty(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >−</button>
                <span className="config__qty-val">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={quantity}
                      initial={{ y: qtyDir.current > 0 ? 16 : -16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: qtyDir.current > 0 ? -16 : 16, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{ display: 'inline-block' }}
                    >
                      {fmt(quantity)}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <button
                  className="config__qty-btn"
                  onClick={() => changeQty(1)}
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

            {/* Total — rolls to the new amount instead of jumping */}
            <div className="config__total">
              <span>{t('config_total_label')}</span>
              <strong>৳ <Ticker value={total} format={fmt} /></strong>
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
