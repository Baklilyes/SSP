const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

for (const fn of ['gy', 'qy', 'dS', 'fS', 'AS', 'Ay', '$y']) {
  const m = src.match(new RegExp(`function\\s+${fn}\\s*\\([^)]*\\)\\s*\\{`));
  if (m) {
    console.log(`=== function ${fn} ===`);
    console.log(src.substring(m.index, m.index + 500));
  }
}
