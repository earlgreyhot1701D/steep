# STEEP: Agent Build Directive

**Read this file before generating any code. This is the source of truth for the UI, architecture, and constraints. If this file and your assumptions conflict, this file wins.**

---

## What This Is

Steep is a deliberately useless web app that performs tasseography (tea leaf reading) on public GitHub repos. You paste a repo URL, it reads your git history and file structure, and delivers a mystical, dramatic roast of your codebase via the Gemini API.

It is a teapot. It cannot brew coffee. Do not make it useful.

**Tagline:** "Your repo's fortune, steeped in truth."

**Reference comp:** `steep-pixel-concept-final.html` in the project root. This is the visual target. Match it.

---

## Visual Identity: Dusty Blue Pixel Séance

The aesthetic is **retro pixel art meets browser error screen on a dusty blue-gray background**. Think: a crash page from a haunted computer that turns out to be a fortune teller, rendered in the palette of a Myst inventory screen. NOT a dark-mode app. NOT a dashboard. NOT a SaaS app. NOT dark mode with purple gradients.

### The Rules

1. **No border-radius anywhere.** This is a pixel world. All corners are square. Zero exceptions.
2. **No gradients on surfaces.** Flat fills only. The only gradient allowed is the subtle divider line (`linear-gradient(to right, transparent, var(--ink-faint), transparent)`).
3. **No Inter, Roboto, Arial, or system fonts.** The font stack is specified below and is non-negotiable.
4. **Scanline overlay on the entire viewport.** A `repeating-linear-gradient` that draws faint horizontal lines every 4px. This is applied to `body::after` as a fixed overlay with `pointer-events: none` and `z-index: 100`.
5. **Double-border inset on cards.** Every card (carousel and reading pane) has an outer `border: 2px solid` and a `::before` pseudo-element that draws a 1px inner border inset 4px from each edge.
6. **The background is dusty blue (`#c4c9d4`), NOT black.** Cards and panels are lighter (`#dce0e8`). Text is dark ink (`#2a2e38`). This is a light-background pixel world.
7. **image-rendering: pixelated** on all SVG pixel art and any future sprite assets.
8. **Both teacups (crash and landing) are identical.** Same pixel art, same colors, NO cracks or red lines on either. They are the same teacup.

### Color Palette

```css
:root {
  --bg: #c4c9d4;              /* App background: dusty blue-gray */
  --ink: #2a2e38;              /* Primary text: dark ink */
  --ink-mid: #444a58;          /* Body text */
  --ink-dim: #6a7080;          /* Muted text */
  --ink-faint: #8a90a0;        /* Faintest text, hints */
  --card-bg: #dce0e8;          /* Card/panel backgrounds */
  --card-border: #a8aeb8;      /* Card borders */
  --card-inner: #c8ccd6;       /* Inner inset border */
  --input-bg: #d4d8e2;         /* Input zone background */
  --neon: #007a6a;             /* Neon accent: muted teal */
  --neon-glow: rgba(0,122,106,0.3);
  --reading-bg: #dce0e8;       /* Reading pane background */
  --reading-border: #b0b4c0;   /* Reading pane inner border */
  --amber: #a06a10;            /* Primary accent */
  --amber-bright: #c88520;     /* Hover/highlight amber */
  --amber-dim: #7a5008;        /* Dark amber for borders, shadows */
  --red: #b03030;              /* Error/418 accent */
  --teal: #186a5e;             /* Section labels in reading */
}
```

**Teal is the anachronism.** It appears ONLY on: the rate limit ticker, section labels inside the reading pane, and the 418 error code. Everything else uses ink/amber tones. Do not spread teal around.

### Typography

Three fonts. Three voices. Do not substitute.

| Font | Role | Where It Appears |
|---|---|---|
| `'Press Start 2P', monospace` | The machine. System UI. | Section labels, button text, brand title, symbol tags, brew label, crash title. Always uppercase. Always tiny (6-12px). Always with letter-spacing. |
| `'VT323', monospace` | The terminal. Readable mono. | Body text in mono contexts, input field, repo names, snippets, crash details, loading messages, rate limit ticker, footer. Size 16-20px. |
| `'Cormorant Garamond', serif` | The mystic. The voice that breaks through. | Reading text (past/present/future), verdict, card verdicts. Size 17-20px. This is where the humor lands visually: serif text inside a pixel world. |

Load via Google Fonts:
```
https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap
```

### Animations

All CSS-only. No JS animation libraries.

| Animation | Where | Spec |
|---|---|---|
| `crashSequence` | Crash screen dissolve | 5.5s total. Holds solid for 72%, then glitches (blur + translateX jitter) and fades to 0 opacity. Crash is visible for ~5 seconds. |
| `appReveal` | Main app fade-in | 1s ease, delayed 5s (synced to crash end). |
| `neonPulse` | Rate limit ticker | 3s ease-in-out infinite. Opacity oscillates 0.8-1.0, text-shadow intensifies at peak. |
| `steamRise` | Teacup steam particles | 2s ease-in-out infinite. 4 particles staggered 0.4s apart. translateY from 0 to -30px, opacity 0 → 0.6 → 0. |
| `pixelPulse` | Loading teacup | 1.5s steps(3) infinite. Scale 1 → 1.05, opacity 0.5 → 1. The `steps()` makes it chunky/pixelated. |
| `spinSquare` | Crash spinner | 0.8s steps(4) infinite rotation. Square spinner, not round. |
| `blink` | Loading text | 1.5s steps(2) infinite. Hard blink, not smooth fade. |

**Steps-based easing is critical.** Use `steps(N)` instead of `ease` or `linear` on anything that should feel pixelated (spinner, loading pulse, blink). Smooth easing is reserved for the crash dissolve, app reveal, and neon pulse only.

---

## Architecture

```
steep/
├── index.html              # Single page app, all views
├── css/
│   └── style.css           # All styles (or inline in index.html for simplicity)
├── js/
│   ├── app.js              # View management, event handlers, crash screen
│   ├── github.js           # GitHub REST API fetch + data parsing
│   ├── symbols.js          # Deterministic symbol selection engine
│   └── reading.js          # Reading display, localStorage, share card
├── api/
│   └── divine.js           # Vercel serverless function: Gemini proxy
├── data/
│   └── showcase.json       # 5 pre-generated readings (static, no API calls)
├── assets/
│   └── (pixel sprites if created)
├── steep-pixel-concept-final.html # Reference comp (do not modify)
├── AGENT-DIRECTIVE.md       # This file (do not modify)
├── vercel.json              # Vercel config
├── package.json
└── README.md
```

### Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | No React. No framework. One page, multiple views toggled by JS. |
| Hosting | Vercel free tier | Git-push deploys. |
| Backend | Vercel serverless function (`/api/divine.js`) | Proxies Gemini call. Keeps API key server-side via `process.env.GEMINI_API_KEY`. |
| GitHub data | GitHub REST API (unauthenticated) | Public repos only. 60 req/hr rate limit. The limit is a FEATURE. |
| AI | Google Gemini API (free tier via Google AI Studio) | Generates readings. Key in Vercel env vars only. |
| Share cards | html2canvas | Captures a hidden DOM element as PNG. Fallback: "copy text" button. |
| Storage | Browser localStorage | Saves past readings as "Your Grimoire." Zero cost. |

---

## Views & State Machine

The app has ONE page with SIX visual states. Only ONE pane is visible at a time (except the crash screen which overlays everything).

```
[CRASH] → dissolves after 5s (or keypress/click skip)
          ↓
[LANDING] → default state: tagline + input + carousel visible
  ├── user pastes valid GitHub URL + clicks DIVINE → [LOADING]
  ├── user pastes invalid/non-GitHub URL → [418]
  ├── user clicks "Actually, give me a real code review" → [418]
  ├── user clicks carousel card → [READING] (from pre-generated data)
  └── user opens grimoire → [GRIMOIRE]
          ↓
[LOADING] → rotating messages → API calls → [READING] or [418]
          ↓
[READING] → shows full reading with share/grimoire/back buttons
  └── "New Reading" button → [LANDING]

[418] → "I'm a Teapot" error page
  └── "Return to the Leaves" button → [LANDING]

[GRIMOIRE] → drawer/modal listing saved readings from localStorage
  └── click a reading → [READING]
```

### View Switching Logic

```js
function showPane(name) {
  // name is one of: 'cards', 'reading', 'loading', '418', 'grimoire'
  // Hide all panes, show the named one
  // 'cards' pane uses display:block/none
  // Other panes use a .show class (display:none by default, .show sets display:block)
}
```

The landing view = input zone + pane-cards visible together. When switching to reading/loading/418, hide pane-cards AND keep the input zone visible above (so users can start a new reading without going "back" first). The input zone is always visible except during the crash screen.

---

## Crash Screen Spec

**Purpose:** The "aw snap" moment. User lands on the page and sees what looks like a browser crash. After 2-3 seconds it glitches and dissolves, revealing the real app. The joke: the error WAS the app.

**Elements:**
- Pixel art broken teacup (SVG, 16x16 grid, `image-rendering: pixelated`)
- "Aw, snap!" title in Press Start 2P
- "Something went wrong while brewing this page." in VT323
- "The teapot encountered an unexpected leaf configuration." smaller, below
- Error code: `ERR_TEAPOT_418 :: STEEP_DIVINATION_FAULT` in muted teal
- Square spinner (not round, `border-radius: 0`, `steps(4)` rotation)
- "press any key to skip" hint appears after 1.5s, faded

**Skip behavior:** Any keypress or click on the skip button immediately kills the animation and reveals the app. Set `animation: none` on crash, force `opacity: 1` on app. Remove the keydown listener after first fire.

**Timing:** Crash holds solid for ~2.5s, glitches for ~1s, fully dissolved by 3.8s. App reveal animation starts at 3.8s delay.

**Return visitors:** Consider adding a localStorage flag `steep_visited` that skips the crash on subsequent visits (reduces animation to 0.5s fade). Implement this AFTER MVP.

---

## Landing View Spec

**Visual hierarchy (top to bottom):**
1. Neon rate limit ticker (full width bar, teal text with glow)
2. Pixel teacup with steam animation (centered, 200px wide)
3. "STEEP" brand title (Press Start 2P, amber, drop shadow)
4. Tagline: "A tea leaf reading for your GitHub repo." (VT323, dim)
5. Input zone: label + input field + DIVINE button
6. Showcase carousel: "FROM THE GRIMOIRE" label + horizontal card scroll

**Input field:**
- `border: 2px solid var(--pixel-amber)` wrapper containing input + button
- Input: VT323, 20px, transparent background, no border
- Button: amber background, Press Start 2P, 9px, dark text
- Placeholder: `github.com/torvalds/linux`

**Carousel:**
- Horizontal scroll, `scroll-snap-type: x mandatory`
- Hide scrollbar (`scrollbar-width: none`)
- Cards: 220px wide, `flex: 0 0 220px`
- Slight peek of next card to signal scrollability
- On hover: `translateY(-3px)` + border turns amber
- Clicking a card shows that pre-generated reading (no API call)

---

## Carousel Card Spec

Each card contains (top to bottom):
1. Repo name (VT323, 14px, dim)
2. Symbol tags (Press Start 2P, 6px, amber border + text, row of small tags)
3. Verdict (Cormorant Garamond, 17px, cream, bold)
4. Roast snippet (VT323, 16px, dim, 2-line clamp with ellipsis)
5. Brew rating (teapot emoji, amber)

**Card styling:**
- Background: `#161616`
- Outer border: `2px solid #333` (amber on hover)
- Inner border: `::before` pseudo, `1px solid #2a2a2a`, inset 4px
- No border-radius

---

## Reading Pane Spec

The full reading display. Background is `--reading-bg` (#1a1510), warmer than the app background.

**Layout (top to bottom):**
1. Repo name (VT323, centered, dim)
2. "THE READING" title (Press Start 2P, amber, centered)
3. Symbol row (icons in 36px bordered squares + names below in Press Start 2P 6px)
4. Divider
5. THE PAST section (label in Press Start 2P teal + text in Cormorant Garamond)
6. THE PRESENT section (same)
7. THE FUTURE section (same)
8. Brew rating block (bordered top/bottom, centered, teapot emoji)
9. Verdict (Cormorant Garamond, italic, amber-light, centered)
10. Lucky commit message (dashed border box, VT323 italic)
11. Action buttons: SHARE CARD | SAVE TO GRIMOIRE | NEW READING

**Stagger animation:** Each section fades in with `translateY(10px)` → `translateY(0)`, 0.8s each, staggered 0.5s apart. Use `animation-delay` on nth-child. The Past appears first, then Present, then Future. This makes the reading feel like it's being spoken.

---

## 418 Page Spec

Full-pane display (same container area as other panes, not a separate route).

**Elements:**
- Large teapot emoji (64px)
- "418: I'M A TEAPOT" in Press Start 2P, red (#e84040)
- "You asked me to brew coffee. I can only read leaves." in VT323
- "This is not a code review tool. This is a vessel of divination." smaller
- RFC reference in muted teal
- "RETURN TO THE LEAVES" button

**Triggers:**
- User submits a non-GitHub URL
- User submits a URL that doesn't resolve to a public repo (404 from GitHub API)
- User submits a repo with zero commits

---

## Loading State Spec

- Teapot emoji with `pixelPulse` animation (steps-based, chunky)
- Rotating loading messages in VT323, hard blink animation

**Loading messages (cycle every 2s):**
```
"The leaves are settling..."
"Consulting the grimoire..."
"The kettle whispers..."
"Steeping your sins..."
"Reading the commit entrails..."
```

---

## Gemini Prompt

The system prompt for Gemini is in the main build doc (`STEEP-BUILD-DOC.md`, Section 7). Copy it exactly. The prompt defines the persona "Madame Steep" and the JSON response structure.

**The Gemini call happens in `/api/divine.js` (Vercel serverless function).** It receives structured repo data + selected symbols from the client, sends them to Gemini, and returns the reading as JSON.

**Response JSON structure from Gemini:**
```json
{
  "symbols": [{"name": "...", "interpretation": "..."}],
  "past": "...",
  "present": "...",
  "future": "...",
  "brew_rating": 3,
  "lucky_commit": "...",
  "verdict": "..."
}
```

---

## Symbol Selection Engine

Client-side, deterministic. Runs BEFORE the Gemini call. See `STEEP-BUILD-DOC.md` Section 7 for the full symbol mapping table (20 symbols with trigger conditions).

**Logic:**
1. Always include Teacup (meta-symbol)
2. Evaluate all triggers against fetched repo data
3. Select top 4 matching symbols (prioritize most dramatic)
4. If fewer than 3 match, add Bird as default
5. Pass symbols + trigger reasons as structured data to `/api/divine`

---

## Shareable Card

Generated via html2canvas capturing a hidden DOM element.

**Card contains:**
- "STEEP" branding (small)
- Repo name
- Symbol tags
- Brew rating
- The verdict (large text)
- Lucky commit message
- URL: `steep.vercel.app`

**Dimensions:** 1200x630px (Twitter/LinkedIn card ratio)

**The card should carry the pixel aesthetic:** dark background, amber border, same font stack. It should look different from every other dev tool screenshot.

**Kill criteria:** If html2canvas is buggy after 1 hour, fall back to a "COPY READING" button that copies the verdict + rating + lucky commit to clipboard.

---

## localStorage (Grimoire)

**Key:** `steep_grimoire`
**Value:** JSON array of past readings

```json
[
  {
    "repo": "torvalds/linux",
    "timestamp": "2026-04-05T...",
    "verdict": "The mountain does not ask for applause.",
    "brew_rating": 5,
    "symbols": ["Mountain", "Anchor", "Sun", "Teacup"],
    "full_reading": { ... }
  }
]
```

**Max entries:** 20 (FIFO, oldest drops off)

The Grimoire is a stretch goal for MVP. The "SAVE TO GRIMOIRE" button should work, but a full Grimoire viewer UI (drawer/modal listing past readings) is post-MVP.

---

## Things You Will Be Tempted To Do. Don't.

1. **Don't add border-radius.** Not even 2px. Not even on buttons. This is a pixel world.
2. **Don't smooth out the animations.** The `steps()` easing is intentional. Chunky = pixel. Smooth = wrong world.
3. **Don't add a loading spinner that is round.** The crash screen spinner is square and rotates in 4 steps.
4. **Don't use any purple.** No purple gradients, no purple accents, no purple anything.
5. **Don't add a navbar or sidebar.** This is a single centered column. The neon bar at the top is the only persistent chrome.
6. **Don't make the reading pane background match the app background.** The reading pane is `#1a1510` (warm). The app is `#0a0a0e` (cold). The warmth is the mystic voice breaking through.
7. **Don't add a dark mode toggle.** It's already dark. There is no light mode. The teapot lives in shadow.
8. **Don't substitute fonts.** If Google Fonts fails to load, the fallback is `monospace` for the machine voices and `serif` for the mystic voice. Do not add fallback fonts like Arial or Helvetica.
9. **Don't spread teal around.** Teal is the rate limit ticker, reading section labels, and 418 error code. That's it. Adding teal to buttons, borders, or hover states dilutes the anachronism.
10. **Don't skip the crash screen.** It's not an Easter egg. It's the opening act. First-time visitors must see it.

---

## Build Order

Follow this sequence. Each block should be testable before moving to the next.

1. **Vercel project + crash screen + landing view** (static HTML/CSS, no API calls)
2. **GitHub API integration** (fetch repo data, parse into leaf signals)
3. **Symbol selection engine** (client-side, deterministic)
4. **Gemini serverless function** (`/api/divine.js`)
5. **Reading display** (wire Gemini response to reading pane UI)
6. **Showcase carousel** (run 5 repos through pipeline, save as `showcase.json`, wire to carousel)
7. **Loading states + 418 page** (all transitions working)
8. **Share card** (html2canvas capture)
9. **Grimoire** (localStorage save/retrieve)
10. **Polish** (animation timing, loading messages, mobile check)

---

*Built by Shara Cordero (@earlgreyhot1701D)*
*AI assisted. Human approved. Powered by NLP.*
