import { Reveal } from './primitives'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Testimonials.css'

export default function Testimonials() {
  const { t } = useLanguage()

  const pressData = [
    t('press_item1'),
    t('press_item2'),
    t('press_item3'),
    t('press_item4'),
    t('press_item5'),
    t('press_item6'),
  ]

  const quotesData = [
    { t: t('testimonials_q1_text'), a: t('testimonials_q1_author'), r: t('testimonials_q1_role') },
    { t: t('testimonials_q2_text'), a: t('testimonials_q2_author'), r: t('testimonials_q2_role') },
    { t: t('testimonials_q3_text'), a: t('testimonials_q3_author'), r: t('testimonials_q3_role') },
  ]

  return (
    <section className="press section" id="press">
      <Reveal className="marquee" aria-label="As seen in">
        <div className="marquee__track">
          {[...pressData, ...pressData].map((p, i) => (
            <span className="marquee__item" key={i}>{p}</span>
          ))}
        </div>
      </Reveal>

      <div className="wrap">
        <Reveal>
          <span className="eyebrow">{t('testimonials_eyebrow')}</span>
        </Reveal>
        <div className="press__grid">
          {quotesData.map((q, i) => (
            <Reveal as="figure" className="press__card" key={i}>
              <blockquote>“{q.t}”</blockquote>
              <figcaption>
                <strong>{q.a}</strong>
                <span>{q.r}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
