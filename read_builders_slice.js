const fs = require('fs');
const slice = fs.readFileSync('builders_slice.js', 'utf8');
console.log('--- START OF BUILDERS ---');
console.log(slice.substring(0, 2500));
console.log('--- MIDDLE OF BUILDERS ---');
console.log(slice.substring(2500, 5000));
