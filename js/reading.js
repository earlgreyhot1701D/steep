// reading.js — Reading display, localStorage (grimoire save/load)
// Responsibility: render a reading object into #reading-pane; grimoire persistence.
// Does NOT manage view switching — that's app.js.

/* ============================================================
   HELPERS
   ============================================================ */

/** Safely set text on an element */
function setText(el, str) {
  el.textContent = str;
}

/** Create an element with a class and optional text */
function makeEl(tag, cls, text) {
  var node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Render N teapot emojis as text */
function ratingPots(n) {
  var s = '';
  for (var i = 0; i < n; i++) s += '🫖';
  return s;
}

/* ============================================================
   READING RENDERER
   Builds the full reading pane via DOM construction (no innerHTML
   with untrusted strings — all text set via textContent).
   ============================================================ */

/**
 * renderReading(reading)
 * Populates #reading-pane with the full reading.
 * @param {object} reading — shape matches showcase.json entries
 */
function renderReading(reading) {
  var pane = document.getElementById('reading-pane');
  pane.innerHTML = ''; // clear previous

  // ── Repo name ──
  pane.appendChild(makeEl('div', 'rp-repo', reading.repo));

  // ── Title ──
  pane.appendChild(makeEl('div', 'rp-title', 'THE LEAVES HAVE SPOKEN'));
  pane.appendChild(makeEl('div', 'rp-subtitle', 'These symbols appeared in your cup:'));

  // ── Symbol icons row ──
  var symsRow = makeEl('div', 'rp-syms');
  reading.symbols.forEach(function (s) {
    var wrap = makeEl('div', 'rp-sym');
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', s.name + ': ' + s.meaning);

    var icon = makeEl('div', 'rp-sym-icon');
    icon.textContent = s.icon;

    var name = makeEl('div', 'rp-sym-name', s.name);

    // Tooltip (hover detail)
    var detail = makeEl('div', 'sym-detail');
    var detailName = makeEl('b', null, s.name);
    var detailMeaning = makeEl('em', null, s.meaning);
    var detailTrigger = document.createTextNode(s.trigger);
    detail.appendChild(detailName);
    detail.appendChild(detailMeaning);
    detail.appendChild(detailTrigger);

    wrap.appendChild(icon);
    wrap.appendChild(name);
    wrap.appendChild(detail);
    symsRow.appendChild(wrap);
  });
  pane.appendChild(symsRow);

  // ── Symbol legend ──
  var legend = makeEl('div', 'sym-legend');
  legend.appendChild(makeEl('div', 'sym-legend-title', 'THE LEAVES REVEALED'));
  reading.symbols.forEach(function (s) {
    var row = makeEl('div', 'sym-legend-row');
    var ico = makeEl('div', 'sym-legend-icon');
    ico.textContent = s.icon;
    var txt = makeEl('div', 'sym-legend-text');
    var bold = makeEl('b', null, s.name);
    var trigger = makeEl('span', 'sym-legend-trigger', s.trigger);
    txt.appendChild(bold);
    txt.appendChild(document.createTextNode(' \u2014 ' + s.meaning + '. '));
    var becauseLabel = makeEl('span', 'sym-legend-because', 'Appears because: ');
    txt.appendChild(becauseLabel);
    txt.appendChild(trigger);
    row.appendChild(ico);
    row.appendChild(txt);
    legend.appendChild(row);
  });
  pane.appendChild(legend);

  // ── Divider ──
  pane.appendChild(makeEl('div', 'rp-divider'));

  // ── Past / Present / Future sections ──
  [
    { label: 'THE PAST',    text: reading.past,    cls: 'rp-section--past'    },
    { label: 'THE PRESENT', text: reading.present, cls: 'rp-section--present' },
    { label: 'THE FUTURE',  text: reading.future,  cls: 'rp-section--future'  }
  ].forEach(function (sec) {
    var section = makeEl('div', 'rp-section ' + sec.cls);
    section.appendChild(makeEl('div', 'rp-section-label', sec.label));
    section.appendChild(makeEl('div', 'rp-section-text', sec.text));
    pane.appendChild(section);
  });

  // ── Brew rating ──
  var brew = makeEl('div', 'rp-brew');
  brew.appendChild(makeEl('div', 'rp-brew-label', 'BREW RATING'));
  brew.appendChild(makeEl('div', 'rp-brew-pots', ratingPots(reading.brew_rating)));
  pane.appendChild(brew);

  // ── Verdict ──
  var verdict = makeEl('div', 'rp-verdict');
  verdict.textContent = '\u201C' + reading.verdict + '\u201D';
  pane.appendChild(verdict);

  // ── Lucky commit ──
  var lucky = makeEl('div', 'rp-lucky');
  lucky.appendChild(makeEl('div', 'rp-lucky-label', 'LUCKY COMMIT MESSAGE'));
  var luckyText = makeEl('div', 'rp-lucky-text');
  luckyText.textContent = '\u201C' + reading.lucky_commit + '\u201D';
  lucky.appendChild(luckyText);
  pane.appendChild(lucky);

  // ── Action buttons ──
  var actions = makeEl('div', 'rp-actions');

  var shareBtn = makeEl('button', 'reading-btn', 'SHARE CARD');
  shareBtn.id = 'share-btn';
  shareBtn.addEventListener('click', function () {
    populateShareCard(reading);
    shareBtn.textContent = 'GENERATING...';
    shareBtn.disabled = true;

    // Give the DOM a tick to render the hidden card before capture
    setTimeout(function () {
      var card = document.getElementById('share-card');
      if (typeof html2canvas === 'undefined' || !card) {
        // Fallback: copy text to clipboard
        copyReadingText(reading, shareBtn);
        return;
      }

      html2canvas(card, {
        width:       1200,
        height:      630,
        scale:       1,
        useCORS:     true,
        logging:     false,
        backgroundColor: '#1a1510'
      }).then(function (canvas) {
        canvas.toBlob(function (blob) {
          if (!blob) { copyReadingText(reading, shareBtn); return; }
          var url  = URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.download = 'steep-' + (reading.repo || 'reading').replace(/\//g, '-') + '.png';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          shareBtn.textContent = 'CARD SAVED \u2713';
          shareBtn.disabled = false;
        }, 'image/png');
      }).catch(function () {
        copyReadingText(reading, shareBtn);
      });
    }, 100);
  });

  var saveBtn = makeEl('button', 'reading-btn', 'SAVE TO GRIMOIRE');
  saveBtn.id = 'save-grimoire-btn';
  saveBtn.addEventListener('click', function () {
    grimoire.save(reading);
    saveBtn.textContent = 'SAVED \u2713';
    saveBtn.disabled = true;
  });

  var newBtn = makeEl('button', 'reading-btn', 'NEW READING');
  newBtn.id = 'new-reading-btn';
  newBtn.addEventListener('click', function () {
    // Delegate view switch back to app.js
    if (typeof showPane === 'function') showPane('cards');
  });

  actions.appendChild(shareBtn);
  actions.appendChild(saveBtn);
  actions.appendChild(newBtn);
  pane.appendChild(actions);
}

/* ============================================================
   GRIMOIRE — localStorage persistence
   Key: steep_grimoire
   Max: 20 entries (FIFO)
   ============================================================ */
var grimoire = (function () {
  var KEY = 'steep_grimoire';
  var MAX = 20;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function save(reading) {
    var entries = load();
    // Deduplicate by repo
    entries = entries.filter(function (e) { return e.repo !== reading.repo; });
    entries.unshift({
      repo:         reading.repo,
      timestamp:    new Date().toISOString(),
      verdict:      reading.verdict,
      brew_rating:  reading.brew_rating,
      symbols:      reading.symbols.map(function (s) { return s.name; }),
      full_reading: reading
    });
    if (entries.length > MAX) entries = entries.slice(0, MAX);
    try { localStorage.setItem(KEY, JSON.stringify(entries)); }
    catch (e) { console.warn('Grimoire: localStorage write failed', e); }
  }

  return { load: load, save: save };
})();

/* ============================================================
   GRIMOIRE RENDERER
   Renders saved entries into #grimoire-list.
   Falls back to sample entries when localStorage is empty
   so the screen is never blank during static UI phase.
   ============================================================ */

/**
 * renderGrimoire(showcaseData)
 * @param {Array} showcaseData — fallback sample readings from showcase.json
 */
function renderGrimoire(showcaseData) {
  var list = document.getElementById('grimoire-list');
  if (!list) return;

  var entries = grimoire.load();

  // Fallback: show sample entries from showcase data when grimoire is empty
  if (entries.length === 0 && showcaseData && showcaseData.length) {
    entries = [
      { repo: showcaseData[0].repo, verdict: showcaseData[0].verdict, brew_rating: showcaseData[0].brew_rating, timestamp: '2026-04-03T00:00:00Z', full_reading: showcaseData[0] },
      { repo: showcaseData[3].repo, verdict: showcaseData[3].verdict, brew_rating: showcaseData[3].brew_rating, timestamp: '2026-04-03T00:00:00Z', full_reading: showcaseData[3] },
      { repo: showcaseData[1].repo, verdict: showcaseData[1].verdict, brew_rating: showcaseData[1].brew_rating, timestamp: '2026-04-02T00:00:00Z', full_reading: showcaseData[1] }
    ];
  }

  list.innerHTML = '';

  if (entries.length === 0) {
    list.appendChild(makeEl('div', 'grimoire-empty', 'The grimoire is empty. Divine a repo to begin.'));
    return;
  }

  entries.forEach(function (entry) {
    var row = makeEl('div', 'grimoire-entry');
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', 'Open reading for ' + entry.repo);

    row.appendChild(makeEl('div', 'grimoire-repo', entry.repo));

    var verd = makeEl('div', 'grimoire-verdict');
    verd.textContent = '\u201C' + entry.verdict + '\u201D';
    row.appendChild(verd);

    var meta = makeEl('div', 'grimoire-meta');
    var rating = makeEl('span', null, ratingPots(entry.brew_rating));
    var d = new Date(entry.timestamp);
    var dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    var date = makeEl('span', null, dateStr);
    meta.appendChild(rating);
    meta.appendChild(date);
    row.appendChild(meta);

    if (entry.full_reading) {
      (function (fr) {
        function openEntry() {
          renderReading(fr);
          if (typeof showPane === 'function') showPane('reading');
        }
        row.addEventListener('click', openEntry);
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEntry(); }
        });
      })(entry.full_reading);
    }

    list.appendChild(row);
  });
}

/* ============================================================
   SHARE CARD HELPERS
   ============================================================ */

/**
 * populateShareCard(reading)
 * Fills the hidden #share-card DOM element with reading data
 * before html2canvas captures it.
 */
function populateShareCard(reading) {
  var repo    = document.getElementById('sc-repo');
  var syms    = document.getElementById('sc-symbols');
  var verdict = document.getElementById('sc-verdict');
  var rating  = document.getElementById('sc-rating');
  var commit  = document.getElementById('sc-commit');
  if (!repo) return;

  repo.textContent    = reading.repo || '';
  verdict.textContent = '\u201C' + (reading.verdict || '') + '\u201D';
  rating.textContent  = ratingPots(reading.brew_rating || 0);
  commit.textContent  = '\u201C' + (reading.lucky_commit || '') + '\u201D';

  syms.innerHTML = '';
  (reading.symbols || []).forEach(function (s) {
    var tag = document.createElement('span');
    tag.className   = 'sc-sym-tag';
    tag.textContent = (s.icon || '') + ' ' + (s.name || '');
    syms.appendChild(tag);
  });
}

/**
 * copyReadingText(reading, btn)
 * Clipboard fallback when html2canvas is unavailable.
 */
function copyReadingText(reading, btn) {
  var text = reading.repo + '\n\n'
    + '\u201C' + reading.verdict + '\u201D\n\n'
    + 'Brew rating: ' + ratingPots(reading.brew_rating) + '\n'
    + 'Lucky commit: \u201C' + reading.lucky_commit + '\u201D\n\n'
    + 'steep418.vercel.app';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = 'COPIED \u2713';
      btn.disabled    = false;
    }).catch(function () {
      btn.textContent = 'COPY FAILED';
      btn.disabled    = false;
    });
  } else {
    btn.textContent = 'COPY FAILED';
    btn.disabled    = false;
  }
}

// Node.js compatibility — does not affect browser behavior
if (typeof module !== 'undefined') {
  module.exports = { ratingPots: ratingPots, grimoire: grimoire };
}
