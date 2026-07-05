import { Stamp } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Footer({ notify }) {
  const { lang, t } = useLanguage()

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <h3>
              {lang === 'en' ? (
                <>MONO<span style={{ color: 'var(--kiln)' }}>LITH</span></>
              ) : (
                <>মনো<span style={{ color: 'var(--kiln)' }}>লিথ</span></>
              )}
            </h3>
            <p>{t('footer_desc')}</p>
            <div className="footer__news">
              <input type="email" placeholder={t('footer_newsletter_placeholder')} aria-label="Email address" />
              <button className="btn btn--primary" onClick={() => notify(t('footer_newsletter_success'))}>{t('footer_newsletter_btn')}</button>
            </div>
          </div>

          <div className="footer__cols">
            <div className="footer__col">
              <h4>{t('footer_col_object')}</h4>
              <a href="#manifesto">{t('footer_link_manifesto')}</a>
              <a href="#craft">{t('footer_link_making')}</a>
              <a href="#specs">{t('footer_link_specs')}</a>
              <a href="#reserve">{t('footer_link_reserve')}</a>
            </div>
            <div className="footer__col">
              <h4>{t('footer_col_house')}</h4>
              <a href="#press">{t('footer_link_press')}</a>
              <a href="#play">{t('footer_link_play')}</a>
              <a href="#top">{t('footer_link_stockists')}</a>
              <a href="#top">{t('footer_link_care')}</a>
            </div>
            <div className="footer__col">
              <h4>{t('footer_col_mark')}</h4>
              <Stamp />
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{t('footer_copyright')}</span>
          <span>{t('footer_bootcamp')}</span>
          <span>
            Developed by <a href="https://sabbirmusfique.com.bd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--kiln)', textDecoration: 'none', fontWeight: 'bold' }}>Sabbir Musfique</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
