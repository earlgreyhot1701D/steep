// tests/test-github.js — Unit tests for github.js parseRepoUrl()

var path = require('path');
var fs   = require('fs');

// github.js uses fetch() which doesn't exist in Node — stub it so the file loads
global.fetch = function() { return Promise.resolve({ ok: false, json: function() { return {}; } }); };

eval(fs.readFileSync(path.join(__dirname, '../js/github.js'), 'utf8'));

var tests = [];

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

function assertParsed(input, expectedOwner, expectedRepo) {
  var result = parseRepoUrl(input);
  if (!result) throw new Error('Expected {owner, repo}, got null for input: ' + JSON.stringify(input));
  if (result.owner !== expectedOwner) throw new Error('owner: expected "' + expectedOwner + '", got "' + result.owner + '"');
  if (result.repo !== expectedRepo)   throw new Error('repo: expected "' + expectedRepo + '", got "' + result.repo + '"');
}

function assertNull(input) {
  var result = parseRepoUrl(input);
  if (result !== null) throw new Error('Expected null for input: ' + JSON.stringify(input) + ', got: ' + JSON.stringify(result));
}

// ── Tests ──

test('Short form "torvalds/linux"', function () {
  assertParsed('torvalds/linux', 'torvalds', 'linux');
});

test('Full HTTPS URL', function () {
  assertParsed('https://github.com/torvalds/linux', 'torvalds', 'linux');
});

test('URL with trailing path (tree/main)', function () {
  assertParsed('https://github.com/torvalds/linux/tree/main', 'torvalds', 'linux');
});

test('"not-a-url" returns null', function () {
  assertNull('not-a-url');
});

test('Empty string returns null', function () {
  assertNull('');
});

test('GitLab URL returns null', function () {
  assertNull('https://gitlab.com/user/repo');
});

test('500-character string returns null', function () {
  assertNull(new Array(501).join('x'));
});

module.exports = tests;
