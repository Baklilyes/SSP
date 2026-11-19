const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const start = 289000;
const length = 5000;
console.log(src.substring(start, start + length));
