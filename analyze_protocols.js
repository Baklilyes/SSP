const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Let's find where protocol definitions are declared
// Often there is an array or object of protocol items
// Let's search for objects with properties like name, category, packets, steps, or similar.
const protocols = [
  'http', 'https', 'tcp', 'udp', 'ip', 'dns', 'dhcp', 'icmp',
  'smtp', 'pop3', 'imap', 'ftp', 'ssh', 'tls', 'websocket', 'wifi',
  'wpa3', 'portal', 'proxy', 'socks', 'reverse', 'wireguard', 'ipsec', 'quic',
  'ipv6', 'ntp', 'doh', 'dnssec', 'radius', 'smb', 'modbus', 'bgp',
  'webrtc', 'ethernet', 'pppoe', 'sip', 'rtsp', 'igmp', 'rtmp'
];

console.log('Total protocols identified:', protocols.length);

// Let's search for categories
const categoriesMatch = src.match(/categories\s*=\s*\[[^\]]+\]/);
if (categoriesMatch) {
  console.log('Categories found:', categoriesMatch[0]);
}

// Search for objects containing id: "http" or similar
const httpIndex = src.indexOf('"http"');
console.log('Http index:', httpIndex);
if (httpIndex !== -1) {
  console.log('Snippet around http:\n', src.substring(Math.max(0, httpIndex - 100), httpIndex + 400));
}
