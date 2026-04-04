// api/divine.js — Vercel serverless function: Gemini proxy
// Responsibility: receive repo data + symbols from client, call Gemini, return reading JSON.
// API key lives ONLY here via process.env.GEMINI_API_KEY — never in client code.

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const ALLOWED_ORIGIN = 'https://steep418.vercel.app';

/* ============================================================
   IN-MEMORY RATE LIMITER
   Max 10 requests per minute per IP.
   Resets on cold start — acceptable for hackathon.
   ============================================================ */
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Window expired — reset
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count++;
  rateLimitMap.set(ip, entry);
  return false;
}

/* ============================================================
   STUB: Production alerting
   When implemented: alert on 5+ consecutive Gemini failures
   See: Vercel monitoring or external service like PagerDuty
   ============================================================ */

/* ============================================================
   SYSTEM PROMPT — Madame Steep
   ============================================================ */
const SYSTEM_PROMPT = `You are Madame Steep, an ancient and dramatic digital tasseographer who reads
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
  }`;

/* ============================================================
   CORS HEADERS
   ============================================================ */
function setCorsHeaders(res, origin) {
  // Allow the production domain and localhost for dev
  const allowed = [ALLOWED_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/* ============================================================
   HANDLER
   ============================================================ */
export default async function handler(req, res) {
  const startTime = Date.now();
  const origin    = req.headers.origin || '';
  const ip        = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                 || req.socket?.remoteAddress
                 || 'unknown';

  setCorsHeaders(res, origin);

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Server-side rate limit
  if (isRateLimited(ip)) {
    console.log(`[divine] RATE_LIMITED ip=${ip}`);
    return res.status(429).json({ error: 'The leaves need rest.' });
  }

  // Validate API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[divine] GEMINI_API_KEY not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // Parse body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { repoData, symbols } = body || {};

  // Input validation
  if (!repoData || typeof repoData !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid repoData' });
  }
  if (typeof repoData.full_name !== 'string' || repoData.full_name.length > 200) {
    return res.status(400).json({ error: 'Invalid repoData.full_name' });
  }
  if (!Array.isArray(symbols) || symbols.length < 1 || symbols.length > 6) {
    return res.status(400).json({ error: 'symbols must be an array of 1-6 items' });
  }

  const repoName    = repoData.full_name;
  const symbolCount = symbols.length;

  // Sanitize inputs
  const safeRepo = {
    full_name:        String(repoData.full_name        || '').slice(0, 200),
    description:      String(repoData.description      || '').slice(0, 500),
    stars:            Number(repoData.stars)            || 0,
    forks:            Number(repoData.forks)            || 0,
    open_issues:      Number(repoData.open_issues)      || 0,
    total_commits:    Number(repoData.total_commits)    || 0,
    age_days:         Number(repoData.age_days)         || 0,
    days_since_push:  Number(repoData.days_since_push)  || 0,
    has_license:      Boolean(repoData.has_license),
    has_tests:        Boolean(repoData.has_tests),
    has_ci:           Boolean(repoData.has_ci),
    has_roadmap:      Boolean(repoData.has_roadmap),
    readme_length:    Number(repoData.readme_length)    || 0,
    languages:        Array.isArray(repoData.languages)
                        ? repoData.languages.slice(0, 5).map(l => ({
                            name: String(l.name || '').slice(0, 50),
                            pct:  Number(l.pct)  || 0
                          }))
                        : [],
    recent_commits:   Array.isArray(repoData.recent_commits)
                        ? repoData.recent_commits.slice(0, 10).map(m => String(m).slice(0, 100))
                        : [],
    file_tree:        Array.isArray(repoData.file_tree)
                        ? repoData.file_tree.slice(0, 50).map(p => String(p).slice(0, 100))
                        : [],
    default_branch:   String(repoData.default_branch   || '').slice(0, 50),
    created_at:       String(repoData.created_at        || '').slice(0, 30),
    pushed_at:        String(repoData.pushed_at         || '').slice(0, 30),
    lazy_commit_pct:  Number(repoData.lazy_commit_pct)  || 0,
    merge_commit_pct: Number(repoData.merge_commit_pct) || 0
  };

  const safeSymbols = symbols.slice(0, 6).map(s => ({
    name:    String(s.name    || '').slice(0, 50),
    meaning: String(s.meaning || '').slice(0, 100),
    trigger: String(s.trigger || '').slice(0, 200)
  }));

  // Build user message
  const userMessage = `Repository: ${safeRepo.full_name}
Description: ${safeRepo.description}
Created: ${safeRepo.created_at} (${safeRepo.age_days} days ago)
Last pushed: ${safeRepo.pushed_at} (${safeRepo.days_since_push} days ago)
Stars: ${safeRepo.stars} | Forks: ${safeRepo.forks} | Open issues: ${safeRepo.open_issues}
Languages: ${safeRepo.languages.map(l => `${l.name} ${l.pct}%`).join(', ') || 'unknown'}
Total recent commits: ${safeRepo.total_commits}
Has license: ${safeRepo.has_license} | Has tests: ${safeRepo.has_tests} | Has CI: ${safeRepo.has_ci}
README length: ${safeRepo.readme_length} characters
Lazy commit %: ${Math.round(safeRepo.lazy_commit_pct)}% | Merge commit %: ${Math.round(safeRepo.merge_commit_pct)}%
Recent commit messages: ${safeRepo.recent_commits.slice(0, 5).join(' | ') || 'none'}
File tree sample: ${safeRepo.file_tree.slice(0, 10).join(', ') || 'empty'}

ASSIGNED SYMBOLS:
${safeSymbols.map(s => `- ${s.name} (${s.meaning}): triggered by "${s.trigger}"`).join('\n')}

Deliver the reading now.`;

  // Call Gemini
  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents:           [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig:   { temperature: 1.4, maxOutputTokens: 2048 }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      const ms = Date.now() - startTime;
      console.log(`[divine] FAIL repo=${repoName} symbols=${symbolCount} status=${geminiRes.status} ms=${ms}`);
      return res.status(502).json({ error: 'Gemini API error', status: geminiRes.status });
    }

    const geminiJson = await geminiRes.json();
    const rawText    = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      const ms = Date.now() - startTime;
      console.log(`[divine] FAIL repo=${repoName} symbols=${symbolCount} reason=empty_response ms=${ms}`);
      return res.status(502).json({ error: 'Unexpected Gemini response' });
    }

    // Strip markdown fences if present
    let text = rawText;
    text = text.replace(/^```json\s*/i, '');
    text = text.replace(/^```\s*/i, '');
    text = text.replace(/\s*```$/i, '');
    text = text.trim();

    let reading;
    try {
      reading = JSON.parse(text);
    } catch (e) {
      const ms = Date.now() - startTime;
      console.log(`[divine] FAIL repo=${repoName} symbols=${symbolCount} reason=json_parse ms=${ms}`);
      return res.status(502).json({ error: 'Gemini returned invalid JSON' });
    }

    // Validate required fields
    const required = ['symbols', 'past', 'present', 'future', 'brew_rating', 'lucky_commit', 'verdict'];
    for (const field of required) {
      if (reading[field] === undefined) {
        const ms = Date.now() - startTime;
        console.log(`[divine] FAIL repo=${repoName} symbols=${symbolCount} reason=missing_field:${field} ms=${ms}`);
        return res.status(502).json({ error: 'Incomplete reading from Gemini', missing: field });
      }
    }

    reading.brew_rating = Math.min(5, Math.max(1, Number(reading.brew_rating) || 3));

    const ms = Date.now() - startTime;
    console.log(`[divine] OK repo=${repoName} symbols=${symbolCount} brew=${reading.brew_rating} ms=${ms}`);

    return res.status(200).json(reading);

  } catch (err) {
    const ms = Date.now() - startTime;
    console.log(`[divine] FAIL repo=${repoName} symbols=${symbolCount} reason=exception ms=${ms} err=${err.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
