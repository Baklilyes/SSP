const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const m = src.match(/function\s+Mw\s*\([^)]*\)\s*\{/);
if (m) {
  console.log('Found Mw at:', m.index);
  console.log(src.substring(m.index, m.index + 2000));
}
