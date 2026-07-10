import { useState } from 'react'
import { Stamp, Reveal, segmentGraphemes } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'

/* Letters lift one by one as you sweep the cursor across the wordmark.
   Grapheme segmentation keeps Bangla vowel signs attached to their consonants. */
function HoverWord({ text, color }) {
  return (
    <span className="footer__word" style={color ? { color } : undefined}>
      {segmentGraphemes(text).map((c, i) => (
        <span className="footer__letter" key={i} style={{ '--i': i }}>
          {c}
        </span>
      ))}
    </span>
  )
}

export default function Footer({ notify }) {
  const { lang, t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      notify(t('order_email_error') || 'Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        notify(data.error || t('order_error_generic'))
        return
      }

      notify(t('footer_newsletter_success'))
      setEmail('')
    } catch (error) {
      console.error(error)
      notify(t('order_error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <Reveal className="footer__brand" variant="left">
            <h3>
              {lang === 'en' ? (
                <>
                  <HoverWord text="MONO" />
                  <HoverWord text="LITH" color="var(--kiln)" />
                </>
              ) : (
                <>
                  <HoverWord text="মনো" />
                  <HoverWord text="লিথ" color="var(--kiln)" />
                </>
              )}
            </h3>
            <p>{t('footer_desc')}</p>
            <form className="footer__news" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder={t('footer_newsletter_placeholder')}
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
              >
                {loading ? '...' : t('footer_newsletter_btn')}
              </button>
            </form>
          </Reveal>

          <div className="footer__cols">
            <Reveal className="footer__col" delay={120}>
              <h4>{t('footer_col_object')}</h4>
              <a href="#manifesto">{t('footer_link_manifesto')}</a>
              <a href="#craft">{t('footer_link_making')}</a>
              <a href="#specs">{t('footer_link_specs')}</a>
              <a href="#reserve">{t('footer_link_reserve')}</a>
            </Reveal>
            <Reveal className="footer__col" delay={240}>
              <h4>{t('footer_col_house')}</h4>
              <a href="#press">{t('footer_link_press')}</a>
              <a href="#play">{t('footer_link_play')}</a>
              <a href="#top">{t('footer_link_stockists')}</a>
              <a href="#top">{t('footer_link_care')}</a>
            </Reveal>
            <Reveal className="footer__col" delay={360}>
              <h4>{t('footer_col_mark')}</h4>
              <Stamp />
            </Reveal>
          </div>
        </div>

        <Reveal className="footer__bottom" delay={200}>
          <span>{t('footer_copyright')}</span>
          <span>{t('footer_bootcamp')}</span>
          <span>
            {t('footer_developed_by')} <a href="https://sabbirmusfique.com.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--kiln)', textDecoration: 'none', fontWeight: 'bold' }}>{t('footer_developer_name')}</a>
          </span>
        </Reveal>
      </div>
    </footer>
  )
}
