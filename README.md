# AIGen — AI Generator SaaS Demo

A vanilla HTML/CSS/JavaScript demo showcasing a complete SaaS shell for an AI generation product. Built without frameworks, build steps, or external dependencies (other than Inter font and the picsum.photos placeholder image CDN). Demonstrates a public marketing surface, role-routed authentication, and two distinct dashboard experiences (admin operations, customer workspace).

## Demo Credentials

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| Admin | `admin@gmail.com` | `admin123` | Admin Dashboard |
| Customer | `customer@gmail.com` | `admin123` | Customer Dashboard |

Authentication is hardcoded (sessionStorage-backed) for demo purposes. Logging out from either dashboard clears the session and returns the user to the public landing page.

## How to Run

**Option A — Open directly (no server)**

Double-click `index.html`. The demo runs entirely client-side. Some browsers may block `picsum.photos` requests on `file://` due to CORS or mixed-content rules; if you see an empty gallery, use Option B.

**Option B — Static server (recommended)**

Any static file server works. From the project root:

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve -l 8080

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## Demo Walkthrough

1. **Land** — open `index.html`. Scroll the page to see the hero, feature trio, three pricing tiers (Free / Pro highlighted / Studio), and the masonry gallery. Keep scrolling — new sample cards load automatically (random video/image type tags from `picsum.photos`).
2. **Sign in** — click "Sign in" in the topbar. On the login page, click either demo-account chip to autofill credentials, or type them manually. Click "Sign in".
3. **As Admin** — sidebar swaps Main → Analysis → Order → Setting without reloading. Try the Order panel's filter pills (All / Paid / Pending / Refunded) and the Settings tabs (General / Branding / API & Webhooks).
4. **As Customer** — log out, sign in with the customer credentials. On the Video Generator panel, click "Generate video" — a shimmer card appears, then resolves into a new entry at the top of the grid. Watch the credit counter in the topbar drop by 10. Switch to Image Generator and try a batch of 2 or 4 to see multiple cards generate at once. The Settings tab shows Profile / Plan (with usage bars) / Billing (with mock invoices).

## Pages

### Desktop

| Path | Purpose |
|------|---------|
| `index.html` | Public landing — hero, feature grid, pricing tiers, infinite-scroll gallery |
| `login.html` | Auth gate — role-routes to admin or customer dashboard on success |
| `admin.html` | Admin dashboard — Main / Analysis / Order / Setting panels (sidebar-switched, no reload) |
| `customer.html` | Customer dashboard — Video Generator / Image Generator / Setting panels |

### Mobile (`/mobile/`)

| Path | Purpose |
|------|---------|
| `mobile/index.html` | Mobile landing — vertical hero + scroll-snap pricing carousel + 2-col masonry gallery |
| `mobile/login.html` | Mobile auth — full-screen card with orb-lit gradient background + tap demo chips |
| `mobile/admin.html` | Mobile admin — 4-tab bar (Main / Analyze / Orders / Me), table-as-cards, compact charts |
| `mobile/customer.html` | Mobile customer — 5-tab bar with center Create FAB + bottom-sheet generator modal |

The mobile pages use **Design 1 — Bottom Tab Bar with Center FAB** (Pika / Instagram / TikTok native register). They are NOT responsive variants of the desktop pages — they are separate files with their own HTML/CSS/JS for cleaner architecture and a more native-app feel.

## Device Routing

`assets/js/device-route.js` is loaded synchronously in the `<head>` of every page (desktop and mobile). On load:

1. **Auto-detect** — if no override is set and the device is mobile (`max-width: 768px` OR mobile UA string), redirect from desktop route to `/mobile/<page>`
2. **Override wins** — if the user explicitly chose a view (via the switch link), `localStorage.aigen.viewOverride` is set to `mobile` or `desktop` and the auto-detect is skipped. Choice persists across sessions.
3. **Switch links**:
   - Desktop pages: "View on mobile →" link in footer / sidebar
   - Mobile pages: "View desktop site →" button in the Me tab / footer
4. **Public API** — `window.AIGenView.switchToMobile()`, `switchToDesktop()`, `clearOverride()`, `getOverride()` for programmatic switching

## Project Structure

```
Project AI Generator/
├── index.html                  ← Desktop landing
├── login.html                  ← Desktop auth gate
├── admin.html                  ← Desktop admin shell
├── customer.html               ← Desktop customer shell
├── mobile/
│   ├── index.html              ← Mobile landing
│   ├── login.html              ← Mobile auth
│   ├── admin.html              ← Mobile admin (4-tab bar)
│   └── customer.html           ← Mobile customer (5-tab bar + FAB)
├── assets/
│   ├── css/
│   │   ├── base.css            ← Design tokens, reset, utilities
│   │   ├── landing.css         ← Desktop landing styles
│   │   ├── auth.css            ← Desktop login glass card
│   │   ├── dashboard.css       ← Desktop sidebar/topbar/panel chrome
│   │   ├── admin.css           ← Desktop admin panel content
│   │   ├── customer.css        ← Desktop customer panel content
│   │   ├── mobile-base.css     ← Mobile tokens, safe-area insets, native typography
│   │   ├── mobile-shell.css    ← Mobile top bar + bottom tab bar + sheet modal
│   │   ├── mobile-landing.css  ← Mobile landing
│   │   ├── mobile-auth.css     ← Mobile auth
│   │   ├── mobile-admin.css    ← Mobile admin
│   │   └── mobile-customer.css ← Mobile customer
│   └── js/
│       ├── auth.js             ← Shared by desktop + mobile (hardcoded creds, role guards)
│       ├── device-route.js     ← Auto-redirect with localStorage override (loaded by all pages)
│       ├── landing.js          ← Desktop landing
│       ├── admin.js            ← Desktop admin
│       ├── customer.js         ← Desktop customer
│       ├── mobile-landing.js   ← Mobile landing
│       ├── mobile-admin.js     ← Mobile admin (tab nav + mobile renderers)
│       └── mobile-customer.js  ← Mobile customer (5-tab + Create FAB sheet)
└── README.md
```

## Visual System

- **Theme**: Dark base (`#0A0A0F`) with elevated surfaces and a violet → fuchsia signature gradient (`#8B5CF6` → `#EC4899`). Cyan accent (`#22D3EE`) for highlights.
- **Typography**: Inter (Google Fonts) with system fallback (`-apple-system`, `Segoe UI`, `Roboto`).
- **Surfaces**: Glass cards (subtle background, blurred backdrop, hairline borders) for depth without heavy shadows.
- **Motion**: 200ms ease-out for hovers, 400ms cubic-bezier spring for panel transitions.
- **Layout**: 4px spacing grid; soft 8/12px radii; pill (`999px`) for status badges.

## What's Mocked

This is a UI-only demo — no real backend, no real AI generation, no payment processing. Specifically:

- **Auth** — credentials are hardcoded in `assets/js/auth.js`. Session stored in `sessionStorage` (cleared on browser close).
- **Generation** — clicking "Generate" shows a 1.5s loading shimmer then prepends a placeholder card from `picsum.photos`. Credit counter is purely cosmetic.
- **Charts** — admin analytics are CSS bar charts and SVG donut, hand-built without a chart library.
- **Tables** — orders and recent activity are static mock data rendered from JS arrays.

## Browser Support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari — last 2 versions). The demo uses `IntersectionObserver`, CSS `backdrop-filter`, and CSS custom properties; no polyfills shipped.

## Customizing

- **Brand colors** — edit `--accent-violet`, `--accent-fuchsia`, `--accent-cyan`, and `--gradient-primary` in `assets/css/base.css`. The whole app re-skins automatically.
- **Demo accounts** — edit the `CREDENTIALS` array at the top of `assets/js/auth.js`. Add roles to `ROLE_REDIRECTS` if you introduce new dashboard pages.
- **Pricing tiers** — landing prices are hardcoded in `index.html` (search for `pricing-card`). The Pro card has class `pricing-card-featured` for the highlighted treatment.
- **Mock data** — admin tables (stats, activity, orders, top creators, charts) live as plain arrays at the top of `assets/js/admin.js`. Customer seed grids are at the top of `assets/js/customer.js`.

## License

Demo / prototype. Not for production use.
