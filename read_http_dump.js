const fs = require('fs');
const str = fs.readFileSync('http_dump.js', 'utf8');

console.log('=== PART 1 (0 - 1500) ===');
console.log(str.slice(0, 1500));

console.log('=== PART 2 (1500 - 3500) ===');
console.log(str.slice(1500, 3500));

console.log('=== PART 3 (3500 - end) ===');
console.log(str.slice(3500));
