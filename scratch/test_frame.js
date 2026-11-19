const fs = require('fs');
const vm = require('vm');

function getOriginalProtocolsWithFrames() {
  const code = fs.readFileSync('index.js', 'utf8');
  
  // Find where Gu is defined:
  // function Gu(e){if(!Ki.has(e)){const t=new Xg(e)...
  // Let's find after Gu:
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

const { protos, gu } = getOriginalProtocolsWithFrames();
const tcp = protos.tcp;
const frames = gu(tcp);
console.log('TCP frames count:', frames.length);
console.log('Frame 0 keys:', Object.keys(frames[0]));
console.log('Frame 0 bytes length:', frames[0].bytes ? frames[0].bytes.length : 0);
console.log('Frame 0 layers:', frames[0].layers);
console.log('Frame 0 fields count:', frames[0].fields ? frames[0].fields.length : 0);
console.log('First 3 fields:', frames[0].fields.slice(0, 3));
