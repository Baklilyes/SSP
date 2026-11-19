const fs = require('fs');
const js = fs.readFileSync('index.js', 'utf8');

let idx = 0;
while ((idx = js.indexOf('step-num', idx)) !== -1) {
  console.log('step-num at', idx, js.slice(Math.max(0, idx - 40), idx + 80));
  idx += 10;
}
