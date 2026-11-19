const fs = require('fs');
const js = fs.readFileSync('index.js', 'utf8');

console.log(js.slice(493500, 495500));
