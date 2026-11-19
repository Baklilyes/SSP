const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');
console.log(content.slice(488000, 494000));
