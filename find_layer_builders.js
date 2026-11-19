const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Let's find functions creating new R("eth", ...), new R("ip", ...), new R("tcp", ...), new R("udp", ...), etc.
const layerKeywords = ["eth", "ip", "ipv6", "tcp", "udp", "icmp", "dns", "tls", "http", "dhcp", "arp", "wifi", "dot11"];
for (const kw of layerKeywords) {
  const matches = [...src.matchAll(new RegExp(`new R\\(["']${kw}["']`, 'g'))];
  console.log(`new R("${kw}") occurrences:`, matches.length);
  for (const m of matches) {
    const start = Math.max(0, m.index - 50);
    const end = Math.min(src.length, m.index + 300);
    console.log(`--- Layer ${kw} at ${m.index} ---`);
    console.log(src.substring(start, end));
    break;
  }
}
