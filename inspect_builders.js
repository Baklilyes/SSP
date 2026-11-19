const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Inspect from 274000 to 285000
const slice = src.substring(274000, 282000);
console.log('Length:', slice.length);
// Find function names declared in this range:
const fns = [...slice.matchAll(/function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/g)];
console.log('Functions in builder range:', fns.map(f => `${f[1]}(${f[2]})`));
fs.writeFileSync('builders_slice.js', slice);
