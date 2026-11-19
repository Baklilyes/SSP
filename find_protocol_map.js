const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Find variable name that holds HTTP:
// We saw: O0={id:"http",name:"HTTP",title:"Web Communication",layer:7,...
// Let's find where O0 is used in the code:
const matches = [...src.matchAll(/(?:([a-zA-Z0-9_$]+)=\{id:"http"|([a-zA-Z0-9_$]+)\s*=\s*\[[^\]]*O0[^\]]*\])/g)];
console.log('Matches:', matches.map(m => m[0]));

// Let's find all occurrences of O0
const o0Matches = [...src.matchAll(/\bO0\b/g)].map(m => m.index);
console.log('O0 occurrences count:', o0Matches.length);
for (const idx of o0Matches) {
  console.log('Context around O0 at', idx, ':', src.substring(Math.max(0, idx - 50), Math.min(src.length, idx + 100)));
}
