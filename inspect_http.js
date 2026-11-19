const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Let's inspect O0 (http)
const start = src.indexOf('O0={id:"http"');
// Find where O0 ends, which is before M0={id:"https"
const end = src.indexOf('M0={id:"https"');

const httpSnippet = src.substring(start, end);
console.log('Http snippet length:', httpSnippet.length);
fs.writeFileSync('http_dump.js', 'const http = ' + httpSnippet.replace(/^[A-Za-z0-9_$]+=\s*/, '') + ';\nmodule.exports = http;');

// Let's inspect the structure of keys of http
try {
  // We can evaluate or parse safely or inspect using regex
  console.log('Snippet preview (first 1000 chars):');
  console.log(httpSnippet.substring(0, 1000));
} catch (e) {
  console.error(e);
}
