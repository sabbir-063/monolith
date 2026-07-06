import { Reveal, CountUp, SplitWords, useCardFx } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Specs.css'

export default function Specs() {
  const { lang, t } = useLanguage()
  const fx = useCardFx(3)

  const cells = [
    { num: <CountUp to={1000} suffix={lang === 'bn' ? '°সে.' : '°C'} />, label: t('specs_label_kiln') },
    { num: <CountUp to={2.7} decimals={1} suffix={lang === 'bn' ? ' কেজি' : ' kg'} />, label: t('specs_label_weight') },
    { num: <CountUp to={0} />, label: t('specs_label_software') },
    { num: <>&infin;</>, label: t('specs_label_battery') },
    { num: <CountUp to={100} suffix="%" />, label: t('specs_label_offline') },
    { num: <CountUp to={10000} suffix={lang === 'bn' ? ' বছর' : ' yrs'} />, label: t('specs_label_lifespan') },
  ]

  const rows = [
    { k: t('specs_row_dimensions_k'), v: lang === 'bn' ? '২১৫ × ১০২.৫ × ৬৫ মিমি' : '215 × 102.5 × 65 mm' },
    { k: t('specs_row_material_k'), v: t('specs_row_material_v') },
    { k: t('specs_row_finish_k'), v: t('specs_row_finish_v') },
    { k: t('specs_row_connectivity_k'), v: t('specs_row_connectivity_v') },
    { k: t('specs_row_water_k'), v: t('specs_row_water_v') },
    { k: t('specs_row_warranty_k'), v: t('specs_row_warranty_v') },
  ]

  return (
    <section className="specs section" id="specs">
      <div className="wrap">
        <div className="specs__head">
          <div>
            <Reveal>
              <span className="eyebrow">{t('specs_eyebrow')}</span>
            </Reveal>
            <h2><SplitWords text={t('specs_title')} delay={120} /></h2>
          </div>
          <Reveal className="specs__intro" variant="right" delay={200}>
            <p>{t('specs_intro')}</p>
          </Reveal>
        </div>

        <div className="specs__grid">
          {cells.map((c, i) => {
            // diagonal cascade: top-left cell first, bottom-right last
            const diag = (i % 3) + Math.floor(i / 3)
            return (
              <Reveal className="specs__cell fx-card spot" variant="scale" delay={diag * 110} key={i} {...fx}>
                <div className="specs__num">{c.num}</div>
                <div className="specs__label">{c.label}</div>
              </Reveal>
            )
          })}
        </div>

        <div className="specs__table">
          {rows.map((r, i) => (
            <Reveal className="specs__row" variant="up" delay={i * 80} key={i}>
              <span className="specs__k">{r.k}</span>
              <span className="specs__dots" aria-hidden="true" />
              <span className="specs__v">{r.v}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
