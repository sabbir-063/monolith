# MONOLITH — The Original Red Brick

MONOLITH is a bilingual, one-page luxury storefront that sells an intentionally ordinary object—a red brick—with the seriousness of a flagship product launch. It combines immersive product storytelling, a configurable reservation flow, AI-assisted ordering, analytics, and installable PWA support.

The project was created for the **Grameenphone Academy AI Bootcamp**. Its central joke is the sincerity: a hand-fired brick is presented like a fashion-house collectible, complete with a 3D studio render, engineering specifications, testimonials, a mini-game, and a polished checkout experience.

## Highlights

- **Interactive 3D product:** draggable, auto-rotating brick rendered with React Three Fiber and procedural textures.
- **Bilingual experience:** complete English and Bangla UI, including localized pricing, forms, order confirmation, and chatbot responses.
- **Premium motion:** Lenis smooth scrolling, GSAP ScrollTrigger sequences, Framer Motion transitions, and reveal-on-scroll effects.
- **Stack the Monolith:** a responsive, one-input canvas stacking game with a persistent best score.
- **Product configurator:** three finishes, quantities from 1–99, optional engraving, live preview, and automatic price calculation.
- **Reservation workflow:** validated order form, generated order ID, localized confirmation email, and order logging.
- **AI concierge:** a Groq-powered chat assistant that answers product questions and can collect and submit an order inside the conversation.
- **Analytics:** page, interaction, order, newsletter, and chat activity can be recorded in Google Sheets.
- **Newsletter:** footer waitlist form backed by a serverless endpoint.
- **Installable PWA:** offline app shell, install prompt, update prompt, maskable icons, and cached Google Fonts.
- **Accessibility:** responsive layouts, visible keyboard focus, reduced-motion support, and keyboard controls for the game.

## Product catalog

| Finish | Price per brick |
| --- | ---: |
| Classic Oxblood | ৳24,000 |
| Matte Obsidian | ৳31,000 |
| Kiln Orange | ৳38,000 |
| Optional engraving | +৳4,000 per brick |

## Tech stack

### Frontend

- React 18 and Vite 5
- Three.js, `@react-three/fiber`, and `@react-three/drei`
- GSAP and ScrollTrigger
- Lenis smooth scrolling
- Framer Motion
- Plain CSS with design tokens
- `vite-plugin-pwa` and Workbox

### Serverless integrations

- Vercel Functions for orders, chat, newsletter, and analytics
- Groq Chat Completions API for the AI concierge
- Resend for localized order-confirmation email
- Google Sheets API for operational and analytics data

## Page structure

The experience flows through these sections:

1. **Hero** — full-bleed interactive 3D brick and primary reservation CTA.
2. **Manifesto** — pinned, scroll-driven product narrative.
3. **Craftsmanship** — clay, firing, and maker-mark story.
4. **Specifications** — animated engineering-style product data.
5. **Stack Game** — optional canvas mini-game.
6. **Testimonials** — deliberately deadpan owner reviews.
7. **Configurator** — finish, quantity, engraving, price, and reservation form.
8. **Footer** — waitlist signup, language-aware animated details, and PWA installation.

The AI chat widget and PWA update prompt are available globally.

## Project structure

```text
monolith/
├── api/
│   ├── chat.js             # Groq-powered product and ordering assistant
│   ├── chat-track.js       # Chat analytics → Google Sheets
│   ├── newsletter.js       # Waitlist submissions → Google Sheets
│   ├── send-order.js       # Email confirmation + order logging
│   └── track.js            # Visitor and interaction analytics
├── public/
│   └── icons/              # PWA and Apple touch icons
├── src/
│   ├── components/         # Page sections, order modal, chat, and PWA UI
│   ├── context/
│   │   └── LanguageContext.jsx
│   ├── hooks/
│   │   └── useReducedMotion.js
│   ├── lib/
│   │   ├── googleSheets.js
│   │   └── tracker.js
│   ├── styles/             # Global styles and design tokens
│   ├── App.jsx             # App composition, scrolling, and toast state
│   ├── main.jsx            # React entry point
│   └── translations.js     # English and Bangla copy
├── index.html
├── vercel.json             # Cache and PWA response headers
└── vite.config.js          # React and PWA configuration
```

## Getting started

### Requirements

- Node.js 18 or newer
- npm
- Vercel CLI for running the serverless endpoints locally

Install dependencies:

```bash
npm install
```

For frontend-only development:

```bash
npm run dev
```

This starts Vite, normally at `http://localhost:5173`. The interface and client-side interactions work, but serverless features such as chat, order submission, analytics, and newsletter signup require the API environment.

For the complete application:

```bash
npm install --global vercel
npm run dev:vercel
```

Follow the Vercel CLI prompts on the first run. This serves both the Vite application and the `/api/*` functions.

## Environment variables

Create a local `.env` file or configure the following values in the Vercel project settings:

```dotenv
GROQ_API_KEY=
RESEND_API_KEY=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SHEET_ID=
```

| Variable | Used for |
| --- | --- |
| `GROQ_API_KEY` | AI concierge responses through Groq |
| `RESEND_API_KEY` | Order-confirmation emails |
| `GOOGLE_CLIENT_EMAIL` | Google service-account authentication |
| `GOOGLE_PRIVATE_KEY` | Google service-account authentication |
| `GOOGLE_SHEET_ID` | Orders, newsletter, interaction, and chat logs |

The Google service account must have access to the target spreadsheet. The current API functions use worksheets named **Orders**, **Contact List**, **User Behaviour Tracking**, and **User Chatting**. The two tracking endpoints create their worksheets and header rows automatically when needed; create the Orders and Contact List sheets before accepting submissions. Keep the `.env` file private and never commit real credentials.

For Resend delivery, the sender domain configured in `api/send-order.js` must be verified in the corresponding Resend account.

## Available scripts

```bash
npm run dev          # Start the Vite frontend
npm run dev:vercel   # Start frontend and Vercel Functions
npm run build        # Create a production build in dist/
npm run preview      # Preview the production frontend locally
```

## API routes

All application routes accept `POST` requests.

| Route | Purpose |
| --- | --- |
| `/api/chat` | Sends conversation history to the MONOLITH AI concierge |
| `/api/send-order` | Validates an order, emails the customer, and logs the order |
| `/api/newsletter` | Adds a validated email address to the waitlist |
| `/api/track` | Records page views and product interactions |
| `/api/chat-track` | Records user and assistant chat messages |

Order submission still succeeds if Google Sheets logging fails after the confirmation email is sent; the logging error is reported server-side.

## Production build

```bash
npm run build
npm run preview
```

The generated frontend is written to `dist/`. The PWA build includes a web app manifest and service worker.

## Deploying to Vercel

1. Push the project to a Git repository.
2. Import it into Vercel.
3. Use the detected **Vite** framework preset.
4. Confirm the build command is `npm run build` and output directory is `dist`.
5. Add all required environment variables.
6. Ensure the Google service account can edit the spreadsheet and the Resend sender domain is verified.
7. Deploy.

The included `vercel.json` sets appropriate cache headers for the service worker, web manifest, and versioned assets.

## Customization guide

- **Brand colors and typography:** `src/styles/tokens.css` and the font links in `index.html`
- **English and Bangla copy:** `src/translations.js`
- **Prices and finishes:** `src/components/Configurator.jsx` and the matching catalog in `src/components/ChatWidget.jsx`
- **AI product knowledge and ordering behavior:** `api/chat.js`
- **Order email design and sender:** `api/send-order.js`
- **3D brick, textures, lighting, and rotation:** `src/components/Brick3D.jsx`
- **Game difficulty:** `src/components/StackGame.jsx`
- **PWA metadata and caching:** `vite.config.js`

When changing prices or product options, update both the configurator and chatbot catalog so the two ordering paths remain consistent.

## Performance notes

- The 3D scene caps device pixel ratio and uses contact shadows instead of expensive real-time shadow maps.
- Procedural brick textures avoid large product-image downloads.
- Reveal animations rely on `IntersectionObserver` and transform/opacity transitions.
- The mini-game uses one device-pixel-ratio-aware canvas and pauses its animation loop while off-screen.
- Reduced-motion preferences disable or simplify non-essential animation.
- The PWA caches the app shell and Google Fonts while excluding `/api/*` from navigation fallback.

---

© 2026 MONOLITH — a satire of luxury, fired at 1000°C.
