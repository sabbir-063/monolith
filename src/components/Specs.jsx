import { Reveal, CountUp } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Specs.css'

export default function Specs() {
  const { lang, t } = useLanguage()

  return (
    <section className="specs section" id="specs">
      <div className="wrap">
        <div className="specs__head">
          <Reveal>
            <span className="eyebrow">{t('specs_eyebrow')}</span>
            <h2>{t('specs_title')}</h2>
          </Reveal>
          <Reveal className="specs__intro">
            <p>{t('specs_intro')}</p>
          </Reveal>
        </div>

        <div className="specs__grid">
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={1000} suffix={lang === 'bn' ? '°সে.' : '°C'} /></div>
            <div className="specs__label">{t('specs_label_kiln')}</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={2.7} decimals={1} suffix={lang === 'bn' ? ' কেজি' : ' kg'} /></div>
            <div className="specs__label">{t('specs_label_weight')}</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={0} /></div>
            <div className="specs__label">{t('specs_label_software')}</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num">&infin;</div>
            <div className="specs__label">{t('specs_label_battery')}</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={100} suffix="%" /></div>
            <div className="specs__label">{t('specs_label_offline')}</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={10000} suffix={lang === 'bn' ? ' বছর' : ' yrs'} /></div>
            <div className="specs__label">{t('specs_label_lifespan')}</div>
          </Reveal>
        </div>

        <Reveal className="specs__table">
          <Row k={t('specs_row_dimensions_k')} v={lang === 'bn' ? '২১৫ × ১০২.৫ × ৬৫ মিমি' : '215 × 102.5 × 65 mm'} />
          <Row k={t('specs_row_material_k')} v={t('specs_row_material_v')} />
          <Row k={t('specs_row_finish_k')} v={t('specs_row_finish_v')} />
          <Row k={t('specs_row_connectivity_k')} v={t('specs_row_connectivity_v')} />
          <Row k={t('specs_row_water_k')} v={t('specs_row_water_v')} />
          <Row k={t('specs_row_warranty_k')} v={t('specs_row_warranty_v')} />
        </Reveal>
      </div>
    </section>
  )
}

function Row({ k, v }) {
  return (
    <div className="specs__row">
      <span className="specs__k">{k}</span>
      <span className="specs__dots" aria-hidden="true" />
      <span className="specs__v">{v}</span>
    </div>
  )
}
