const fs = require('fs');
const src = fs.readFileSync('index.js', 'utf8');

// Find all protocol objects: pattern like {id:"[a-z0-9\-]+",name:
const protoRegex = /\{id:"([a-z0-9\-]+)",name:"([^"]+)",title:"([^"]+)",layer:([0-9]+)/g;
let m;
const protos = [];
while ((m = protoRegex.exec(src)) !== null) {
  protos.push({ id: m[1], name: m[2], title: m[3], layer: parseInt(m[4]) });
}
console.log('Protocols detected via regex:', protos.length);
console.log(JSON.stringify(protos, null, 2));
