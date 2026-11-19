const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const idx = 498000;
console.log(src.substring(idx, idx + 4000));
