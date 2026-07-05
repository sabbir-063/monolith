import { Stamp } from './primitives'

export default function Footer({ notify }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <h3>MONO<span style={{ color: 'var(--kiln)' }}>LITH</span></h3>
            <p>The original red brick. Singular. Eternal. Quietly heavier than everything else you own.</p>
            <div className="footer__news">
              <input type="email" placeholder="Join the waitlist" aria-label="Email address" />
              <button className="btn btn--primary" onClick={() => notify('You are on the list.')}>Notify me</button>
            </div>
          </div>

          <div className="footer__cols">
            <div className="footer__col">
              <h4>Object</h4>
              <a href="#manifesto">Manifesto</a>
              <a href="#craft">The Making</a>
              <a href="#specs">Specs</a>
              <a href="#reserve">Reserve</a>
            </div>
            <div className="footer__col">
              <h4>House</h4>
              <a href="#press">Press</a>
              <a href="#play">Play</a>
              <a href="#top">Stockists</a>
              <a href="#top">Care guide</a>
            </div>
            <div className="footer__col">
              <h4>Mark</h4>
              <Stamp />
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© MMXXVI MONOLITH — A satire of luxury, fired at 1000°C.</span>
          <span>Built for the Grameenphone Academy AI Bootcamp.</span>
        </div>
      </div>
    </footer>
  )
}
