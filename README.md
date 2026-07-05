# MONOLITH — The Original Red Brick

A one-page luxury storefront that sells the most boring object on earth — a plain red brick — with the straightest possible face. Built for the **Grameenphone Academy AI Bootcamp**, the brief was simple: make a brick look like a must-have luxury item, and never let a 3-second attention span get bored.

The joke is the sincerity. The brick is treated like a flagship product launch crossed with a fashion house: a rotating 3D "monolith" in a kiln-lit studio, a scroll-driven manifesto, an engineering datasheet, a one-tap mini-game, and a configurator that lets you reserve your own.

---

## ✦ Features & interactive elements

The brief asked for at least one interactive element. This build ships **all three**, each mapped to a judging criterion.

| Element | What it is | Serves |
| --- | --- | --- |
| **Interactive 3D** | A draggable, auto-rotating brick rendered with react-three-fiber in a warm studio light. Drag to spin it. | *Frictionless UX* — the hero is alive but never blocks reading. |
| **Scroll transitions** | Lenis smooth scrolling + a GSAP **pinned manifesto** whose lines light up one by one as you scroll, plus reveal-on-scroll across every section. | *Fluidity* — momentum scroll + scrubbed, GPU-friendly animation. |
| **Mini-game** | *Stack the Monolith* — a one-input canvas stacking game. Tap / click / space to drop each brick; misalign the edge and the tower falls. | *Intuitive design* — one control, instant to understand, fully optional and self-contained. |

Other touches: animated spec counters, a deadpan press marquee, a finish/engraving configurator with a price reveal and a dust-burst "add to cart", a contextual toast, and a sticky nav that fades in a backdrop on scroll.

### Built-in quality floor
- **Fully responsive** down to small phones (fluid type with `clamp()`, reflowing grids).
- **Reduced motion respected** — smooth scroll, 3D auto-rotate, pinning, and the marquee all switch off when the OS asks.
- **Keyboard + focus** visible; the game responds to Space/Enter only while it's on screen.

---

## ✦ Tech stack

- **React 18 + Vite** — fast dev server, instant HMR, tiny production build.
- **three.js + @react-three/fiber + @react-three/drei** — the 3D brick (`RoundedBox`, `ContactShadows`, `OrbitControls`).
- **GSAP + ScrollTrigger** — the pinned, scrubbed manifesto.
- **Lenis** — buttery momentum scrolling (the single biggest "premium feel" win), synced to ScrollTrigger.
- **Framer Motion** — small entrance animations, button taps, and the toast.
- Plain **CSS** with a token system — no UI framework, no bloat.

---

## ✦ Architecture

```
monolith/
├─ index.html              # fonts (Bricolage Grotesque / Inter / JetBrains Mono) + root
├─ vite.config.js
├─ src/
│  ├─ main.jsx             # mounts <App>, imports tokens.css + global.css
│  ├─ App.jsx              # Lenis ⇄ GSAP sync, scrollTo(), toast state, section order
│  ├─ hooks/
│  │  └─ useReducedMotion.js
│  ├─ styles/
│  │  ├─ tokens.css        # palette + type scale (change the brand look here)
│  │  └─ global.css        # reset, nav, footer, buttons, stamp, masonry, toast, reveal
│  └─ components/
│     ├─ primitives.jsx    # Reveal, CountUp, Stamp, MasonryDivider (shared)
│     ├─ Nav.jsx
│     ├─ Hero.jsx (+ .css)
│     ├─ Brick3D.jsx       # the react-three-fiber scene
│     ├─ Manifesto.jsx (+ .css)   # GSAP pinned scroll section
│     ├─ Craftsmanship.jsx (+ .css)
│     ├─ Specs.jsx (+ .css)       # animated datasheet
│     ├─ StackGame.jsx (+ .css)   # the canvas mini-game
│     ├─ Testimonials.jsx (+ .css)
│     ├─ Configurator.jsx (+ .css)
│     └─ Footer.jsx
```

**How the scroll engine works:** `App.jsx` creates one `Lenis` instance and drives it from GSAP's ticker, while forwarding Lenis scroll events to `ScrollTrigger.update()`. That single integration makes every scroll-triggered animation (the pinned manifesto, the reveals) run on the same smoothed scroll position — which is what keeps it from feeling laggy or double-tracked. A `scrollTo()` helper is passed to the nav and hero so anchor clicks glide instead of jumping. When reduced motion is on, Lenis never starts and the page falls back to native scroll.

**Styling:** design decisions live in `src/styles/tokens.css`. Component styles are co-located (e.g. `Hero.jsx` ↔ `Hero.css`) so each section is self-contained. The palette is drawn from the brick's own world — fired clay, oxblood body, kiln-orange heat, bone-white limewash — paired with Bricolage Grotesque (a display grotesque whose name literally nods to construction), Inter for body, and JetBrains Mono for the engineering/datasheet voice.

---

## ✦ Getting started

Requirements: **Node.js 18+** and npm.

```bash
# 1. install dependencies
npm install

# 2. start the dev server (http://localhost:5173)
npm run dev

# 3. production build
npm run build

# 4. preview the production build locally
npm run preview
```

> First run downloads the Google Fonts and the three.js/drei packages — make sure you're online for `npm install` and the first load.

---

## ✦ Deploy to Vercel

**Option A — Dashboard (no CLI):**
1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects Vite. Confirm:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Deploy.** You'll get a live URL in ~30 seconds.

**Option B — CLI:**
```bash
npm i -g vercel
vercel          # follow the prompts (accept the detected Vite settings)
vercel --prod   # promote to production
```

No environment variables are needed.

---

## ✦ Make it yours

- **Brand / colours / fonts:** edit `src/styles/tokens.css` (and the font `<link>` in `index.html`).
- **Prices, finishes, engraving cost:** `src/components/Configurator.jsx` (`FINISHES`, `ENGRAVE_COST`).
- **Specs and copy:** `src/components/Specs.jsx`, `Craftsmanship.jsx`, `Manifesto.jsx`.
- **3D brick look:** `src/components/Brick3D.jsx` (material colour, lighting, rotation speed).
- **Game difficulty:** `src/components/StackGame.jsx` (`BRICK_H`, starting `speed`, the per-drop speed bump).

---

## ✦ Notes on performance & fluidity

- 3D runs at a capped pixel ratio (`dpr={[1, 2]}`) and uses cheap soft shadows (`ContactShadows`) instead of real-time shadow maps.
- Reveals use `IntersectionObserver` + CSS transitions (transform/opacity only — GPU-composited).
- The mini-game renders to a single `<canvas>` with a device-pixel-ratio-aware backing store and a `requestAnimationFrame` loop.
- Everything heavy is gated behind `prefers-reduced-motion`.

---

*© MMXXVI MONOLITH — a satire of luxury, fired at 1000°C. Built for the Grameenphone Academy AI Bootcamp.*
