const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const m = src.match(/function\s+AS\s*\([^)]*\)\s*\{/);
if (m) {
  console.log('Found AS at:', m.index);
  console.log(src.substring(m.index, m.index + 1200));
}

const m2 = src.match(/function\s+CS\s*\([^)]*\)\s*\{/);
if (m2) {
  console.log('Found CS at:', m2.index);
  console.log(src.substring(m2.index, m2.index + 1200));
}
