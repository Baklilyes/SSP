const fs = require('fs');
const p = JSON.parse(fs.readFileSync('data/allProtocols.json', 'utf8'));
const isoText = fs.readFileSync('components/network/IsometricDevices.tsx', 'utf8');

// Extract ROUTES_MAP
const rMatch = isoText.match(/ROUTES_MAP:\s*Record<string,\s*string\[\]>\s*=\s*(\{[\s\S]*?\n\};)/);
let routes = {};
if (rMatch) {
  routes = eval('(' + rMatch[1].replace(/;$/, '') + ')');
}
const lMatch = isoText.match(/LANES_MAP:\s*Record<string,\s*\[number,[\s\S]*?\n\};/);
let lanes = {};
if (lMatch) {
  // Just find keys
  const keys = [...lMatch[0].matchAll(/'([^']+)'\s*:/g)].map(m => m[1]);
  keys.forEach(k => lanes[k] = true);
}

const missing = new Set();
for (const k of Object.keys(p)) {
  for (const s of p[k].steps) {
    for (const e of s.events) {
      if (e.type === 'packet') {
        const key = e.from + '>' + e.to;
        if (!routes[key] && !lanes[key]) {
          missing.add(key);
        }
      }
    }
  }
}
console.log('Missing routes in ROUTES_MAP / LANES_MAP:', Array.from(missing));
