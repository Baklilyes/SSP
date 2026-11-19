const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const idx = src.indexOf('document.querySelector("#app")');
console.log('App init index:', idx);
console.log(src.substring(idx - 200, idx + 2500));
