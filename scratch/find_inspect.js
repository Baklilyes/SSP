const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

let p = 490000;
while (true) {
  const i = content.indexOf('a0', p);
  if (i === -1 || i > 505000) break;
  console.log(content.slice(Math.max(0, i - 30), i + 70));
  p = i + 2;
}
