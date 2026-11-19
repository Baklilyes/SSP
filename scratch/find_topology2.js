const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

// Find all usages of rc
let p = 0;
while (true) {
  const i = content.indexOf('rc.', p);
  if (i === -1) break;
  console.log('rc. at', i, ':', content.slice(i, i + 80));
  p = i + 3;
}
