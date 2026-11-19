const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Search for array of protocol ids, e.g. ["http","https",...]
const arrRegex = /\["(?:http|dns|tcp|ip)"[^\]]+\]/g;
let m;
while ((m = arrRegex.exec(src)) !== null) {
  console.log('Found protocol array:', m[0].substring(0, 200));
}

// Let's search for where 'http' is referenced in arrays
const subIdx = src.indexOf('["http",');
console.log('Index of ["http", :', subIdx);
if (subIdx !== -1) {
  console.log(src.substring(subIdx - 100, subIdx + 500));
}
