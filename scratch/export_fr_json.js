const fs = require('fs');
const vm = require('vm');

let code = fs.readFileSync('data/fr-asset.js', 'utf8');

code = code.replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/, 'const i = (x) => x, u = (x) => x;');
code = code.replace(/export\s*\{[^}]*\};?/, 'globalThis.__FR_TRANSLATIONS = h.strings;');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const strings = sandbox.__FR_TRANSLATIONS;
console.log('Total translated strings in French:', Object.keys(strings).length);

fs.writeFileSync('lib/i18n/fr-translations.json', JSON.stringify(strings), 'utf8');
console.log('Successfully saved lib/i18n/fr-translations.json');
