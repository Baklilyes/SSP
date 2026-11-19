const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const m = src.match(/function\s+iS\s*\([^)]*\)\s*\{/);
if (m) {
  console.log('Found iS at:', m.index);
  console.log(src.substring(m.index, m.index + 3000));
} else {
  console.log('iS not found as function statement, searching for iS= or iS:');
  const m2 = [...src.matchAll(/\biS\s*=\s*/g)];
  for (const match of m2) {
    console.log('iS= at:', match.index);
    console.log(src.substring(match.index, match.index + 2000));
  }
}
