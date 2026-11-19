const fs = require('fs');
const path = require('path');

function checkStarts(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) checkStarts(full);
    else if (f.endsWith('.ts') && f !== 'registry.ts') {
      const c = fs.readFileSync(full, 'utf8');
      const hasStart = c.includes('start:');
      console.log(f.padEnd(16), 'hasStart:', hasStart);
    }
  }
}
checkStarts('lib/protocols');
