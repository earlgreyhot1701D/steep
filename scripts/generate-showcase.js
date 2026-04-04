#!/usr/bin/env node
// scripts/generate-showcase.js
// Generates data/showcase.json by running 5 repos through the full pipeline:
// GitHub API → selectSymbols → /api/divine (Vercel) → showcase.json
//
// Usage: node scripts/generate-showcase.js
// Requires: deployed Vercel URL set below, internet access, GitHub API (unauthenticated)

var https  = require('https');
var http   = require('http');
var fs     = require('fs');
var path   = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
var DIVINE_URL = 'https://steep418.vercel.app/api/divine';
var OUT_FILE   = path.join(__dirname, '../data/showcase.json');

// All 5 repos in order — used when no argument is passed
var ALL_REPOS = [
  'torvalds/linux',
  'facebook/react',
  'danielmiessler/SecLists',
  'earlgreyhot1701D/memoria-clew',
  'kelseyhightower/nocode'
];

// Accept a single repo as CLI argument: node generate-showcase.js facebook/react
// If no argument, run all repos (overwrites file)
var singleRepo = process.argv[2] || null;
var REPOS = singleRepo ? [singleRepo] : ALL_REPOS;
var APPEND_MODE = !!singleRepo; // append when running one at a time

// ── Load symbols.js into this scope ─────────────────────────────────────────
eval(fs.readFileSync(path.join(__dirname, '../js/symbols.js'), 'utf8'));

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function get(url) {
  return new Promise(function (resolve, reject) {
    var mod = url.startsWith('https') ? https : http;
    var req = mod.get(url, {
      headers: {
        'User-Agent': 'steep-showcase-generator/1.0',
        'Accept':     'application/vnd.github.v3+json'
      }
    }, function (res) {
      var body = '';
      res.on('data', function (c) { body += c; });
      res.on('end', function () {
        if (res.statusCode === 404) { reject({ status: 404 }); return; }
        if (res.statusCode === 403) { reject({ status: 403, message: 'Rate limited' }); return; }
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON parse failed: ' + body.slice(0, 100))); }
      });
    });
    req.on('error', reject);
  });
}

function post(url, data) {
  return new Promise(function (resolve, reject) {
    var body   = JSON.stringify(data);
    var parsed = new URL(url);
    var mod    = parsed.protocol === 'https:' ? https : http;
    var opts   = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    var req = mod.request(opts, function (res) {
      var resp = '';
      res.on('data', function (c) { resp += c; });
      res.on('end', function () {
        if (res.statusCode !== 200) {
          reject(new Error('divine returned ' + res.statusCode + ': ' + resp.slice(0, 200)));
          return;
        }
        try { resolve(JSON.parse(resp)); }
        catch (e) { reject(new Error('divine JSON parse failed: ' + resp.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── GitHub data fetch (mirrors github.js logic) ──────────────────────────────
function fetchRepoData(owner, repo) {
  var base = 'https://api.github.com/repos/' + owner + '/' + repo;
  console.log('  Fetching GitHub data...');

  return Promise.all([
    get(base),
    get(base + '/languages').catch(function () { return {}; }),
    get(base + '/commits?per_page=30').catch(function () { return []; }),
    get(base + '/git/trees/HEAD?recursive=1').catch(function () { return { tree: [] }; }),
    get(base + '/readme').catch(function () { return null; }),
    get(base + '/contributors?per_page=1&anon=true').catch(function () { return []; })
  ]).then(function (results) {
    var meta    = results[0];
    var langs   = results[1];
    var commits = Array.isArray(results[2]) ? results[2] : [];
    var tree    = (results[3] && results[3].tree) ? results[3].tree : [];
    var readme  = results[4];
    var contribs = Array.isArray(results[5]) ? results[5] : [];

    var messages    = commits.map(function (c) { return (c.commit && c.commit.message) || ''; });
    var lazyCount   = messages.filter(function (m) { return /^(fix|update|wip|stuff|test|changes?|minor|tmp|asdf)$/i.test(m.split('\n')[0].trim()); }).length;
    var mergeCount  = messages.filter(function (m) { return /^merge/i.test(m); }).length;
    var filePaths   = tree.map(function (f) { return f.path || ''; });

    var readmeLength = 0;
    if (readme && readme.content) {
      try { readmeLength = Buffer.from(readme.content, 'base64').toString('utf8').length; } catch (e) {}
    }

    var created      = new Date(meta.created_at);
    var pushed       = new Date(meta.pushed_at);
    var now          = new Date();
    var ageDays      = Math.floor((now - created) / 86400000);
    var daysSincePush = Math.floor((now - pushed) / 86400000);

    var totalBytes = 0;
    var langList   = [];
    for (var l in langs) { totalBytes += langs[l]; }
    for (var l2 in langs) {
      langList.push({ name: l2, pct: Math.round((langs[l2] / totalBytes) * 1000) / 10 });
    }
    langList.sort(function (a, b) { return b.pct - a.pct; });

    return {
      full_name:        meta.full_name,
      description:      meta.description || '(no description)',
      stars:            meta.stargazers_count,
      forks:            meta.forks_count,
      open_issues:      meta.open_issues_count,
      total_commits:    commits.length,
      contributors:     contribs.length,
      created_at:       meta.created_at,
      pushed_at:        meta.pushed_at,
      age_days:         ageDays,
      days_since_push:  daysSincePush,
      languages:        langList,
      recent_commits:   messages,
      lazy_commit_pct:  messages.length > 0 ? (lazyCount / messages.length) * 100 : 0,
      merge_commit_pct: messages.length > 0 ? (mergeCount / messages.length) * 100 : 0,
      has_license:      filePaths.some(function (p) { return /^license/i.test(p); }),
      has_ci:           filePaths.some(function (p) { return /^\.github\/workflows|^\.gitlab-ci|^\.circleci|^Jenkinsfile/i.test(p); }),
      has_tests:        filePaths.some(function (p) { return /test|spec|__tests__/i.test(p); }),
      has_roadmap:      filePaths.some(function (p) { return /roadmap|todo|wishlist/i.test(p); }),
      has_env_example:  filePaths.some(function (p) { return /\.env\.example/i.test(p); }),
      has_env_file:     filePaths.some(function (p) { return /^\.env$/i.test(p); }),
      has_old_deps:     false,
      readme_length:    readmeLength,
      file_tree:        filePaths.slice(0, 100),
      default_branch:   meta.default_branch,
      branch_count:     1
    };
  });
}

// ── Delay helper (respect rate limits) ───────────────────────────────────────
function delay(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Steep showcase generator');
  console.log('Target: ' + DIVINE_URL);
  console.log('Repos:  ' + REPOS.length + '\n');

  var results = [];

  for (var i = 0; i < REPOS.length; i++) {
    var repoSlug = REPOS[i];
    var parts    = repoSlug.split('/');
    var owner    = parts[0];
    var repo     = parts[1];

    console.log('[' + (i + 1) + '/' + REPOS.length + '] ' + repoSlug);

    try {
      // 1. Fetch GitHub data
      var repoData = await fetchRepoData(owner, repo);
      console.log('  GitHub: OK (' + repoData.age_days + ' days old, ' + repoData.stars + ' stars)');

      // 2. Select symbols
      var symbols = selectSymbols(repoData);
      console.log('  Symbols: ' + symbols.map(function (s) { return s.name; }).join(', '));

      // 3. Call /api/divine (retry up to 3 times on 429, 60s between retries)
      console.log('  Calling Madame Steep...');
      var reading;
      var maxRetries = 3;
      var attempt = 0;
      while (true) {
        try {
          reading = await post(DIVINE_URL, { repoData: repoData, symbols: symbols });
          break; // success
        } catch (e) {
          attempt++;
          if (e.message && e.message.indexOf('429') !== -1 && attempt < maxRetries) {
            console.log('  Rate limited — waiting 60s then retrying (attempt ' + attempt + '/' + maxRetries + ')...');
            await delay(60000);
          } else {
            throw e;
          }
        }
      }
      console.log('  Reading: OK — "' + reading.verdict + '"');

      // 4. Merge symbol icons/meanings back in (divine returns name+interpretation only)
      var mergedSymbols = symbols.map(function (sym, idx) {
        var geminiSym = (reading.symbols || [])[idx] || {};
        return {
          name:    sym.name,
          icon:    sym.icon,
          meaning: sym.meaning,
          trigger: sym.trigger,
          interpretation: geminiSym.interpretation || ''
        };
      });

      // 5. Build showcase entry
      results.push({
        repo:         repoData.full_name,
        symbols:      mergedSymbols,
        past:         reading.past,
        present:      reading.present,
        future:       reading.future,
        brew_rating:  reading.brew_rating,
        verdict:      reading.verdict,
        lucky_commit: reading.lucky_commit,
        snippet:      reading.present
                        ? reading.present.slice(0, 120).replace(/\s\S*$/, '') + '...'
                        : ''
      });

    } catch (err) {
      console.error('  FAILED: ' + (err.message || JSON.stringify(err)));
      console.error('  Skipping ' + repoSlug);
    }

    // Wait 10s between repos (gemini-2.5-flash allows 10 RPM)
    if (i < REPOS.length - 1) {
      console.log('  Waiting 10s...\n');
      await delay(10000);
    }
  }

  if (results.length === 0) {
    console.error('\nNo readings generated. Check your network and Vercel deployment.');
    process.exit(1);
  }

  // Append mode: merge with existing showcase.json, replacing any existing entry for the same repo
  var finalResults = results;
  if (APPEND_MODE) {
    var existing = [];
    try { existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')); } catch (e) {}
    // Remove any existing entry for repos we just generated
    var newRepos = results.map(function (r) { return r.repo; });
    existing = existing.filter(function (e) { return newRepos.indexOf(e.repo) === -1; });
    // Preserve original order: ALL_REPOS order
    finalResults = ALL_REPOS.map(function (slug) {
      return results.find(function (r) { return r.repo === slug; })
          || existing.find(function (e) { return e.repo === slug; });
    }).filter(Boolean);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(finalResults, null, 2));
  console.log('\nWrote ' + finalResults.length + ' readings to ' + OUT_FILE);
  if (APPEND_MODE) {
    var remaining = ALL_REPOS.filter(function (r) {
      return !finalResults.find(function (e) { return e.repo === r; });
    });
    if (remaining.length > 0) {
      console.log('Still needed: ' + remaining.join(', '));
    } else {
      console.log('All 5 repos complete. Commit data/showcase.json to finish Block 6.');
    }
  } else {
    console.log('Done. Commit data/showcase.json to complete Block 6.');
  }
}

main().catch(function (err) {
  console.error('Fatal:', err);
  process.exit(1);
});
