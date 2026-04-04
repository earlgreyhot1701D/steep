// api/divine.js — Vercel serverless function: Gemini proxy
// Responsibility: receive repo data + symbols from client, call Gemini, return reading JSON.
// API key lives ONLY here via process.env.GEMINI_API_KEY — never in client code.

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // Parse and validate request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { repoData, symbols } = body || {};

  if (!repoData || !symbols || !Array.isArray(symbols)) {
    return res.status(400).json({ error: 'Missing repoData or symbols' });
  }

  // Sanitize: only pass the fields Gemini needs — no raw user input
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
                        ? repoData.languages.slice(0, 5).map(function(l) {
                            return { name: String(l.name || '').slice(0, 50), pct: Number(l.pct) || 0 };
                          })
                        : [],
    recent_commits:   Array.isArray(repoData.recent_commits)
                        ? repoData.recent_commits.slice(0, 10).map(function(m) {
                            return String(m).slice(0, 100);
                          })
                        : [],
    file_tree:        Array.isArray(repoData.file_tree)
                        ? repoData.file_tree.slice(0, 50).map(function(p) {
                            return String(p).slice(0, 100);
                          })
                        : [],
    default_branch:   String(repoData.default_branch   || '').slice(0, 50),
    created_at:       String(repoData.created_at        || '').slice(0, 30),
    pushed_at:        String(repoData.pushed_at         || '').slice(0, 30),
    lazy_commit_pct:  Number(repoData.lazy_commit_pct)  || 0,
    merge_commit_pct: Number(repoData.merge_commit_pct) || 0
  };

  const safeSymbols = symbols.slice(0, 5).map(function(s) {
    return {
      name:    String(s.name    || '').slice(0, 50),
      meaning: String(s.meaning || '').slice(0, 100),
      trigger: String(s.trigger || '').slice(0, 200)
    };
  });

  // Build the user message
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature:     1.0,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini error:', geminiRes.status, errText);
      return res.status(502).json({ error: 'Gemini API error', status: geminiRes.status });
    }

    const geminiJson = await geminiRes.json();

    // Extract the text content from Gemini's response structure
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(geminiJson));
      return res.status(502).json({ error: 'Unexpected Gemini response' });
    }

    // Parse and validate the reading JSON
    let reading;
    try {
      reading = JSON.parse(rawText);
    } catch (e) {
      // Gemini sometimes wraps JSON in markdown fences — strip them
      const stripped = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      try {
        reading = JSON.parse(stripped);
      } catch (e2) {
        console.error('Could not parse Gemini JSON:', rawText.slice(0, 200));
        return res.status(502).json({ error: 'Gemini returned invalid JSON' });
      }
    }

    // Validate required fields
    const required = ['symbols', 'past', 'present', 'future', 'brew_rating', 'lucky_commit', 'verdict'];
    for (const field of required) {
      if (reading[field] === undefined) {
        console.error('Missing field in Gemini response:', field);
        return res.status(502).json({ error: 'Incomplete reading from Gemini', missing: field });
      }
    }

    // Clamp brew_rating to 1-5
    reading.brew_rating = Math.min(5, Math.max(1, Number(reading.brew_rating) || 3));

    return res.status(200).json(reading);

  } catch (err) {
    console.error('divine handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
