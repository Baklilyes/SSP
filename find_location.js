const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const locMatches = [...src.matchAll(/location/g)];
console.log('Location count:', locMatches.length);
for (const m of locMatches) {
  console.log('--- Context around location at', m.index, '---');
  console.log(src.substring(Math.max(0, m.index - 30), Math.min(src.length, m.index + 120)));
}
