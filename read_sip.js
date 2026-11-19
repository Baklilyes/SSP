const fs = require('fs');
const js = fs.readFileSync('index.js', 'utf8');

const q = String.fromCharCode(34);
const start = js.indexOf('{id:' + q + 'sip' + q);
const end = js.indexOf('{id:' + q + 'rtsp' + q, start);

const sipStr = js.slice(start, end);
console.log('--- PART 3 ---');
console.log(sipStr.slice(5500));
