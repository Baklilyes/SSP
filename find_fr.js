const fs = require('fs');
const js = fs.readFileSync('index.js', 'utf8');
let idx = 0;
while ((idx = js.indexOf('"fr"', idx)) !== -1) {
  console.log('"fr" at', idx);
  console.log(js.slice(idx - 100, idx + 400));
  idx += 5;
}
