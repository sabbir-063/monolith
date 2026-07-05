import { Reveal, MasonryDivider } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Craftsmanship.css'

export default function Craftsmanship() {
  const { lang, t } = useLanguage()

  const stepsData = [
    {
      no: t('craft_step1_no'),
      title: t('craft_step1_title'),
      body: t('craft_step1_body'),
    },
    {
      no: t('craft_step2_no'),
      title: t('craft_step2_title'),
      body: t('craft_step2_body'),
    },
    {
      no: t('craft_step3_no'),
      title: t('craft_step3_title'),
      body: t('craft_step3_body'),
    },
    {
      no: t('craft_step4_no'),
      title: t('craft_step4_title'),
      body: t('craft_step4_body'),
    },
  ]

  return (
    <section className="craft section" id="craft">
      <MasonryDivider />
      <div className="wrap">
        <div className="craft__head">
          <Reveal>
            <span className="eyebrow">{t('craft_eyebrow')}</span>
            <h2 className="craft__title">
              {t('craft_title_1')} <br />
              {t('craft_title_2')} <br />
              <em>{t('craft_title_3')}</em> {t('craft_title_4')}
            </h2>
          </Reveal>
          <Reveal className="craft__head-note">
            <p>
              {t('craft_head_note')}
            </p>
          </Reveal>
        </div>

        <ol className="craft__steps">
          {stepsData.map((s) => (
            <Reveal as="li" className="craft__step" key={s.no}>
              <span className="craft__no">{s.no}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
