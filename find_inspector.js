const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Let's search for packet decoder / inspector / hex viewer
// Look for keywords like "hex", "ascii", "wire", "layers", "inspector", "wireshark", "payload"
const hexOccurrences = [...src.matchAll(/(?:hex|ascii|inspector|packet-detail|packet-inspector|dissect|decode)/gi)];
console.log('Hex occurrences count:', hexOccurrences.length);

// Let's find functions that format hex or decode packets
const hexFn = src.match(/function\s+[a-zA-Z0-9_$]+\([^)]*\)\s*\{[^}]*(?:toString\(16\)|slice|hex|byte)[^}]*\}/g);
console.log('Hex functions sample:', hexFn ? hexFn.slice(0, 5) : 'none');

// Let's search for where wire data is rendered in the UI
const wireIdx = src.indexOf('.wire');
console.log('Index of .wire:', wireIdx);
if (wireIdx !== -1) {
  console.log('Snippet around .wire:\n', src.substring(wireIdx - 100, wireIdx + 300));
}
