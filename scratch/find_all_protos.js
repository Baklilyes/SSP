const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

const rtmpIdx = content.indexOf('{id:"rtmp"');
console.log('RTMP idx:', rtmpIdx);
console.log(content.slice(rtmpIdx, rtmpIdx + 12000));
