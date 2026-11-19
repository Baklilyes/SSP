const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

// Search for any click or pointer listener on node or network
const matches = [];
let p = 0;
while (true) {
  const i = content.indexOf('click', p);
  if (i === -1) break;
  const snip = content.slice(Math.max(0, i - 40), i + 80);
  if (snip.includes('node') || snip.includes('network') || snip.includes('device') || snip.includes('svg')) {
    matches.push(snip);
  }
  p = i + 5;
}
console.log('Matches:', matches.length);
matches.forEach(m => console.log('->', m));
