const fs = require('fs');

function performReplacements(text) {
  let t = text;
  // 1. URLs
  t = t.replace(/https?:\/\/www\.example\.com\/?/g, 'https://ssp-academy.com/');
  t = t.replace(/www\.example\.com\/?/g, 'https://ssp-academy.com/');

  // 2. Alice
  t = t.replace(/d[’']Alice/g, 'de Mohamed');
  t = t.replace(/d[’']alice/g, 'de mohamed');
  t = t.replace(/Alice[’']s/g, 'Mohamed’s');
  t = t.replace(/alice[’']s/g, 'mohamed’s');
  t = t.replace(/ALICE/g, 'Mohamed');
  t = t.replace(/Alice/g, 'Mohamed');
  t = t.replace(/alice/g, 'mohamed');

  return t;
}

// 1. allProtocols.json
const allProtocolsPath = 'data/allProtocols.json';
const allProtocols = fs.readFileSync(allProtocolsPath, 'utf8');
const newAllProtocols = performReplacements(allProtocols);
// verify it parses as JSON
JSON.parse(newAllProtocols);
fs.writeFileSync(allProtocolsPath, newAllProtocols, 'utf8');
console.log('Updated data/allProtocols.json');

// 2. fr-translations.json
const frTranslationsPath = 'lib/i18n/fr-translations.json';
const frTranslations = fs.readFileSync(frTranslationsPath, 'utf8');
const newFrTranslations = performReplacements(frTranslations);
JSON.parse(newFrTranslations);
fs.writeFileSync(frTranslationsPath, newFrTranslations, 'utf8');
console.log('Updated lib/i18n/fr-translations.json');

// 3. NetworkDiagram.tsx
const netDiagramPath = 'components/network/NetworkDiagram.tsx';
let netDiagram = fs.readFileSync(netDiagramPath, 'utf8');
netDiagram = performReplacements(netDiagram);
fs.writeFileSync(netDiagramPath, netDiagram, 'utf8');
console.log('Updated components/network/NetworkDiagram.tsx');

// 4. Update individual protocol files in lib/protocols/
const protocolFiles = [
  'lib/protocols/application/dns.ts',
  'lib/protocols/application/http.ts',
  'lib/protocols/application/imap.ts',
  'lib/protocols/application/pop3.ts',
  'lib/protocols/application/sip.ts',
  'lib/protocols/application/smtp.ts',
  'lib/protocols/application/websocket.ts',
  'lib/protocols/core/bgp.ts',
  'lib/protocols/security/https.ts',
  'lib/protocols/security/radius.ts',
  'lib/protocols/security/tls.ts',
  'lib/packet/builders/tls.ts',
];

protocolFiles.forEach((f) => {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const updated = performReplacements(content);
    fs.writeFileSync(f, updated, 'utf8');
    console.log('Updated', f);
  }
});

console.log('ALL REPLACEMENTS DONE SUCCESSFULLY!');
