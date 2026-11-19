const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const m = src.match(/function\s+tS\s*\([^)]*\)\s*\{/);
if (m) {
  console.log('Found tS at:', m.index);
  console.log(src.substring(m.index, m.index + 1200));
}
