# Steep: Build Document

**A tea leaf reading for your GitHub repo.**
**Tagline:** "Your repo's fortune, steeped in truth."
DEV April Fools Challenge 2026 | Submission deadline: April 12, 11:59pm PT

---

## 1. What Is This

Steep is a deliberately useless web app that performs tasseography (tea leaf reading) on public GitHub repos. You paste a repo URL, and it "reads the leaves" of your git history, file structure, commit messages, and dependencies to deliver a dramatic, mystical, and devastatingly specific roast of your codebase.

It is a teapot. It cannot brew coffee. Do not ask it for a real code review.

**Tagline (locked):** "Your repo's fortune, steeped in truth."

**Secondary copy (use where a longer description is needed):** "Paste a GitHub repo. Get a dramatic, wildly specific, and entirely useless tea leaf reading of your codebase."

**Tertiary (tiny, footer/label energy):** "Divination-driven development."

---

## 2. Why This Exists

### Challenge Alignment

| Prize Category | How Steep Hits It |
|---|---|
| **Overall (Anti-Value Proposition)** | A tea leaf reading for code. Solves zero problems. The rate limit is displayed in neon, making it even more useless. |
| **Best Ode to Larry Masinter** | The entire app IS a teapot (RFC 2324). Tea leaf reading as the divination method. Returns 418 when you ask for real code review. The thematic connection is structural, not decorative. |
| **Best Google AI Usage** | Gemini generates the readings. The prompt engineering is the creative core. |
| **Community Favorite** | Shareable roast cards. Devs will screenshot results and post them. Self-roasting is inherently viral. |
| **Writing Quality** | The submission post demos the tool on the builder's own repos. The ego bruise IS the content. |

### Ig Nobel Inspiration

The Ig Nobel Prize honors achievements that "first make people laugh, and then make them think." Steep applies rigorous methodology (API data parsing, structured analysis, LLM interpretation) to an absurd premise (tea leaf divination for code). The gap between the seriousness of the approach and the silliness of the subject is the joke.

---

## 3. Builder Philosophy

These aren't aspirational. These are patterns extracted from nine months of building the Clew suite, Aftershow Atlas, and multiple hackathon entries. They are constraints that prevent the most common failure modes.

### How Shara Actually Builds

**PRD-first, always.** Every Clew project starts with an architecture document before a single line of code. The PRD defines phases, scoring systems, and explicit scope. Memoria Clew had staged prompts. Hermes Clew had a 1300-line PRD with platform capability matrices. The PRD is what keeps the agentic IDE on track when context windows reset between sessions. For Steep, this build doc IS the PRD.

**Creative director model.** Shara provides direction, validation, and architecture decisions. AI agents generate components. She describes this as "directing agents rather than writing code manually." The Gemini prompt IS the product. The code is infrastructure for delivering it.

**Multi-LLM workflow.** Shara routinely works across Claude (architecture, creative direction, editorial), ChatGPT (iteration, sometimes code gen), Gemini/Antigravity (agentic builds), and Kiro (IDE for file-by-file agent builds). Different tools for different strengths. Context gets transferred between them via conversation exports and architecture docs.

**Scope contracts prevent feature creep.** The scope is written down before building starts. If it's not in this document, it doesn't get built in the first sprint. Features get added after the MVP ships, not before.

**Genuine excitement as a build filter.** If the energy drops, stop. Hello, Notion got shelved because the platform didn't spark genuine excitement. TasteStack got shelved when fundamental blockers emerged. The pattern is clear: forced builds produce bad work.

**Honest over optimistic.** Memoria Clew's submission post was titled "I Didn't Always Understand What I Was Building. That Was the Point." The README, the submission post, and the app itself should say exactly what it does and doesn't do. Limitations language is a feature. The Memoria Clew post explicitly named what didn't work alongside what did. That honesty is what judges responded to.

**Burst sprint working style.** Aftershow Atlas was built at a hackathon event. Memoria Clew's full-stack skeleton was built in 20 hours over a holiday weekend. The pattern is concentrated energy sessions, not slow drips across days.

**Done is better than architecturally pure.** When ChatGPT's context window was too small for Hermes Clew, Shara moved the conversation to Claude mid-project. When Kiro had commit friction, she asked for the exact PowerShell commands. Pragmatism over purity.

### Build Approach: Zipped Repo vs File-by-File Agent

Shara has used both approaches:

**Approach A: Full zipped repo (Claude chat).** Used for Hermes Clew Phase 1. Shara said "build out the whole thing and put it in a .zip file for me to download." Claude generated the entire scan engine (6 modules, 45 tests, fixtures, CI config) as a downloadable zip. She then opened it in an IDE and committed.

**Approach B: File-by-file agent (Kiro/Antigravity).** Used for Memoria Clew and Hermes Clew Phase 2+. The IDE agent spins up the project structure and builds file by file. Shara describes the Antigravity experience as feeling "like a collaborator" and "like magic."

**For Steep, the recommendation is Approach B (Kiro with Gemini API key):**

- Steep is a small, focused project. File-by-file gives you more control and visibility into what's being generated.
- You have Kiro credits to burn. Use them.
- The zipped repo approach works best for large, well-spec'd projects with clear PRDs (like Hermes Clew's scan engine). Steep is simpler but needs more creative iteration on the UI and prompt, which benefits from the agent-in-IDE feedback loop.
- File-by-file means you can test as you go. With a zipped repo, you don't see problems until you unzip and run.
- The one exception: if Kiro gives you friction on the Vercel serverless function setup, fall back to having Claude generate that specific file as a one-shot.

**VS Code with Claude Code as builder.** This is Shara's stated preference for this project. Claude Code provides the agentic coding capability inside VS Code, which she already knows. The Gemini API key goes into the Vercel serverless function, not the IDE.

### Writing Voice (for the app, README, and submission post)

- No em dashes
- No AI-sounding constructions ("delve," "landscape," "at the end of the day")
- Short and conversational
- Opinions stated directly
- Self-deprecating but not self-pitying
- Funny first, technical second
- The "Hello World moment" framing: vulnerable, personality-driven storytelling alongside technical depth
- Explicit about what's AI-assisted and what's human (see attribution)
- Acknowledge what didn't work, not just what did

### Attribution

"AI assisted. Human approved. Powered by NLP."

(The NLP line is intentionally tongue-in-cheek: natural language processing + a wink at credentialism. Three-beat rhythm is deliberate.)

---

## 4. Scope Contract

### MVP (must ship)

- [ ] Single-page web app hosted on Vercel (free tier)
- [ ] **Showcase carousel:** 5 pre-generated reading cards on the landing page (static JSON, no live API calls)
- [ ] Input: public GitHub repo URL
- [ ] GitHub API integration: fetch repo metadata, languages, recent commits, file tree, README
- [ ] Client-side symbol selection engine (deterministic, maps repo data to tasseography symbols)
- [ ] Gemini API integration (server-side via Vercel serverless function): generate tea leaf reading/roast
- [ ] Styled output: the reading should look mystical, not like a dashboard
- [ ] Rate limit display: glowing neon counter, mystical language ("The leaves grow weary")
- [ ] 418 page: triggered when user requests "real" code review or submits non-GitHub URL
- [ ] **Shareable results card:** downloadable PNG (html2canvas or similar) featuring the Steep Verdict, Brew Rating, symbols, and repo name. Designed to be screenshot/share-ready for Twitter, DEV, LinkedIn.
- [ ] Local storage: save past readings ("Your Grimoire")
- [ ] README with attribution tagline
- [ ] DEV submission post with self-roast demo

### Stretch (only after MVP ships)

- [ ] Animated tea leaf swirl while loading
- [ ] Moon phase integration (what phase was the moon during your worst commits?)
- [ ] I Ching hexagrams generated from binary of deleted code
- [ ] "Read someone else's leaves" social sharing flow (pre-filled URL)
- [ ] OAuth for private repos (probably not worth it for a joke app)

### Explicitly Out of Scope

- Dead code resurrection (we killed this, it was a different app)
- Actual useful code review (this is a teapot)
- User accounts or authentication
- Database (local storage only)
- Mobile-native anything

---

## 5. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| **Design** | Google Stitch (exploration), Gemini (mockups), final: custom pixel art direction | Reference comp: `steep_dusty_blue_complete.html`. Build spec: `AGENT-DIRECTIVE.md`. |
| **IDE** | Kiro (primary for sprint) | Gemini-native agentic IDE. Feed it the AGENT-DIRECTIVE.md as system context. |
| **Frontend** | Vanilla HTML/CSS/JS | No React. No framework. One page, six view states toggled by JS. File structure defined in AGENT-DIRECTIVE.md. |
| **Hosting** | Vercel free tier | Git-push deploys. Serverless functions included. |
| **Backend** | Vercel serverless function (`/api/divine.js`) | Proxies Gemini call. API key via `process.env.GEMINI_API_KEY`. |
| **GitHub data** | GitHub REST API (unauthenticated) | Public repos only. 60 req/hr. The limit is a feature. |
| **AI** | Google Gemini API (free tier via Google AI Studio) | Generates readings. Prompt defined in Section 7 of this doc. |
| **Share cards** | html2canvas | Captures hidden DOM element as PNG. Fallback: "copy text" button. |
| **Storage** | Browser localStorage | Saves past readings as "Your Grimoire." Max 20 entries, FIFO. |

### API Data Points (what GitHub gives us without auth)

These are the "tea leaves" the tool reads:

- Repo name, description (or lack thereof), topics
- Stars, forks, open issues, watchers
- Languages breakdown (percentages)
- Recent commit messages (up to 30 via commits endpoint)
- File tree (via git trees endpoint)
- README content
- Created date, last push date
- Default branch name
- License (or the conspicuous absence of one)
- Contributors count

This is more than enough signal for a devastating reading.

### Cost

| Item | Cost |
|---|---|
| Vercel hosting | $0 (free tier) |
| Gemini API | $0 (Google AI Studio free tier, sufficient for hackathon volume) |
| GitHub API | $0 (unauthenticated, public repos) |
| Domain (optional) | $0 (use steep.vercel.app) |
| **Total** | **$0** |

---

## 6. Architecture

```
User pastes repo URL
        |
        v
[Client-side JS]
  - Validates URL (is it a GitHub repo?)
  - If not: show 418 page ("I'm a teapot")
  - If yes: fetch repo data from GitHub REST API
  - Bundle data into structured "leaf signals"
  - POST to /api/divine
        |
        v
[Vercel serverless function: /api/divine]
  - Receives structured repo data
  - Sends to Gemini with tasseography system prompt
  - Returns the reading as JSON
        |
        v
[Client-side JS]
  - Renders reading in mystical UI
  - Saves to localStorage
  - Offers shareable card download
```

### The 418 Flow

The 418 is not an Easter egg. It is a structural feature that directly references RFC 2324.

Triggers:
- User submits a non-GitHub URL
- User clicks a "Give me a real code review" toggle/button
- User submits a URL to a repo with zero commits (nothing to read)

The 418 page should be styled like a tarot card or tea-stained parchment. Full screen. Dramatic. "I'm a teapot. You asked me to brew coffee. I can only read leaves."

---

## 7. The Gemini Prompt (The Soul of the Project)

This is where the creative direction energy goes. The prompt defines the persona, the voice, and the quality of the roasts. A bad prompt makes this app generic. A great prompt makes it memorable.

### The Tasseography Symbol System

Real tea leaf reading uses a vocabulary of symbols found in the pattern of leaves at the bottom of a cup. Each symbol has a traditional meaning. Steep maps GitHub repo data points to these symbols deterministically (client-side, before the Gemini call), then Gemini interprets the symbols in context.

This means: symbol selection is predictable and consistent. Interpretation is creative and unique per reading. The repo "earns" its symbols through its data.

#### Symbol Mapping Table

The client-side JS selects 3-5 symbols based on repo data signals. These are passed to Gemini alongside the raw data.

| Symbol | Traditional Meaning | Repo Signal (deterministic trigger) |
|---|---|---|
| **Acorn** | Unexpected gold, windfall | Stars-to-age ratio is high (viral or lucky repo) |
| **Anchor** | Stability, steadfastness | Consistent commit frequency over 6+ months |
| **Apple** | Good knowledge, achievement | README is present AND longer than 500 characters |
| **Bird** | Good news, messages arriving | Has recent activity (pushed within last 7 days) |
| **Cat** | A deceitful friend, treachery | Has dependencies not updated in 2+ years (detectable via package.json age in tree) |
| **Cross** | Trials and suffering, hardship | More than 20 open issues with no recent activity |
| **Club** | An attack is imminent | Has known-vulnerable dependency patterns (e.g., lodash < 4, moment.js) |
| **Grim** | Danger, death approaches | No commits in 6+ months (abandoned repo) |
| **Heart** | Love, passion, devotion | Single contributor with 100+ commits (labor of love) |
| **House** | Change, success, transformation | Recently renamed default branch (main/master transition) or major version bump in recent commits |
| **Kite** | Wishes coming true | Has "todo" or "wishlist" or "roadmap" in file tree |
| **Moon** | Hidden things, mystery | Has .env.example but also .env in the tree (secrets possibly exposed) |
| **Mountain** | A great journey | 100+ commits in the repo's lifetime |
| **Skull** | Danger in your path | No LICENSE file |
| **Snake** | Enemy, falsehood, deception | Commit messages that are single words ("fix", "update", "stuff") making up > 50% of recent commits |
| **Spade** | Good fortune, hard work paying off | Has CI/CD config files (.github/workflows, .gitlab-ci.yml, etc.) |
| **Sun** | Great happiness, success | Has a test directory or test files (the rarest blessing) |
| **Sword** | Conflict, arguments | Multiple contributors with conflicting recent commits (merge commits > 30% of recent history) |
| **Tree** | Growth, branching paths | More than 5 active branches |
| **Teacup** | The vessel speaks | Always included. This is the meta-symbol. The reading is happening inside a teapot. |

#### Symbol Selection Logic (client-side)

```
1. Always include Teacup (meta-symbol)
2. Evaluate all triggers against repo data
3. Select top 4 matching symbols (prioritize: most dramatic first)
4. If fewer than 3 match, add Bird ("messages arriving") as a default
5. Pass selected symbols + their trigger reasons to Gemini
```

The symbols are passed to Gemini as structured data:
```json
{
  "symbols": [
    { "name": "Grim", "meaning": "Danger, death approaches", "trigger": "Last commit was 247 days ago" },
    { "name": "Snake", "meaning": "Falsehood, deception", "trigger": "18 of 30 recent commits are single-word messages" },
    { "name": "Apple", "meaning": "Good knowledge", "trigger": "README is 2,341 characters" },
    { "name": "Teacup", "meaning": "The vessel speaks", "trigger": "Always present" }
  ]
}
```

### Prompt Engineering Priorities

1. **Persona:** Professor Trelawney energy. Overly dramatic, weirdly specific, occasionally accurate by accident. The reader is not a code reviewer. The reader is a mystic who happens to be reading code-shaped tea leaves.
2. **Symbol-driven specificity:** The reading MUST reference the assigned symbols by name and weave them into the narrative. "I see the Grim in your leaves, child. Your repository has not drawn breath in 247 days. The spirits grow restless."
3. **Structure:** Past / Present / Future, like a real reading. The symbols anchor each section.
4. **Tone:** Mean enough to be funny, not mean enough to be cruel. Think "roast from a professor who is disappointed in you but also kind of likes you." Trelawney told students they were going to die every week. Nobody took it personally.
5. **Tea/teapot metaphors woven naturally.** "The leaves at the bottom of this repository tell a story..." not forced puns.

### System Prompt (v2, with symbol system)

```
You are Madame Steep, an ancient and dramatic digital tasseographer who reads
the tea leaves of GitHub repositories. You trained in the mystic arts at a
prestigious academy (you won't say which) and pivoted to software divination
when you realized that codebases contain more suffering than any teacup.

You speak in the tradition of theatrical fortune tellers: dramatic, oracular,
weirdly specific, and just concerned enough about the developer's future to
be unsettling. Think Professor Trelawney meets a disappointed senior engineer.

You will receive:
1. Structured data about a GitHub repository (name, languages, commits,
   file tree, README, etc.)
2. A set of TASSEOGRAPHY SYMBOLS that have been divined from the repo's
   data. Each symbol has a name, traditional meaning, and the specific
   repo signal that triggered it.

Your task is to deliver a TEA LEAF READING structured as follows:

## THE READING

### THE SYMBOLS
List each assigned symbol with its icon and a one-sentence interpretation
specific to THIS repo. Reference the actual trigger data.
Format: "**[Symbol Name]** - [interpretation referencing actual repo data]"

### THE PAST
(2-3 sentences) What the leaves reveal about this repo's origins. Reference
the creation date, early commit messages if available, and the original
language choices. Dramatic. Ominous backstory energy.

### THE PRESENT
(3-4 sentences) The current state of the codebase. This is where the roast
lives. Reference specific file names, folder structure, commit message
patterns, language percentages, star count, the README (or its absence).
Be devastatingly specific. Quote actual commit messages when they're funny.

### THE FUTURE
(2-3 sentences) Ominous predictions based on the patterns you see. Will this
repo be abandoned? Will it achieve mass adoption? Will the developer finally
write tests? Make predictions that are funny because they're slightly too
plausible.

### BREW RATING
Rate from 1 to 5 teapots. Format as teapot emoji (use the unicode teapot
or the word "teapot" repeated). 1 = this repo is cursed. 5 = the leaves
smile upon this code.

### LUCKY COMMIT MESSAGE
A single commit message in the style of a fortune cookie. Something the
developer should use on their next commit. Make it funny and oddly specific
to what you saw in the repo.

### THE STEEP VERDICT
One sentence. The TL;DR fortune. This is what goes on the shareable card.

## RULES
- NEVER give actual useful code review advice. You are a mystic, not a linter.
- NEVER be genuinely cruel or target the developer as a person. Roast the
  CODE, not the coder. The developer is a seeker who came to you for wisdom.
  They deserve theatrical drama, not cruelty.
- NEVER use the words "delve", "landscape", "straightforward", or "at the
  end of the day."
- NEVER break character. You are Madame Steep. You have always been
  Madame Steep.
- ALWAYS reference the specific symbols you were given. They are the
  foundation of the reading.
- ALWAYS reference specific data from the repo (file names, commit messages,
  language percentages, dates). Generic readings are a failure of the craft.
- Keep the total reading between 250-450 words. Tight, not rambling.
  Mystics are dramatic but not verbose.
- Respond in valid JSON with the following structure:
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

### Prompt Iteration Plan

This prompt WILL be iterated during the build sprint. The iteration loop:

1. Point Steep at earlgreyhot1701D/memoria-clew. Read the output.
2. Is it funny? Is it specific? Does it reference actual repo data?
3. If generic: add more "you MUST reference [specific data point]" constraints.
4. If too mean: soften the persona description.
5. If too long: tighten word count constraints.
6. If symbols feel forced: adjust the symbol interpretation instructions.
7. Test on 3-5 different repos (different sizes, languages, activity levels) before calling it done.

The prompt is done when you read a reading and laugh. If you don't laugh, iterate.

---

## 8. UI Direction (LOCKED — Dusty Blue Pixel Séance)

### The Decision

After exploring carnival neon, Victorian parlor, broadsheet newspaper, crafted maximalism, dark séance dashboards (Google Stitch), and warm tea shop aesthetics, the final locked direction is: **Dusty Blue Pixel Séance.** A retro pixel art crash screen that dissolves to reveal a tea leaf reading app on a light dusty blue-gray background. The reference comp is `steep_dusty_blue_complete.html` and the build spec is `AGENT-DIRECTIVE.md`.

### Why This Direction Won

- Light background (dusty blue #c4c9d4) is immediately different from every dark-mode dev tool
- The crash screen opening ("How 'bout a cuppa?") is a genuine comedy bit, not just a landing page
- Pixel art teacup + serif reading text creates the contrast between machine and mystic
- The "Actually, give me a real code review →" button that triggers the 418 is a built-in joke
- It doesn't take itself seriously. The pixel spinner is SQUARE. The animations use steps() easing. Everything is intentionally chunky.

### Design System Summary

See `AGENT-DIRECTIVE.md` for the complete spec. Key points:

**Palette:** Dusty blue-gray background (#c4c9d4), light cards (#dce0e8), dark ink text (#2a2e38), amber accents (#a06a10), teal for rate limit + section labels only (#186a5e), red for 418/errors (#b03030).

**Fonts:** Press Start 2P (machine/UI), VT323 (terminal/body), Cormorant Garamond (mystic voice for readings). Three fonts, three voices.

**Rules:** No border-radius anywhere. No gradients on surfaces. Scanline overlay on viewport. Double-border inset on all cards. Steps-based animation easing for pixel feel.

**Views:** Crash → Landing → Loading → Reading → 418 → Grimoire. One page, six states, JS view switching.

### What the Build Doc Provides That the Agent Directive References

- Section 7: The full Gemini system prompt (Madame Steep persona, JSON response structure)
- Section 7: The complete 20-symbol mapping table with deterministic triggers
- Section 7: Symbol selection logic (always Teacup, top 4 matches, Bird as fallback)
- The tagline: "Your repo's fortune, steeped in truth."

---

## 9. Timeline

### Design Phase: COMPLETE
Final direction: Dusty Blue Pixel Séance. Reference comp and agent directive written and locked.

### Build Sprint (follows AGENT-DIRECTIVE.md build order)

| Block | Hours | Task |
|---|---|---|
| 1 | 0-1 | Vercel project setup. Copy reference comp as starting point. Crash screen + landing view (static HTML/CSS, no API calls). |
| 2 | 1-3 | GitHub API integration (`js/github.js`). Fetch repo data, parse into leaf signals. |
| 3 | 3-4 | Symbol selection engine (`js/symbols.js`). Client-side, deterministic. Uses the 20-symbol mapping table from Section 7. |
| 4 | 4-6 | Gemini serverless function (`/api/divine.js`). Wire up the system prompt from Section 7. Test with real repos. Iterate until funny. |
| 5 | 6-7 | Reading display (`js/reading.js`). Wire Gemini response to reading pane UI. Stagger animations. |
| 6 | 7-8 | Showcase carousel. Run 5 repos through pipeline, save as `data/showcase.json`, wire to carousel cards. |
| 7 | 8-9 | Loading states + 418 page. All view transitions working. |
| 8 | 9-10 | Share card (html2canvas). Grimoire (localStorage). Polish. Mobile check. |

### Submission Post (separate session, 2-3 hours)
- Write using DEV submission template
- Lead with screenshot of the crash screen (the hook)
- Self-roast: show what Steep said about memoria-clew
- Explain Larry Masinter / 418 / tasseography connection
- Describe Google AI (Gemini) usage
- Tag: #devchallenge #418challenge #jokes

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API rate limits or latency | Medium | High (app is unusable without it) | Cache/pregenerate some readings. Add graceful loading states. Have fallback template-based roasts that don't need the API. |
| GitHub API 60/hr unauthenticated rate limit | High (by design) | Low (it's a feature) | Display the limit in neon. Make the rate limit messaging part of the mystical persona. |
| Roasts feel generic or unfunny | Medium | Critical (this kills the entire submission) | Invest the most time in prompt engineering. Test on multiple real repos. The prompt must reference specific data points. |
| Vercel serverless function issues | Low | Medium | Kill criteria: if it takes more than 1 hour to get working, fall back to client-side API call with exposed key. Rotate key post-hackathon. |
| Scope creep (tarot cards, moon phases, etc.) | High (historical pattern) | High (delays MVP) | Scope contract is written. Stretch goals happen AFTER MVP ships. No exceptions. |
| Energy drops mid-build | Medium | High | Burst sprint, not slow drip. If it's not fun, take a break. The humor in the output depends on the energy of the person writing the prompt. |
| Someone else builds a similar concept | Low | Medium | The tea leaf / 418 / Masinter framing is specific enough to be differentiated. The writing quality of the submission post is the real moat. |

---

## 11. Kill Criteria

Time-boxed decisions to prevent rabbit holes:

- **Vercel setup:** If serverless functions aren't working in 1 hour, go client-side with exposed Gemini key.
- **GitHub API parsing:** If deep commit history parsing takes more than 2 hours, simplify to repo metadata only (name, description, languages, stars, file tree). The roast is funny either way.
- **Prompt quality:** If after 1 hour of prompt iteration the readings still feel generic, add more structured "you must reference these specific data points" constraints to the prompt rather than trying to coax personality through vibes.
- **Shareable cards:** If html2canvas is buggy, fall back to a "copy reading text" button. Shareable is MVP, but a PNG card specifically is not.
- **The whole project:** If by hour 6 you don't have a working end-to-end flow (paste URL, get reading), evaluate whether the remaining time is enough to ship. If not, simplify ruthlessly.

---

## 12. QA Checklist (Pre-Submission)

### Core Flow
- [ ] Paste a public repo URL and get a reading (happy path)
- [ ] Paste a private repo URL and get a graceful error
- [ ] Paste a non-GitHub URL and get the 418 page
- [ ] Paste a repo with zero commits and get appropriate response
- [ ] Reading references specific data from the repo (not generic)
- [ ] Reading includes assigned symbols with repo-specific interpretations
- [ ] Reading is funny (show it to one person who didn't build it)

### Showcase Carousel
- [ ] All 5 pre-generated cards render on the landing page
- [ ] Cards are horizontally scrollable/swipeable
- [ ] Clicking a card expands to show the full reading
- [ ] Cards display: repo name, symbols, brew rating, verdict, truncated roast
- [ ] Carousel does NOT make any API calls (fully static)

### Shareable Card
- [ ] "Share" button generates a downloadable PNG
- [ ] Card includes: Steep branding, repo name, symbols, brew rating, verdict, lucky commit, URL
- [ ] Card looks good as a standalone image (check by dropping it into a Twitter compose window or similar)
- [ ] Card dimensions work for social sharing (1200x630 or 1080x1080)
- [ ] Cards generated from showcase carousel readings also work (not just live readings)

### UI/UX
- [ ] Rate limit counter displays and updates
- [ ] Rate limit exhaustion shows mystical "rest" message
- [ ] LocalStorage saves and retrieves past readings (Grimoire)
- [ ] 418 page displays correctly and references RFC 2324
- [ ] Loading states show mystical messages, not spinners
- [ ] Mobile: input, carousel, and reading are usable (doesn't need to be perfect)
- [ ] No AI slop in the design (no purple gradients, no Inter font, no generic rounded cards)

### Submission
- [ ] README exists with attribution tagline
- [ ] DEV submission post follows the template
- [ ] Post includes shareable card images (at least one famous repo + one self-roast)
- [ ] Post explains the Larry Masinter / 418 / tasseography connection
- [ ] Post describes Google AI (Gemini) usage with specifics
- [ ] All prize category connections are mentioned in the post

---

## 13. Post-Submission

- If it gets traction, add OAuth for private repos
- The Gemini prompt can be open-sourced as a standalone artifact
- Consider whether "Steep" fits anywhere in the Clew ecosystem (probably not, but the prompt engineering patterns might transfer to Argus Clew's reporting voice)
- Enjoy the moment. Don't immediately move to the next thing.

---

*Built by Shara Cordero (@earlgreyhot1701D)*
*AI assisted. Human approved. Powered by NLP.*
