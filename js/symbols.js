// symbols.js — Deterministic symbol selection engine
// Responsibility: select tasseography symbols from repo data. Nothing else.
// See STEEP-BUILD-DOC.md Section 7 for the full mapping table.

var SYMBOL_TABLE = [
  { name: 'ACORN',    icon: '\uD83C\uDF30', meaning: 'Unexpected gold, windfall',       test: function(d) { return d.stars && d.age_days && (d.stars / Math.max(d.age_days, 1)) > 0.5; }, trigger: function(d) { return 'Stars-to-age ratio is high (' + d.stars + ' stars in ' + d.age_days + ' days).'; } },
  { name: 'ANCHOR',   icon: '\u2693',        meaning: 'Stability, steadfastness',        test: function(d) { return d.age_days > 180 && d.recent_commits && d.recent_commits.length > 10; }, trigger: function(d) { return 'Consistent commit frequency over 6+ months.'; } },
  { name: 'APPLE',    icon: '\uD83C\uDF4E',  meaning: 'Good knowledge, achievement',     test: function(d) { return d.readme_length && d.readme_length > 500; }, trigger: function(d) { return 'README is ' + d.readme_length + ' characters.'; } },
  { name: 'BIRD',     icon: '\uD83D\uDC26',  meaning: 'Good news, messages arriving',    test: function(d) { return d.days_since_push !== undefined && d.days_since_push <= 7; }, trigger: function(d) { return 'Pushed within the last 7 days.'; } },
  { name: 'CAT',      icon: '\uD83D\uDC08',  meaning: 'A deceitful friend, treachery',   test: function(d) { return d.has_old_deps; }, trigger: function(d) { return 'Dependencies not updated in 2+ years.'; } },
  { name: 'CROSS',    icon: '\u271D',         meaning: 'Trials and suffering',            test: function(d) { return d.open_issues > 20; }, trigger: function(d) { return d.open_issues + ' open issues.'; } },
  { name: 'GRIM',     icon: '\uD83D\uDC80',  meaning: 'Danger, death approaches',        test: function(d) { return d.days_since_push !== undefined && d.days_since_push > 180; }, trigger: function(d) { return 'No commits in ' + d.days_since_push + ' days.'; } },
  { name: 'HEART',    icon: '\u2665',         meaning: 'Love, passion, devotion',         test: function(d) { return d.contributors === 1 && d.total_commits > 50; }, trigger: function(d) { return 'Single contributor with ' + d.total_commits + ' commits.'; } },
  { name: 'KITE',     icon: '\uD83E\uDE81',  meaning: 'Wishes coming true',              test: function(d) { return d.has_roadmap; }, trigger: function(d) { return 'Roadmap or TODO file detected.'; } },
  { name: 'MOON',     icon: '\uD83C\uDF19',  meaning: 'Hidden things, mystery',          test: function(d) { return d.has_env_example && d.has_env_file; }, trigger: function(d) { return '.env.example AND .env both in file tree.'; } },
  { name: 'MOUNTAIN', icon: '\u26F0',         meaning: 'A great journey',                 test: function(d) { return d.total_commits > 100; }, trigger: function(d) { return d.total_commits + '+ commits in repo lifetime.'; } },
  { name: 'SKULL',    icon: '\u2620',         meaning: 'Danger in your path',             test: function(d) { return !d.has_license; }, trigger: function(d) { return 'No LICENSE file detected.'; } },
  { name: 'SNAKE',    icon: '\uD83D\uDC0D',  meaning: 'Enemy, falsehood, deception',     test: function(d) { return d.lazy_commit_pct > 50; }, trigger: function(d) { return Math.round(d.lazy_commit_pct) + '% of recent commits are single-word messages.'; } },
  { name: 'SPADE',    icon: '\u2660',         meaning: 'Good fortune, hard work',         test: function(d) { return d.has_ci; }, trigger: function(d) { return 'CI/CD configuration detected.'; } },
  { name: 'SUN',      icon: '\u2600',         meaning: 'Great happiness, success',        test: function(d) { return d.has_tests; }, trigger: function(d) { return 'Test directory or test files found.'; } },
  { name: 'SWORD',    icon: '\u2694',         meaning: 'Conflict, arguments',             test: function(d) { return d.merge_commit_pct > 30; }, trigger: function(d) { return Math.round(d.merge_commit_pct) + '% merge commits in recent history.'; } },
  { name: 'TREE',     icon: '\uD83C\uDF33',  meaning: 'Growth, branching paths',         test: function(d) { return d.branch_count > 5; }, trigger: function(d) { return d.branch_count + ' active branches.'; } }
];

// Teacup is ALWAYS present
var TEACUP = { name: 'TEACUP', icon: '\uD83E\uDED6', meaning: 'The vessel speaks', trigger: 'Every reading begins and ends with the vessel. Without the Teacup, there are no leaves to read.' };

// Bird is the fallback if fewer than 3 symbols match
var BIRD_FALLBACK = SYMBOL_TABLE.filter(function(s) { return s.name === 'BIRD'; })[0];

/**
 * selectSymbols(repoData)
 * @param {object} repoData - parsed GitHub data with computed flags
 * @returns {Array} - 3-5 symbol objects with {name, icon, meaning, trigger}
 */
function selectSymbols(repoData) {
  var matched = [];

  SYMBOL_TABLE.forEach(function(sym) {
    try {
      if (sym.test(repoData)) {
        matched.push({
          name: sym.name,
          icon: sym.icon,
          meaning: sym.meaning,
          trigger: sym.trigger(repoData)
        });
      }
    } catch(e) {
      // Skip symbols that can't evaluate (missing data)
    }
  });

  // Sort by drama: GRIM, SKULL, SNAKE first (most dramatic), then others
  var dramaOrder = ['GRIM', 'SKULL', 'SNAKE', 'CROSS', 'SWORD', 'MOON', 'HEART', 'MOUNTAIN', 'SUN', 'SPADE', 'APPLE', 'ANCHOR', 'BIRD', 'KITE', 'ACORN', 'CAT', 'TREE'];
  matched.sort(function(a, b) {
    return dramaOrder.indexOf(a.name) - dramaOrder.indexOf(b.name);
  });

  // Take top 4
  matched = matched.slice(0, 4);

  // If fewer than 3, add Bird
  if (matched.length < 3 && BIRD_FALLBACK) {
    matched.push({
      name: BIRD_FALLBACK.name,
      icon: BIRD_FALLBACK.icon,
      meaning: BIRD_FALLBACK.meaning,
      trigger: 'Default symbol (fewer than 3 triggers matched).'
    });
  }

  // Always add Teacup
  matched.push(TEACUP);

  return matched;
}

// Node.js compatibility — does not affect browser behavior
if (typeof module !== 'undefined') {
  module.exports = { selectSymbols: selectSymbols, SYMBOL_TABLE: SYMBOL_TABLE, TEACUP: TEACUP };
}
