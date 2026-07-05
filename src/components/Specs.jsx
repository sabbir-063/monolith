import { Reveal, CountUp } from './primitives'
import './Specs.css'

export default function Specs() {
  return (
    <section className="specs section" id="specs">
      <div className="wrap">
        <div className="specs__head">
          <Reveal>
            <span className="eyebrow">Technical Datasheet</span>
            <h2>Specifications</h2>
          </Reveal>
          <Reveal className="specs__intro">
            <p>Every figure independently verified by no one. Because some truths are self-evident.</p>
          </Reveal>
        </div>

        <div className="specs__grid">
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={1000} suffix="°C" /></div>
            <div className="specs__label">Kiln temperature</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={2.7} decimals={1} suffix=" kg" /></div>
            <div className="specs__label">Weight, reassuring</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={0} /></div>
            <div className="specs__label">Software updates</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num">&infin;</div>
            <div className="specs__label">Battery life</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={100} suffix="%" /></div>
            <div className="specs__label">Offline, always</div>
          </Reveal>
          <Reveal className="specs__cell">
            <div className="specs__num"><CountUp to={10000} suffix=" yrs" /></div>
            <div className="specs__label">Expected lifespan</div>
          </Reveal>
        </div>

        <Reveal className="specs__table">
          <Row k="Dimensions" v="215 × 102.5 × 65 mm" />
          <Row k="Material" v="Single-seam fired river clay" />
          <Row k="Finish" v="Hand-fired oxblood, matte" />
          <Row k="Connectivity" v="None. That is the point." />
          <Row k="Water resistance" v="Survives rain. And empires." />
          <Row k="Warranty" v="Outlives the warranty department" />
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
