const fs = require('fs');
const vm = require('vm');

function getOriginalProtocols() {
  const code = fs.readFileSync('index.js', 'utf8');
  const sIdx = code.indexOf('_s={http:');
  const afterTs = code.indexOf('],Se=', sIdx);
  const slicedCode = code.slice(0, afterTs + 1) + ';\nglobalThis.__EXTRACTED_S = _s; globalThis.__EXTRACTED_TS = Ts;\n';

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
  return sandbox.__EXTRACTED_S;
}

const orig = getOriginalProtocols();
const pkt = orig.tcp.steps[0].events[1];
console.log('TCP step 0 event 1 keys:', Object.keys(pkt));
console.log('row:', pkt.row);
console.log('wire:', JSON.stringify(pkt.wire || pkt.row?.wire, null, 2));
