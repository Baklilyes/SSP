const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Let's inspect category groupings
// Look for where the list of protocols is categorized
const catRegex = /category:\s*["']([^"']+)["']/g;
const categoriesFound = new Set();
let cm;
while ((cm = catRegex.exec(src)) !== null) {
  categoriesFound.add(cm[1]);
}
console.log('Categories found via property:', Array.from(categoriesFound));

// Let's search for the list of categories in the sidebar/navigation
// Search for strings like "Web", "Transport", "Internet", "DNS", "Security", "Email", "Local Network", "VPN", "IoT"
const knownCats = ["Web", "Transport", "Internet", "DNS", "Security", "Email", "Local Network", "VPN", "IoT", "Streaming"];
for (const cat of knownCats) {
  const idx = src.indexOf(`"${cat}"`);
  console.log(`Cat "${cat}" at:`, idx);
  if (idx !== -1) {
    console.log(`Snippet around "${cat}":`, src.substring(idx - 50, idx + 150));
    break;
  }
}
