const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Find where class R or constructor R is defined:
// Let's search for "class R" or "function R("
const rMatch = src.match(/(?:class\s+R\s*\{|function\s+R\s*\([a-zA-Z0-9_$,\s]*\)\s*\{)/);
if (rMatch) {
  console.log('R match found at index:', rMatch.index);
  console.log(src.substring(rMatch.index, rMatch.index + 1200));
} else {
  // Let's search for new R("dns" and find R
  const dnsR = src.indexOf('new R("dns"');
  console.log('new R index:', dnsR);
  console.log(src.substring(dnsR - 100, dnsR + 200));
}
