const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Check routing logic: history.pushState, hashchange, popstate, or similar
const routeMatches = [...src.matchAll(/(?:hashchange|popstate|pushState|replaceState|pathname|location\.hash)/g)];
console.log('Route event matches:', routeMatches.map(m => m[0]));

for (const m of routeMatches) {
  console.log('--- Context around', m[0], 'at', m.index, '---');
  console.log(src.substring(Math.max(0, m.index - 50), Math.min(src.length, m.index + 200)));
}
