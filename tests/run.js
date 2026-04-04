// tests/run.js — Test runner for Steep
// Usage: node tests/run.js
// Exit 0 = all pass, Exit 1 = any failure

var suites = [
  { name: 'symbols.js', file: './test-symbols' },
  { name: 'github.js',  file: './test-github'  },
  { name: 'reading.js', file: './test-reading'  }
];

var totalPass = 0;
var totalFail = 0;

suites.forEach(function (suite) {
  var tests;
  try {
    tests = require(suite.file);
  } catch (e) {
    console.error('\u274C  Could not load ' + suite.file + ': ' + e.message);
    totalFail++;
    return;
  }

  console.log('\n\u2500\u2500 ' + suite.name + ' \u2500\u2500');

  tests.forEach(function (t) {
    try {
      t.fn();
      console.log('  \u2705  ' + t.name);
      totalPass++;
    } catch (e) {
      console.log('  \u274C  ' + t.name);
      console.log('       ' + e.message);
      totalFail++;
    }
  });
});

console.log('\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
console.log('Results: ' + totalPass + ' passed, ' + totalFail + ' failed');

process.exit(totalFail > 0 ? 1 : 0);
