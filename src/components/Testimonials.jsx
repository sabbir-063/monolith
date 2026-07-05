import { Reveal } from './primitives'
import './Testimonials.css'

const PRESS = ['ARCHITECTURAL WEEKLY', 'KILN & CO.', 'THE STILL REVIEW', 'OBJECT QUARTERLY', 'MASONRY TODAY', 'SLOW GOODS']

const QUOTES = [
  { t: 'It has never once asked me to update it. We have grown old together in silence.', a: 'A. Rahman', r: 'Owner, three years' },
  { t: 'I placed it on my desk. The room immediately felt more decisive.', a: 'L. Moreau', r: 'Collector' },
  { t: 'My phone died. My MONOLITH did not even notice.', a: 'S. Haque', r: 'Verified buyer' },
]

export default function Testimonials() {
  return (
    <section className="press section" id="press">
      <Reveal className="marquee" aria-label="As seen in">
        <div className="marquee__track">
          {[...PRESS, ...PRESS].map((p, i) => (
            <span className="marquee__item" key={i}>{p}</span>
          ))}
        </div>
      </Reveal>

      <div className="wrap">
        <Reveal>
          <span className="eyebrow">Owners speak (quietly)</span>
        </Reveal>
        <div className="press__grid">
          {QUOTES.map((q, i) => (
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
