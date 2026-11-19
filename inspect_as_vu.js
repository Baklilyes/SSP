const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const m = src.match(/function\s+aS\s*\([^)]*\)\s*\{/);
if (m) {
  console.log('Found aS at:', m.index);
  console.log(src.substring(m.index, m.index + 2000));
}

const m2 = src.match(/function\s+Vu\s*\([^)]*\)\s*\{/);
if (m2) {
  console.log('Found Vu at:', m2.index);
  console.log(src.substring(m2.index, m2.index + 2000));
}
