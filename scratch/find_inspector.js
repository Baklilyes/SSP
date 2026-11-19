const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

const idx = content.indexOf('function Gu(');
console.log('function Gu index:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 2500));
}
