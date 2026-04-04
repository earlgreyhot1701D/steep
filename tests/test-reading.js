// tests/test-reading.js — Unit tests for reading.js pure functions

var path = require('path');
var fs   = require('fs');

// reading.js uses browser globals — stub them for Node
global.document = {
  createElement: function(tag) {
    return {
      tag: tag, className: '', textContent: '', id: '',
      children: [], style: {},
      setAttribute: function() {},
      appendChild: function(c) { this.children.push(c); return c; },
      addEventListener: function() {}
    };
  },
  createTextNode: function(t) { return { textContent: t }; },
  getElementById:  function() { return null; }
};
global.navigator = {};
global.localStorage = (function () {
  var store = {};
  return {
    getItem:    function(k)    { return store[k] !== undefined ? store[k] : null; },
    setItem:    function(k, v) { store[k] = String(v); },
    removeItem: function(k)    { delete store[k]; },
    clear:      function()     { store = {}; }
  };
})();

eval(fs.readFileSync(path.join(__dirname, '../js/reading.js'), 'utf8'));

var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

// ── Tests ──

test('ratingPots(5) returns 5 teapot emoji', function () {
  var result = ratingPots(5);
  // Count teapot emoji (each is 2 UTF-16 code units = surrogate pair)
  var count = Array.from(result).length;
  if (count !== 5) throw new Error('Expected 5 emoji, got ' + count + ' in: ' + result);
});

test('ratingPots(0) returns empty string', function () {
  var result = ratingPots(0);
  if (result !== '') throw new Error('Expected empty string, got: ' + JSON.stringify(result));
});

test('ratingPots(1) returns 1 teapot emoji', function () {
  var result = ratingPots(1);
  var count = Array.from(result).length;
  if (count !== 1) throw new Error('Expected 1 emoji, got ' + count);
});

test('grimoire.load() returns array when localStorage is empty', function () {
  localStorage.clear();
  var result = grimoire.load();
  if (!Array.isArray(result)) throw new Error('Expected array, got: ' + typeof result);
  if (result.length !== 0) throw new Error('Expected empty array, got length: ' + result.length);
});

test('grimoire.save() persists and grimoire.load() retrieves it', function () {
  localStorage.clear();
  var fakeReading = {
    repo: 'test/repo',
    verdict: 'The leaves are confused.',
    brew_rating: 3,
    symbols: [{ name: 'TEACUP' }]
  };
  grimoire.save(fakeReading);
  var entries = grimoire.load();
  if (!Array.isArray(entries) || entries.length !== 1) throw new Error('Expected 1 entry, got: ' + entries.length);
  if (entries[0].repo !== 'test/repo') throw new Error('Wrong repo: ' + entries[0].repo);
});

test('grimoire.save() deduplicates by repo', function () {
  localStorage.clear();
  var r = { repo: 'dupe/repo', verdict: 'v1', brew_rating: 1, symbols: [] };
  grimoire.save(r);
  grimoire.save(Object.assign({}, r, { verdict: 'v2' }));
  var entries = grimoire.load();
  if (entries.length !== 1) throw new Error('Expected 1 entry after dedup, got: ' + entries.length);
  if (entries[0].verdict !== 'v2') throw new Error('Expected latest verdict "v2", got: ' + entries[0].verdict);
});

module.exports = tests;
