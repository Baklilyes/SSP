const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const m = src.match(/function\s+sS\s*\([^)]*\)\s*\{/);
if (m) {
  console.log('Found sS at:', m.index);
  console.log(src.substring(m.index, m.index + 1500));
}

const m2 = src.match(/function\s+nS\s*\([^)]*\)\s*\{/);
if (m2) {
  console.log('Found nS at:', m2.index);
  console.log(src.substring(m2.index, m2.index + 1500));
}
