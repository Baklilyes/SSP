const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');
console.log('Bundle length:', src.length);

// Search for chunks
const chunkMatches = src.match(/\/assets\/[a-zA-Z0-9_\-\.]+\.js/g) || [];
console.log('Dynamic chunks found:', [...new Set(chunkMatches)]);

// Look for manifest or protocol list
// Let's search for keywords like "HTTP", "DNS", "Web", "Transport"
const categoryMatches = src.match(/(?:Web|Transport|Internet|Routing|Security|Local Network|Email|VPN|IoT|DNS)/g) || [];
console.log('Categories count:', categoryMatches.length);

// Let's find protocol ids / slugs
// Search for pattern id: "...", name: "..." or slug: "..."
const slugPattern = /(?:slug|id|path):\s*["']([a-z0-9\-]+)["']/g;
let m;
const slugs = new Set();
while ((m = slugPattern.exec(src)) !== null) {
  slugs.add(m[1]);
}
console.log('Found slugs (sample):', Array.from(slugs).slice(0, 50));
