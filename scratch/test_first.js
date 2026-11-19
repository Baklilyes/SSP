const fs = require('fs');
const code = fs.readFileSync('index.js', 'utf8');
const sIdx = code.indexOf('_s={http:');
console.log(code.slice(sIdx, sIdx + 500));
