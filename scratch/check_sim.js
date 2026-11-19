const fs = require('fs');
const code = fs.readFileSync('index.js', 'utf8');
let pos = 0;
while ((pos = code.indexOf('async function N', pos)) !== -1) {
  console.log('Found at pos:', pos);
  pos += 16;
}
