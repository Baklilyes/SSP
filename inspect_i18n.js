const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Find language dictionary or loader
const langMatches = [...src.matchAll(/(?:languages|locales|translations|inLanguage)/gi)];
console.log('Lang occurrences:', langMatches.length);

// Let's search for the list of languages in the topbar or dropdown
const langListMatch = src.match(/\[\s*\{\s*code:\s*["'][a-z\-]+["']/i) || src.match(/\["en",\s*"es"/);
console.log('Lang list match:', langListMatch ? langListMatch[0] : 'not found');

// Let's search for function S( or translation lookup
const sFn = src.match(/function\s+S\s*\([^)]*\)\s*\{[^}]*\}/);
console.log('Translation function S:', sFn ? sFn[0] : 'not found');
