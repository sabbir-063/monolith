import { Reveal, MasonryDivider } from './primitives'
import './Craftsmanship.css'

const STEPS = [
  {
    no: '01',
    title: 'Quarried',
    body: 'A single seam of river clay, aged underground for a decade, selected by hand for density and grain.',
  },
  {
    no: '02',
    title: 'Pressed',
    body: 'Compressed into the timeless 215 × 102 × 65 form. No screens. No buttons. No ports. By design.',
  },
  {
    no: '03',
    title: 'Fired',
    body: 'Twenty-six hours in the kiln at 1000°C, until the clay turns the deep oxblood red of permanence.',
  },
  {
    no: '04',
    title: 'Stamped',
    body: 'Each piece receives the MONOLITH frog — a maker’s mark pressed while the clay still breathes.',
  },
]

export default function Craftsmanship() {
  return (
    <section className="craft section" id="craft">
      <MasonryDivider />
      <div className="wrap">
        <div className="craft__head">
          <Reveal>
            <span className="eyebrow">The Making</span>
            <h2 className="craft__title">
              Four hands. <br />
              Twenty-six hours. <br />
              <em>One</em> brick.
            </h2>
          </Reveal>
          <Reveal className="craft__head-note">
            <p>
              We do not manufacture the MONOLITH. We make it — the slow way, the only way,
              the way bricks have been made since the first city stood.
            </p>
          </Reveal>
        </div>

        <ol className="craft__steps">
          {STEPS.map((s) => (
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
