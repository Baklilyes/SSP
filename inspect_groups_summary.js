const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const tsMatch = src.match(/Ts\s*=\s*\[[\s\S]+?\](?=,\s*[a-zA-Z0-9_$]+\s*=)/);
if (tsMatch) {
  const tsStr = tsMatch[0].replace(/^Ts\s*=\s*/, '');
  const ts = eval(tsStr);
  const groups = {};
  for (const item of ts) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }
  console.log('Groups found:');
  for (const [grp, items] of Object.entries(groups)) {
    console.log(`- ${grp} (${items.length}):`, items.map(i => i.id).join(', '));
  }
}
