const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const idx = src.indexOf('[{code:"en"');
console.log('Lang array index:', idx);
console.log(src.substring(idx - 100, idx + 1200));
