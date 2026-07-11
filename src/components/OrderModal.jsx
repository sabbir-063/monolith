import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext.jsx'
import './OrderModal.css'
import { trackEvent } from '../lib/tracker'

const ENGRAVE_COST = 4000

export default function OrderModal({ isOpen, onClose, finish, quantity, engrave }) {
  const { lang, t } = useLanguage()

  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [nameError,   setNameError]   = useState('')
  const [emailError,  setEmailError]  = useState('')
  const [status,      setStatus]      = useState('idle') // idle | loading | success | error
  const [orderId,     setOrderId]     = useState('')
  const [errorMsg,    setErrorMsg]    = useState('')
  const [confetti,    setConfetti]    = useState([])

  // ── Derived totals ────────────────────────────────────────────────────────
  const hasEngrave  = Boolean(engrave && engrave.trim())
  const engraveCost = hasEngrave ? ENGRAVE_COST * quantity : 0
  const subtotal    = (finish?.price ?? 0) * quantity
  const total       = subtotal + engraveCost

  const fmt = (n) => Number(n).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')

  // ── Lock body scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── Track Modal View Event ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && finish) {
      trackEvent('modal_open', `Reserve Modal Opened: Finish: ${finish.name}, Qty: ${quantity}`)
    }
  }, [isOpen, finish, quantity])

  // ── Close on ESC ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // ── Reset form when modal hides ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      const tid = setTimeout(() => {
        setName(''); setEmail('')
        setNameError(''); setEmailError('')
        setStatus('idle'); setOrderId(''); setErrorMsg('')
        setConfetti([])
      }, 320)
      return () => clearTimeout(tid)
    }
  }, [isOpen])

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    let ok = true
    if (!name.trim() || name.trim().length < 2) {
      setNameError(t('order_name_error')); ok = false
    } else { setNameError('') }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t('order_email_error')); ok = false
    } else { setEmailError('') }

    return ok
  }, [name, email, t])

  // ── Place order ───────────────────────────────────────────────────────────
  const placeOrder = useCallback(async () => {
    if (!validate()) return
    setStatus('loading')
    setErrorMsg('')

    trackEvent('checkout_submit_attempt', `Name: ${name.trim()}, Email: ${email.trim()}, Finish: ${finish.name}, Qty: ${quantity}, Total: ৳${total}`)

    try {
      const res = await fetch('/api/send-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        name.trim(),
          email:       email.trim(),
          finishName:  finish.name,
          finishColor: finish.color,
          quantity,
          engrave:     engrave || '',
          subtotal,
          engraveCost,
          total,
          lang,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || t('order_error_generic'))
        trackEvent('checkout_failure', `Error: ${data.error || t('order_error_generic')}, Name: ${name.trim()}, Email: ${email.trim()}`)
        return
      }

      setOrderId(data.orderId)
      setStatus('success')
      trackEvent('checkout_success', `Order ID: ${data.orderId}, Name: ${name.trim()}, Email: ${email.trim()}, Total: ৳${total}`)

      // Confetti burst
      setConfetti(
        Array.from({ length: 26 }, (_, i) => ({
          id:       i,
          x:        Math.random() * 100,
          color:    ['#e2562a','#9b2d20','#f08a4b','#ece4d6','#e2562a','#b9ad9b'][i % 6],
          delay:    (Math.random() * 0.5).toFixed(2),
          duration: (0.7 + Math.random() * 0.7).toFixed(2),
        }))
      )
    } catch (err) {
      setStatus('error')
      setErrorMsg(t('order_error_generic'))
      trackEvent('checkout_failure', `Exception thrown, Name: ${name.trim()}, Email: ${email.trim()}`)
    }
  }, [validate, name, email, finish, quantity, engrave, subtotal, engraveCost, total, lang, t])

  if (!finish) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="modal__backdrop"
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* ── Card ── */}
          <motion.div
            className="modal__card"
            key="card"
            role="dialog"
            aria-modal="true"
            aria-label={t('order_summary_title')}
            initial={{ opacity: 0, y: 52, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Confetti particles */}
            {confetti.map((p) => (
              <span
                key={p.id}
                className="modal__confetti"
                style={{
                  left:              `${p.x}%`,
                  background:         p.color,
                  animationDelay:    `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ))}

            {/* ── Header ── */}
            <div className="modal__header">
              <p className="modal__brand">
                <span>{lang === 'en' ? 'MONO' : 'মনো'}</span>
                {lang === 'en' ? 'LITH' : 'লিথ'}
              </p>
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
                data-track="Checkout Modal: Close Icon Button"
              >✕</button>
            </div>

            {/* ── SUCCESS state ── */}
            {status === 'success' ? (
              <div className="modal__success">
                <div className="modal__checkmark">
                  <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="26" cy="26" r="24" stroke="var(--kiln)" strokeWidth="2" fill="none" />
                    <path
                      d="M14.5 27L21.5 34L37.5 18"
                      stroke="var(--kiln)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                <h2>{t('order_success_title')}</h2>
                <p>{t('order_success_subtitle')}</p>

                <div className="modal__order-id">
                  <span>{t('order_success_id_label')}</span>
                  <strong>{orderId}</strong>
                </div>

                <button
                  className="btn btn--ghost modal__done"
                  onClick={onClose}
                  data-track="Checkout Modal: Success Done Button"
                >
                  {t('order_close')}
                </button>
              </div>
            ) : (
              /* ── FORM state ── */
              <div className="modal__body">

                {/* Left: Order Summary */}
                <div className="modal__summary">
                  <p className="modal__summary-title">{t('order_summary_title')}</p>

                  {/* Mini brick preview */}
                  <div
                    className="modal__brick-preview"
                    style={{ background: finish.color }}
                  >
                    <div className="modal__brick-frog" />
                    {hasEngrave && (
                      <p className="modal__brick-engrave">{engrave.trim()}</p>
                    )}
                  </div>

                  {/* Rows */}
                  <div className="modal__summary-rows">
                    <div className="modal__summary-row">
                      <span>{t('order_finish_label')}</span>
                      <span>{finish.name}</span>
                    </div>

                    <div className="modal__summary-row">
                      <span>{t('order_qty_summary_label')}</span>
                      <span>{fmt(quantity)}</span>
                    </div>

                    {hasEngrave && (
                      <div className="modal__summary-row">
                        <span>{t('order_engrave_summary_label')}</span>
                        <span className="modal__engrave-text">"{engrave.trim()}"</span>
                      </div>
                    )}

                    <div className="modal__summary-row">
                      <span>{t('order_subtotal_label')}</span>
                      <span>৳ {fmt(subtotal)}</span>
                    </div>

                    {hasEngrave && (
                      <div className="modal__summary-row">
                        <span>{t('order_engrave_cost_label')}</span>
                        <span>৳ {fmt(engraveCost)}</span>
                      </div>
                    )}

                    <div className="modal__summary-row modal__summary-total">
                      <span>{t('order_total_label')}</span>
                      <strong>৳ {fmt(total)}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Form */}
                <div className="modal__form">

                  {/* Name */}
                  <div className="modal__field">
                    <label htmlFor="order-name">{t('order_name_label')}</label>
                    <input
                      id="order-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (nameError) setNameError('')
                      }}
                      placeholder={t('order_name_placeholder')}
                      autoComplete="name"
                      disabled={status === 'loading'}
                      className={nameError ? 'is-error' : ''}
                    />
                    {nameError && <span className="modal__error">{nameError}</span>}
                  </div>

                  {/* Email */}
                  <div className="modal__field">
                    <label htmlFor="order-email">{t('order_email_label')}</label>
                    <input
                      id="order-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError('')
                      }}
                      placeholder={t('order_email_placeholder')}
                      autoComplete="email"
                      disabled={status === 'loading'}
                      className={emailError ? 'is-error' : ''}
                    />
                    {emailError && <span className="modal__error">{emailError}</span>}
                  </div>

                  {/* API error banner */}
                  {status === 'error' && (
                    <div className="modal__error-banner">
                      <span>⚠ {errorMsg}</span>
                      <button onClick={() => setStatus('idle')}>
                        {t('order_error_retry')}
                      </button>
                    </div>
                  )}

                  {/* Submit */}
                  <motion.button
                    className="btn btn--primary modal__submit"
                    onClick={placeOrder}
                    disabled={status === 'loading'}
                    whileTap={{ scale: 0.97 }}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="modal__spinner" />
                        {t('order_placing')}
                      </>
                    ) : (
                      <>
                        {t('order_place_btn')}
                        <span className="btn__arrow">→</span>
                      </>
                    )}
                  </motion.button>

                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
