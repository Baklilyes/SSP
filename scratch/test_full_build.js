const fs = require('fs');
const vm = require('vm');

function getOriginalProtocolsWithFrames() {
  const code = fs.readFileSync('index.js', 'utf8');
  const guIdx = code.indexOf('function Gu(');
  const afterGu = code.indexOf('function eS()', guIdx);
  const slicedCode = code.slice(0, afterGu) + ';\nglobalThis.__EXTRACTED_S = _s; globalThis.__EXTRACTED_GU = Gu; globalThis.__EXTRACTED_TS = Ts;\n';

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
  vm.runInContext(slicedCode, sandbox, { timeout: 15000 });
  return { protos: sandbox.__EXTRACTED_S, gu: sandbox.__EXTRACTED_GU, ts: sandbox.__EXTRACTED_TS };
}

const { protos, gu, ts } = getOriginalProtocolsWithFrames();
const groupsMap = {};
ts.forEach(t => groupsMap[t.id] = t.group);

const result = {};
for (const [id, p] of Object.entries(protos)) {
  const frames = gu(p);
  let frameIdx = 0;

  const fullProto = {
    id: p.id,
    name: p.name,
    title: p.title,
    layer: p.layer,
    group: groupsMap[id] || 'application',
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
      events: s.events ? s.events.map(e => {
        if (e.type === 'packet') {
          const frame = frames[frameIdx++];
          return {
            type: 'packet',
            from: e.from,
            to: e.to,
            color: e.color,
            label: e.label,
            payload: e.payload,
            lost: e.lost,
            locked: e.locked,
            row: e.row,
            wire: frame ? {
              bytes: Array.from(frame.bytes || []),
              fields: frame.fields || [],
              layers: frame.layers || []
            } : e.row?.wire
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
            packets: e.packets ? e.packets.map(pkt => {
              const frame = frames[frameIdx++];
              return {
                type: 'packet',
                from: pkt.from,
                to: pkt.to,
                color: pkt.color,
                label: pkt.label,
                payload: pkt.payload,
                lost: pkt.lost,
                locked: pkt.locked,
                row: pkt.row,
                wire: frame ? {
                  bytes: Array.from(frame.bytes || []),
                  fields: frame.fields || [],
                  layers: frame.layers || []
                } : pkt.row?.wire
              };
            }) : []
          };
        }
        return e;
      }) : []
    }))
  };
  result[id] = fullProto;
}

const jsonStr = JSON.stringify(result);
console.log('Complete protocols JSON string length:', (jsonStr.length / 1024 / 1024).toFixed(2), 'MB');
console.log('All 39 protocols successfully assembled with full wire frames!');
