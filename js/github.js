// github.js — GitHub REST API fetch + data parsing
// Responsibility: fetch public repo data, parse into structured leaf signals. Nothing else.
// Build Rule: one file, one responsibility.

/**
 * parseRepoUrl(input)
 * Extracts owner/repo from various GitHub URL formats.
 * @param {string} input - user input
 * @returns {object|null} - {owner, repo} or null if invalid
 */
function parseRepoUrl(input) {
  if (!input) return null;
  input = input.trim().replace(/\/+$/, '');

  // Full URL: https://github.com/owner/repo or http://github.com/owner/repo
  var fullMatch = input.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.\-]+)\/([\w.\-]+)/);
  if (fullMatch) return { owner: fullMatch[1], repo: fullMatch[2] };

  // Short form: owner/repo
  var shortMatch = input.match(/^([\w.\-]+)\/([\w.\-]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };

  return null;
}

/**
 * fetchRepoData(owner, repo)
 * Fetches all data needed for a reading from the GitHub REST API.
 * Returns a structured object that symbols.js can evaluate.
 *
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<object>} - structured repo data or error object
 */
function fetchRepoData(owner, repo) {
  var base = 'https://api.github.com/repos/' + owner + '/' + repo;
  var _rateRemaining = null;
  var _rateLimit = null;

  return Promise.all([
    fetch(base).then(function(r) {
      // Capture rate limit headers from the primary request
      _rateRemaining = parseInt(r.headers.get('X-RateLimit-Remaining'), 10);
      _rateLimit     = parseInt(r.headers.get('X-RateLimit-Limit'), 10);
      if (!r.ok) throw { status: r.status };
      return r.json();
    }),
    fetch(base + '/languages').then(function(r) { return r.ok ? r.json() : {}; }),
    fetch(base + '/commits?per_page=30').then(function(r) { return r.ok ? r.json() : []; }),
    fetch(base + '/git/trees/HEAD?recursive=1').then(function(r) { return r.ok ? r.json() : { tree: [] }; }),
    fetch(base + '/readme').then(function(r) { return r.ok ? r.json() : null; }),
    fetch(base + '/contributors?per_page=1&anon=true').then(function(r) { return r.ok ? r.json() : []; })
  ]).then(function(results) {
    var meta = results[0];
    var langs = results[1];
    var commits = results[2];
    var tree = results[3].tree || [];
    var readme = results[4];
    var contribs = results[5];

    // Parse commit messages
    var messages = commits.map(function(c) { return (c.commit && c.commit.message) || ''; });
    var lazyCount = messages.filter(function(m) { return /^(fix|update|wip|stuff|test|changes?|minor|tmp|asdf)$/i.test(m.split('\n')[0].trim()); }).length;
    var mergeCount = messages.filter(function(m) { return /^merge/i.test(m); }).length;

    // File tree analysis
    var filePaths = tree.map(function(f) { return f.path || ''; });
    var hasLicense = filePaths.some(function(p) { return /^license/i.test(p); });
    var hasCI = filePaths.some(function(p) { return /^\.github\/workflows|^\.gitlab-ci|^\.circleci|^Jenkinsfile/i.test(p); });
    var hasTests = filePaths.some(function(p) { return /test|spec|__tests__/i.test(p); });
    var hasRoadmap = filePaths.some(function(p) { return /roadmap|todo|wishlist/i.test(p); });
    var hasEnvExample = filePaths.some(function(p) { return /\.env\.example/i.test(p); });
    var hasEnvFile = filePaths.some(function(p) { return /^\.env$/i.test(p); });
    var hasOldDeps = false; // STUB: would need package.json age analysis

    // Decode README for length
    var readmeLength = 0;
    if (readme && readme.content) {
      try { readmeLength = atob(readme.content).length; } catch(e) { readmeLength = 0; }
    }

    // Dates
    var created = new Date(meta.created_at);
    var pushed = new Date(meta.pushed_at);
    var now = new Date();
    var ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    var daysSincePush = Math.floor((now - pushed) / (1000 * 60 * 60 * 24));

    // Language percentages
    var totalBytes = 0;
    var langList = [];
    for (var lang in langs) { totalBytes += langs[lang]; }
    for (var lang2 in langs) {
      langList.push({ name: lang2, pct: Math.round((langs[lang2] / totalBytes) * 1000) / 10 });
    }
    langList.sort(function(a, b) { return b.pct - a.pct; });

    return {
      // Identifiers
      full_name: meta.full_name,
      description: meta.description || '(no description)',
      // Counts
      stars: meta.stargazers_count,
      forks: meta.forks_count,
      open_issues: meta.open_issues_count,
      total_commits: commits.length,
      contributors: contribs.length,
      // Dates
      created_at: meta.created_at,
      pushed_at: meta.pushed_at,
      age_days: ageDays,
      days_since_push: daysSincePush,
      // Languages
      languages: langList,
      // Commit analysis
      recent_commits: messages,
      lazy_commit_pct: messages.length > 0 ? (lazyCount / messages.length) * 100 : 0,
      merge_commit_pct: messages.length > 0 ? (mergeCount / messages.length) * 100 : 0,
      // File tree flags
      has_license: hasLicense,
      has_ci: hasCI,
      has_tests: hasTests,
      has_roadmap: hasRoadmap,
      has_env_example: hasEnvExample,
      has_env_file: hasEnvFile,
      has_old_deps: hasOldDeps,
      // README
      readme_length: readmeLength,
      // Tree (for Gemini context)
      file_tree: filePaths.slice(0, 100),
      // Default branch
      default_branch: meta.default_branch,
      branch_count: 1, // STUB: branches endpoint
      // Rate limit (for neon bar)
      rate_remaining: isNaN(_rateRemaining) ? null : _rateRemaining,
      rate_limit:     isNaN(_rateLimit)     ? null : _rateLimit
    };

  }).catch(function(err) {
    if (err && err.status === 404) return { error: 'not_found', message: 'Repository not found.' };
    if (err && err.status === 403) return { error: 'rate_limited', message: 'GitHub API rate limit hit.' };
    return { error: 'unknown', message: 'Could not fetch repo data.' };
  });
}

// Node.js compatibility — does not affect browser behavior
if (typeof module !== 'undefined') {
  module.exports = { parseRepoUrl: parseRepoUrl, fetchRepoData: fetchRepoData };
}
