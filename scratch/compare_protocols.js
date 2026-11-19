const fs = require('fs');
const vm = require('vm');

let code = fs.readFileSync('index.js', 'utf8');

const sIdx = code.indexOf('_s={http:');
const afterTs = code.indexOf('],Se=', sIdx);

const slicedCode = code.slice(0, afterTs + 1) + ';\nglobalThis.__EXTRACTED_S = _s; globalThis.__EXTRACTED_TS = Ts;\n';

const mockWindow = {
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  location: { hash: '', search: '', pathname: '/' },
  navigator: { language: 'fr', languages: ['fr'] }
};

const makeMockElement = () => ({
  relList: { supports: () => true },
  style: {},
  setAttribute: () => {},
  getAttribute: () => '0 0 1000 600',
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  appendChild: () => {},
  querySelectorAll: () => [],
  querySelector: () => makeMockElement(),
  addEventListener: () => {},
  closest: () => null,
  getBoundingClientRect: () => ({ left: 0, top: 0, right: 1000, bottom: 600, width: 1000, height: 600 })
});

const mockDoc = {
  documentElement: { dataset: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, clientWidth: 1200 },
  querySelector: () => makeMockElement(),
  querySelectorAll: () => [],
  createElement: () => makeMockElement(),
  createElementNS: () => makeMockElement()
};

mockWindow.document = mockDoc;
mockWindow.window = mockWindow;

const sandbox = {
  window: mockWindow,
  document: mockDoc,
  navigator: mockWindow.navigator,
  localStorage: mockWindow.localStorage,
  matchMedia: mockWindow.matchMedia,
  setTimeout,
  clearTimeout,
  console,
  TextEncoder,
  TextDecoder,
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  MutationObserver: class { observe() {} disconnect() {} },
  queueMicrotask: process.nextTick,
  location: mockWindow.location
};

vm.createContext(sandbox);

try {
  vm.runInContext(slicedCode, sandbox, { timeout: 15000 });
  const protos = sandbox.__EXTRACTED_S;
  const keys = Object.keys(protos || {});
  console.log('Extracted', keys.length, 'protocols!');
  
  const cleanProtos = {};
  for (const [id, p] of Object.entries(protos)) {
    cleanProtos[id] = {
      id: p.id,
      name: p.name,
      title: p.title,
      layer: p.layer,
      nodes: p.nodes,
      labels: p.labels,
      latency: p.latency,
      legend: p.legend,
      start: p.start,
      overview: p.overview,
      outro: p.outro,
      steps: p.steps.map(s => ({
        title: s.title,
        desc: s.desc,
        detail: s.detail,
        facts: s.facts,
        eventsCount: s.events ? s.events.length : 0,
        events: s.events ? s.events.map(e => {
          if (e.type === 'packet') {
            return {
              type: 'packet',
              from: e.from,
              to: e.to,
              color: e.color,
              label: e.label,
              payload: e.payload,
              row: e.row,
              lost: e.lost,
              locked: e.locked
            };
          }
          if (e.type === 'stream') {
            return {
              type: 'stream',
              from: e.from,
              to: e.to,
              color: e.color,
              label: e.label,
              payload: e.payload,
              packetsCount: e.packets ? e.packets.length : 0
            };
          }
          return e;
        }) : []
      }))
    };
  }
  fs.writeFileSync('extracted_site_protocols.json', JSON.stringify(cleanProtos, null, 2));
  console.log('Saved to extracted_site_protocols.json!');
} catch (e) {
  console.log('Error:', e.message);
}
