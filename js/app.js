// app.js — View state machine, event handlers, crash screen, carousel boot
// Responsibility: show/hide panes, wire buttons, load showcase data.
// Does NOT render readings or manage grimoire — that's reading.js.

/* ============================================================
   INLINE SHOWCASE DATA (fallback for file:// protocol)
   fetch() fails on local files due to CORS.
   This data mirrors data/showcase.json exactly.
   ============================================================ */
var INLINE_SHOWCASE = [
  {
    "repo": "torvalds/linux",
    "symbols": [
      { "name": "MOUNTAIN", "icon": "\u26F0", "meaning": "A great journey", "trigger": "1,247,000+ commits across the repo's lifetime." },
      { "name": "ANCHOR", "icon": "\u2693", "meaning": "Stability, steadfastness", "trigger": "Consistent commit frequency spanning 19 years." },
      { "name": "SUN", "icon": "\u2600", "meaning": "Great happiness, success", "trigger": "Test directory detected. The rarest blessing." },
      { "name": "TEACUP", "icon": "\uD83E\uDED6", "meaning": "The vessel speaks", "trigger": "Always present. Meta-symbol." }
    ],
    "past": "The leaves part to reveal a creation date that predates most of your dependencies' grandparents. Born in April 2005, this repository drew its first breath in C and never looked back. That certainty is either wisdom or hubris. The leaves cannot tell the difference.",
    "present": "1,247,000 commits. The file tree is not a tree. It is a forest that has achieved sentience. 65.2% C, 18.7% Assembly. Your MAINTAINERS file alone is 736,000 lines. That is not a file. That is a census. The Sun symbol burns bright: you have tests. So many tests.",
    "future": "This repository will outlive the servers it runs on, the developers who maintain it, and very possibly the concept of version control itself. Archaeologists will study your git log the way we study the Rosetta Stone. They will not understand the merge conflicts. Nobody does.",
    "brew_rating": 5,
    "verdict": "The mountain does not ask for applause. It simply endures.",
    "lucky_commit": "refactor: taught the kernel to dream",
    "snippet": "33 years of commits. A file tree that resembles less a repository and more a geological formation..."
  },
  {
    "repo": "facebook/react",
    "symbols": [
      { "name": "SWORD", "icon": "\u2694", "meaning": "Conflict", "trigger": "30%+ merge commits in recent history." },
      { "name": "TREE", "icon": "\uD83C\uDF33", "meaning": "Branching paths", "trigger": "5+ active branches detected." },
      { "name": "SPADE", "icon": "\u2660", "meaning": "Hard work ahead", "trigger": "CI/CD pipeline detected." },
      { "name": "TEACUP", "icon": "\uD83E\uDED6", "meaning": "The vessel speaks", "trigger": "Always present. Meta-symbol." }
    ],
    "past": "Born of a Facebook hackathon in 2013, React arrived with the confidence of someone who has never been told no. It rewrote the rules of the DOM and then rewrote those rules again. The Sword was present from the beginning. It has never left.",
    "present": "34% of recent commits are merge conflicts resolved. The Tree branches in seventeen directions simultaneously. Everyone has opinions. The CI pipeline runs 847 checks. It is unclear what 600 of them do. The leaves see this and nod knowingly.",
    "future": "React will continue to exist in a state of perpetual reinvention. The next major version will break something you depend on. You will migrate. You will say it was worth it. The leaves are not sure you are telling the truth.",
    "brew_rating": 4,
    "verdict": "Everyone has opinions about your branches.",
    "lucky_commit": "fix: stop the bleeding (for now)",
    "snippet": "Merge conflicts in the leaves. So many. The Sword reveals itself in 34% of recent history..."
  },
  {
    "repo": "danielmiessler/SecLists",
    "symbols": [
      { "name": "MOUNTAIN", "icon": "\u26F0", "meaning": "A great journey", "trigger": "100+ commits across the repo's lifetime." },
      { "name": "SKULL", "icon": "\uD83D\uDC80", "meaning": "Danger lurks", "trigger": "No LICENSE file detected." },
      { "name": "KITE", "icon": "\uD83E\uDE81", "meaning": "Wishes and ambition", "trigger": "Roadmap file detected." },
      { "name": "TEACUP", "icon": "\uD83E\uDED6", "meaning": "The vessel speaks", "trigger": "Always present. Meta-symbol." }
    ],
    "past": "A repository born not from code but from obsession. Someone decided to collect every password, every username, every fuzzing string ever conceived by the security community. They did not stop. They have not stopped. The Mountain was inevitable.",
    "present": "The leaves see no code. Only lists. Thousands of lists. Text files arranged with the obsessive precision of a librarian who has seen too much. The Skull warns: no license. The Kite dreams of a roadmap that will never be finished. The collection grows.",
    "future": "SecLists will continue to grow until it contains every possible string that has ever been typed by a human being. At that point it will become a mirror. You will look into it and see yourself. The leaves advise against this.",
    "brew_rating": 4,
    "verdict": "The leaves see no code. Only lists. Thousands of lists.",
    "lucky_commit": "add: 847 new passwords nobody should be using",
    "snippet": "A repository of pure text files arranged with the obsessive precision of a librarian who has seen too much..."
  },
  {
    "repo": "earlgreyhot1701D/memoria-clew",
    "symbols": [
      { "name": "HEART", "icon": "\u2665", "meaning": "Devotion", "trigger": "Solo contributor, 100+ commits." },
      { "name": "SNAKE", "icon": "\uD83D\uDC0D", "meaning": "Deception stirs", "trigger": "50%+ lazy commit messages detected." },
      { "name": "APPLE", "icon": "\uD83C\uDF4E", "meaning": "Knowledge sought", "trigger": "README exceeds 500 characters." },
      { "name": "TEACUP", "icon": "\uD83E\uDED6", "meaning": "The vessel speaks", "trigger": "Always present. Meta-symbol." }
    ],
    "past": "One person. One vision. 87 commits spanning the better part of a year. The Heart reveals itself immediately \u2014 this is a labor of love, the kind that gets started at 2am and committed to at 3am with messages like 'wip' and 'finally'. The leaves recognize this energy.",
    "present": "The Snake stirs in the commit history. 'fix', 'update', 'stuff', 'asdfgh'. The Apple glows: the README is thoughtful, detailed, written by someone who cares. The contradiction is the reading. You know what this is. You just haven't told anyone else yet.",
    "future": "This repository will either become something remarkable or remain a beautiful secret. The leaves see both futures with equal clarity. The Heart is strong. The Snake is patient. The outcome depends entirely on whether you push to main this weekend.",
    "brew_rating": 3,
    "verdict": "A labor of love with commit messages that would make a mystic weep.",
    "lucky_commit": "wip: it's almost working i think",
    "snippet": "One contributor. 87 commits. The Heart reveals itself. But child, the Snake also stirs..."
  },
  {
    "repo": "cursed-dev/abandoned-todo",
    "symbols": [
      { "name": "GRIM", "icon": "\uD83D\uDC80", "meaning": "The end approaches", "trigger": "No commits in 6+ months." },
      { "name": "SKULL", "icon": "\u2620", "meaning": "Danger", "trigger": "No LICENSE file detected." },
      { "name": "SNAKE", "icon": "\uD83D\uDC0D", "meaning": "Deception", "trigger": "Lazy commit messages throughout." },
      { "name": "TEACUP", "icon": "\uD83E\uDED6", "meaning": "The vessel speaks", "trigger": "Always present. Meta-symbol." }
    ],
    "past": "It began with ambition. A todo app. Simple. Clean. 'This time I'll finish it,' you said. The first commit was 'initial commit'. The second was 'add basic structure'. The third was 'fix bug'. The leaves have seen this before. They have seen it many times.",
    "present": "Last commit: 847 days ago. Message: 'final fix'. It was not, in fact, final. The Grim reaper stands at the edge of the file tree. The Skull marks the absence of a license \u2014 not because you forgot, but because you stopped caring before you got there. The Snake coils through every commit message.",
    "future": "This repository will not be updated. You know this. The leaves know this. The README still says 'coming soon'. It is not coming soon. It is not coming at all. The leaves suggest you either delete it or add a single commit that says 'abandoned with love'. Either is honest.",
    "brew_rating": 1,
    "verdict": "This repo died as it lived: without documentation.",
    "lucky_commit": "final fix",
    "snippet": "Last commit: 847 days ago. Message: 'final fix'. It was not, in fact, final..."
  }
];

/* ============================================================
   CRASH SCREEN
   ============================================================ */
(function () {
  var crash = document.getElementById('crash-screen');
  var app   = document.getElementById('app');

  function skipCrash() {
    crash.classList.add('skip');
    crash.style.display = 'none';
    app.style.animation = 'none';
    app.style.opacity   = '1';
    document.removeEventListener('keydown', skipCrash);
    crash.removeEventListener('click', skipCrash);
  }

  document.addEventListener('keydown', skipCrash);
  crash.addEventListener('click', skipCrash);
  document.getElementById('crash-skip').addEventListener('click', function (e) {
    e.stopPropagation();
    skipCrash();
  });
})();

/* ============================================================
   VIEW STATE MACHINE
   Pane names: 'cards' | 'loading' | 'reading' | '418' | 'grimoire'
   ============================================================ */
var PANES = ['cards', 'loading', 'reading', '418', 'grimoire'];

function showPane(name) {
  PANES.forEach(function (p) {
    var el = document.getElementById('pane-' + p);
    if (el) el.hidden = (p !== name);
  });
}

/* ============================================================
   LOADING MESSAGES
   ============================================================ */
var LOADING_MSGS = [
  'The leaves are settling...',
  'Consulting the grimoire...',
  'The kettle whispers...',
  'Steeping your sins...',
  'Reading the commit entrails...'
];
var _msgIdx      = 0;
var _msgInterval = null;

function startLoadingMessages() {
  _msgIdx = 0;
  var el = document.getElementById('loading-msg');
  if (el) el.textContent = LOADING_MSGS[0];
  _msgInterval = setInterval(function () {
    _msgIdx = (_msgIdx + 1) % LOADING_MSGS.length;
    var el = document.getElementById('loading-msg');
    if (el) el.textContent = LOADING_MSGS[_msgIdx];
  }, 2000);
}

function stopLoadingMessages() {
  if (_msgInterval) { clearInterval(_msgInterval); _msgInterval = null; }
}

/* ============================================================
   CAROUSEL — card construction
   Data comes from showcase.json (static, no API calls).
   ============================================================ */
var showcaseData = [];

function ratingPotsApp(n) {
  var s = '';
  for (var i = 0; i < n; i++) s += '🫖';
  return s;
}

function buildCard(reading) {
  var card = document.createElement('div');
  card.className = 'preview-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', 'Reading for ' + reading.repo);

  // Repo name
  var repo = document.createElement('div');
  repo.className = 'pc-repo';
  repo.textContent = reading.repo;
  card.appendChild(repo);

  // Symbol tags — stacked icon + name with tooltip
  var syms = document.createElement('div');
  syms.className = 'pc-syms';
  reading.symbols.forEach(function (s) {
    var wrap = document.createElement('div');
    wrap.className = 'sym-wrap';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', s.name + ': ' + s.meaning);

    var icon = document.createElement('div');
    icon.className = 'pc-sym-icon';
    icon.textContent = s.icon;

    var label = document.createElement('div');
    label.className = 'pc-sym-name';
    label.textContent = s.name;

    var tip = document.createElement('span');
    tip.className = 'sym-tooltip';
    tip.textContent = s.meaning;

    wrap.appendChild(icon);
    wrap.appendChild(label);
    wrap.appendChild(tip);
    syms.appendChild(wrap);
  });
  card.appendChild(syms);

  // Verdict
  var verdict = document.createElement('div');
  verdict.className = 'pc-verdict';
  verdict.textContent = reading.verdict;
  card.appendChild(verdict);

  // Snippet
  var snippet = document.createElement('div');
  snippet.className = 'pc-snippet';
  snippet.textContent = reading.snippet;
  card.appendChild(snippet);

  // Rating
  var rating = document.createElement('div');
  rating.className = 'pc-rating';
  rating.textContent = ratingPotsApp(reading.brew_rating);
  card.appendChild(rating);

  // Expand button (decorative — whole card is clickable)
  var expand = document.createElement('button');
  expand.className = 'pc-expand';
  expand.setAttribute('tabindex', '-1');
  expand.setAttribute('aria-hidden', 'true');
  expand.textContent = 'READ FULL READING →';
  card.appendChild(expand);

  function openReading() {
    renderReading(reading);   // reading.js
    showPane('reading');
  }
  card.addEventListener('click', openReading);
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReading(); }
  });

  return card;
}

function renderCarousel(data) {
  var carousel = document.getElementById('carousel');
  carousel.innerHTML = '';
  data.forEach(function (reading) {
    carousel.appendChild(buildCard(reading));
  });
}

/* ============================================================
   DIVINE BUTTON — security guards
   1. _requestInFlight: blocks double requests
   2. _clientLeaves: client-side rate limit counter (resets hourly)
   3. setDivineEnabled(): single place to enable/disable the button
   ============================================================ */
var _requestInFlight = false;
var _clientLeaves    = 60;
var _leafResetTimer  = null;

function setDivineEnabled(enabled) {
  var btn = document.getElementById('divine-btn');
  if (!btn) return;
  btn.disabled = !enabled;
  btn.style.opacity = enabled ? '1' : '0.4';
  btn.style.cursor  = enabled ? 'pointer' : 'not-allowed';
}

function decrementClientLeaves() {
  _clientLeaves = Math.max(0, _clientLeaves - 1);
  updateNeonBar(_clientLeaves, 60);
  if (_clientLeaves <= 0) {
    setDivineEnabled(false);
    // Reset after 60 minutes
    if (_leafResetTimer) clearTimeout(_leafResetTimer);
    _leafResetTimer = setTimeout(function () {
      _clientLeaves = 60;
      updateNeonBar(60, 60);
      setDivineEnabled(true);
    }, 60 * 60 * 1000);
  }
}

/* ============================================================
   NEON BAR — rate limit display
   Updated after each GitHub API call and on client decrement.
   ============================================================ */
function updateNeonBar(remaining, limit) {
  var bar = document.getElementById('neon-bar');
  if (!bar) return;
  var lim = limit || 60;

  if (remaining <= 0) {
    bar.textContent = 'THE LEAVES HAVE GONE SILENT. RETURN WHEN THE HOUR TURNS. 0 / ' + lim;
    bar.classList.add('neon-bar--exhausted');
  } else {
    var mood = remaining > 30 ? 'THE LEAVES GROW WEARY' : 'THE LEAVES TREMBLE';
    bar.textContent = 'LEAVES REMAINING: ' + remaining + ' / ' + lim + ' \u2022 ' + mood;
    bar.classList.remove('neon-bar--exhausted');
  }
}

/* ============================================================
   DIVINE BUTTON — Block 2: real GitHub API fetch
   Flow: parseRepoUrl → fetchRepoData → selectSymbols → renderReading
   Gemini call (Block 4) will replace the mock reading below.
   ============================================================ */
document.getElementById('divine-btn').addEventListener('click', function () {
  // Guard 1: no double requests
  if (_requestInFlight) return;

  // Guard 2: client-side rate limit
  if (_clientLeaves <= 0) {
    updateNeonBar(0, 60);
    return;
  }

  var val = document.getElementById('repo-input').value.trim();
  if (!val) return;

  // Guard 3: input length cap — no GitHub URL is 200+ chars
  if (val.length > 200) {
    showPane('418');
    return;
  }

  // Guard 4: parse and validate URL — github.js
  var parsed = parseRepoUrl(val);
  if (!parsed) {
    showPane('418');
    return;
  }

  // Lock the button and mark request in flight
  _requestInFlight = true;
  setDivineEnabled(false);
  decrementClientLeaves();

  showPane('loading');
  startLoadingMessages();

  // Fetch real repo data — github.js
  fetchRepoData(parsed.owner, parsed.repo)
    .then(function (data) {
      stopLoadingMessages();
      _requestInFlight = false;

      // Sync neon bar with real GitHub rate limit if available
      if (data.rate_remaining !== null && data.rate_remaining !== undefined) {
        _clientLeaves = data.rate_remaining;
        updateNeonBar(data.rate_remaining, data.rate_limit || 60);
      }

      // Re-enable button unless truly exhausted
      if (_clientLeaves > 0) setDivineEnabled(true);

      // Handle error states
      if (data.error === 'not_found') {
        showPane('418');
        return;
      }
      if (data.error === 'rate_limited') {
        _clientLeaves = 0;
        updateNeonBar(0, 60);
        setDivineEnabled(false);
        showPane('418');
        return;
      }
      if (data.error) {
        showPane('418');
        return;
      }

      // Select symbols deterministically — symbols.js
      var symbols = selectSymbols(data);

      // Call /api/divine — Gemini serverless function
      return callDivine(data, symbols)
        .then(function (reading) {
          renderReading(reading);   // reading.js
          showPane('reading');
        })
        .catch(function (err) {
          console.error('callDivine failed:', err);
          // Fallback: show mock reading if Gemini is unavailable
          var mockReading = buildMockReading(data, symbols);
          renderReading(mockReading);
          showPane('reading');
        });
    })
    .catch(function (err) {
      stopLoadingMessages();
      _requestInFlight = false;
      if (_clientLeaves > 0) setDivineEnabled(true);
      console.error('fetchRepoData failed:', err);
      showPane('418');
    });});

/**
 * callDivine(repoData, symbols)
 * POSTs to /api/divine (Gemini serverless function).
 * Returns a reading object matching the showcase.json shape.
 * Falls back to buildMockReading() if the call fails.
 */
function callDivine(repoData, symbols) {
  return fetch('/api/divine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoData: repoData, symbols: symbols })
  })
  .then(function (r) {
    if (!r.ok) throw new Error('divine API returned ' + r.status);
    return r.json();
  })
  .then(function (reading) {
    // Merge Gemini's symbol interpretations with the icon/meaning from selectSymbols
    if (Array.isArray(reading.symbols)) {
      reading.symbols = reading.symbols.map(function (gs, i) {
        var original = symbols[i] || {};
        return {
          name:           gs.name    || original.name    || '',
          icon:           original.icon    || '',
          meaning:        original.meaning || '',
          trigger:        original.trigger || '',
          interpretation: gs.interpretation || ''
        };
      });
    } else {
      reading.symbols = symbols;
    }
    reading.repo = repoData.full_name;
    return reading;
  });
}

/**
 * buildMockReading(repoData, symbols)
 * Fallback reading used when /api/divine is unavailable.
 * Constructs templated text from real repo data fields.
 */
function buildMockReading(d, symbols) {
  var age = d.age_days > 365
    ? Math.floor(d.age_days / 365) + ' years'
    : d.age_days + ' days';

  var topLang = d.languages && d.languages[0] ? d.languages[0].name : 'unknown tongues';

  var past = 'The leaves reveal a repository born ' + age + ' ago, speaking primarily in '
    + topLang + '. It has ' + d.total_commits + ' commits in recent memory, '
    + 'and ' + d.stars + ' stars in the sky above it.';

  var present = d.description && d.description !== '(no description)'
    ? 'The vessel describes itself: \u201C' + d.description + '\u201D. '
    : 'The vessel offers no description of itself. The leaves find this suspicious. ';
  present += d.has_tests
    ? 'Tests have been written. The Sun symbol does not lie.'
    : 'No tests were found. The leaves weep quietly.';

  var future = d.days_since_push < 7
    ? 'The kettle is still warm. Someone was here recently. The leaves sense momentum.'
    : d.days_since_push > 180
    ? 'The last commit was ' + d.days_since_push + ' days ago. The leaves sense abandonment.'
    : 'The repository stirs occasionally. ' + d.open_issues + ' issues remain open, patient as stones.';

  return {
    repo:         d.full_name,
    symbols:      symbols,
    past:         past,
    present:      present,
    future:       future,
    brew_rating:  Math.min(5, Math.max(1, symbols.length)),
    verdict:      'The leaves have spoken. The rest is up to you.',
    lucky_commit: d.recent_commits && d.recent_commits[0]
      ? d.recent_commits[0].split('\n')[0].slice(0, 72)
      : 'no commits found',
    snippet:      past.slice(0, 80) + '...'
  };
}

// Enter key submits
document.getElementById('repo-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('divine-btn').click();
});

/* ============================================================
   418 TRIGGERS
   ============================================================ */
document.getElementById('real-btn').addEventListener('click', function () {
  showPane('418');
});

document.getElementById('return-btn').addEventListener('click', function () {
  showPane('cards');
});

/* ============================================================
   CAROUSEL ARROWS
   ============================================================ */
document.getElementById('car-left').addEventListener('click', function () {
  document.getElementById('carousel').scrollBy({ left: -230, behavior: 'smooth' });
});
document.getElementById('car-right').addEventListener('click', function () {
  document.getElementById('carousel').scrollBy({ left: 230, behavior: 'smooth' });
});

/* ============================================================
   GRIMOIRE PANE
   ============================================================ */
document.getElementById('grimoire-btn').addEventListener('click', function () {
  renderGrimoire(showcaseData);  // reading.js
  showPane('grimoire');
});

document.getElementById('grimoire-back').addEventListener('click', function () {
  showPane('cards');
});

/* ============================================================
   WTF TOGGLE
   ============================================================ */
document.getElementById('wtf-toggle').addEventListener('click', function () {
  var body = document.getElementById('wtf-body');
  body.hidden = !body.hidden;
  this.textContent = body.hidden ? 'WTF IS THIS?' : 'GOT IT';
});

/* ============================================================
   INIT — load showcase.json, render carousel
   ============================================================ */
// Try fetch first (works on server), fall back to inline data (works locally)
fetch('data/showcase.json')
  .then(function (r) {
    if (!r.ok) throw new Error('showcase.json fetch failed: ' + r.status);
    return r.json();
  })
  .then(function (data) {
    showcaseData = data;
    renderCarousel(data);
  })
  .catch(function (err) {
    console.warn('fetch failed (normal for file://), using inline data:', err.message);
    showcaseData = INLINE_SHOWCASE;
    renderCarousel(INLINE_SHOWCASE);
  });
