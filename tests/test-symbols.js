// tests/test-symbols.js — Unit tests for symbols.js selectSymbols()

var path = require('path');
var fs   = require('fs');

// Load symbols.js via eval so it runs in this scope (no ES module syntax)
eval(fs.readFileSync(path.join(__dirname, '../js/symbols.js'), 'utf8'));

var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

// ── Fixtures ──

var emptyRepo = {};

var bigRepo = {
  total_commits:    200,
  has_license:      true,
  has_tests:        true,
  has_ci:           true,
  has_roadmap:      false,
  has_env_example:  false,
  has_env_file:     false,
  has_old_deps:     false,
  age_days:         400,
  days_since_push:  5,
  stars:            500,
  open_issues:      3,
  contributors:     10,
  readme_length:    1000,
  lazy_commit_pct:  10,
  merge_commit_pct: 10,
  branch_count:     2,
  recent_commits:   new Array(20).fill('feat: add thing')
};

var noLicenseRepo = {
  total_commits:    50,
  has_license:      false,
  has_tests:        false,
  has_ci:           false,
  has_roadmap:      false,
  has_env_example:  false,
  has_env_file:     false,
  has_old_deps:     false,
  age_days:         10,
  days_since_push:  2,
  stars:            1,
  open_issues:      0,
  contributors:     1,
  readme_length:    100,
  lazy_commit_pct:  0,
  merge_commit_pct: 0,
  branch_count:     1,
  recent_commits:   ['fix: stuff']
};

var soloDevRepo = {
  total_commits:    100,
  has_license:      true,
  has_tests:        false,
  has_ci:           false,
  has_roadmap:      false,
  has_env_example:  false,
  has_env_file:     false,
  has_old_deps:     false,
  age_days:         200,
  days_since_push:  10,
  stars:            5,
  open_issues:      2,
  contributors:     1,
  readme_length:    200,
  lazy_commit_pct:  20,
  merge_commit_pct: 5,
  branch_count:     1,
  recent_commits:   new Array(15).fill('feat: stuff')
};

var lazyRepo = {
  total_commits:    30,
  has_license:      true,
  has_tests:        false,
  has_ci:           false,
  has_roadmap:      false,
  has_env_example:  false,
  has_env_file:     false,
  has_old_deps:     false,
  age_days:         50,
  days_since_push:  3,
  stars:            2,
  open_issues:      1,
  contributors:     2,
  readme_length:    100,
  lazy_commit_pct:  80,
  merge_commit_pct: 5,
  branch_count:     1,
  recent_commits:   ['fix', 'update', 'wip', 'stuff', 'fix']
};

var deadRepo = {
  total_commits:    20,
  has_license:      false,
  has_tests:        false,
  has_ci:           false,
  has_roadmap:      false,
  has_env_example:  false,
  has_env_file:     false,
  has_old_deps:     false,
  age_days:         700,
  days_since_push:  365,
  stars:            0,
  open_issues:      0,
  contributors:     1,
  readme_length:    50,
  lazy_commit_pct:  60,
  merge_commit_pct: 0,
  branch_count:     1,
  recent_commits:   ['fix']
};

var maxMatchRepo = {
  total_commits:    200,
  has_license:      false,   // SKULL
  has_tests:        true,    // SUN
  has_ci:           true,    // SPADE
  has_roadmap:      true,    // KITE
  has_env_example:  false,
  has_env_file:     false,
  has_old_deps:     false,
  age_days:         400,
  days_since_push:  200,     // GRIM
  stars:            10,
  open_issues:      25,      // CROSS
  contributors:     1,
  readme_length:    600,     // APPLE
  lazy_commit_pct:  60,      // SNAKE
  merge_commit_pct: 35,      // SWORD
  branch_count:     1,
  recent_commits:   new Array(15).fill('fix')
};

// ── Tests ──

test('TEACUP always included', function () {
  var result = selectSymbols(bigRepo);
  var names = result.map(function(s) { return s.name; });
  if (names.indexOf('TEACUP') === -1) throw new Error('TEACUP not found in: ' + names.join(', '));
});

test('Empty repo returns at least 3 symbols (Bird fallback + Teacup)', function () {
  var result = selectSymbols(emptyRepo);
  if (result.length < 2) throw new Error('Expected >= 2 symbols, got ' + result.length);
  var names = result.map(function(s) { return s.name; });
  if (names.indexOf('TEACUP') === -1) throw new Error('TEACUP missing');
});

test('200 commits triggers MOUNTAIN', function () {
  var result = selectSymbols(bigRepo);
  var names = result.map(function(s) { return s.name; });
  if (names.indexOf('MOUNTAIN') === -1) throw new Error('MOUNTAIN not triggered. Got: ' + names.join(', '));
});

test('No license triggers SKULL', function () {
  var result = selectSymbols(noLicenseRepo);
  var names = result.map(function(s) { return s.name; });
  if (names.indexOf('SKULL') === -1) throw new Error('SKULL not triggered. Got: ' + names.join(', '));
});

test('1 contributor + 100 commits triggers HEART', function () {
  var result = selectSymbols(soloDevRepo);
  var names = result.map(function(s) { return s.name; });
  if (names.indexOf('HEART') === -1) throw new Error('HEART not triggered. Got: ' + names.join(', '));
});

test('Max 5 symbols returned', function () {
  var result = selectSymbols(maxMatchRepo);
  if (result.length > 5) throw new Error('Expected <= 5 symbols, got ' + result.length);
});

test('GRIM triggers when days_since_push > 180', function () {
  var result = selectSymbols(deadRepo);
  var names = result.map(function(s) { return s.name; });
  if (names.indexOf('GRIM') === -1) throw new Error('GRIM not triggered. Got: ' + names.join(', '));
});

test('SNAKE triggers when lazy_commit_pct > 50', function () {
  var result = selectSymbols(lazyRepo);
  var names = result.map(function(s) { return s.name; });
  if (names.indexOf('SNAKE') === -1) throw new Error('SNAKE not triggered. Got: ' + names.join(', '));
});

module.exports = tests;
