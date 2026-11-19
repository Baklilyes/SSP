const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

const quote = String.fromCharCode(34);
const target = '{id:' + quote + 'https' + quote;
const idx = src.indexOf(target);
if (idx !== -1) {
  const stepsIdx = src.indexOf('steps:[', idx);
  console.log(src.slice(stepsIdx + 1800, stepsIdx + 3600));
}
