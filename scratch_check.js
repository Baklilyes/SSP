const fs = require('fs');
const code = fs.readFileSync('index.js', 'utf8');
const idx = code.indexOf('.now-step');
console.log(code.substring(idx - 150, idx + 350));
