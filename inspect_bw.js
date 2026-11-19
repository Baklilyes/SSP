const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const m = src.match(/function\s+bw\s*\([^)]*\)\s*\{/);
if (m) {
  console.log('Found bw at:', m.index);
  console.log(src.substring(m.index, m.index + 2000));
}
