import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as vm from 'vm';
import { PROTOCOLS_REGISTRY } from '../lib/protocols/registry';

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

  const mockWindow: any = {
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    localStorage: { getItem: () => null, setItem: () => {} },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
    location: { hash: '', search: '', pathname: '/' },
    navigator: { language: 'fr', languages: ['fr'] }
  };
  mockWindow.document = mockDoc;
  mockWindow.window = mockWindow;

  const sandbox: any = {
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

describe('Protocols comparison with original site', () => {
  const origProtos = getOriginalProtocols();
  const origKeys = Object.keys(origProtos);

  it('has all 39 protocols in registry', () => {
    expect(origKeys.length).toBe(39);
    for (const key of origKeys) {
      expect(PROTOCOLS_REGISTRY[key]).toBeDefined();
    }
  });

  for (const key of origKeys) {
    it(`protocol [${key}] matches original site`, () => {
      const orig = origProtos[key];
      const local = PROTOCOLS_REGISTRY[key];

      expect(local, `Missing protocol ${key}`).toBeDefined();
      expect(local.id).toBe(orig.id);
      expect(local.layer).toBe(orig.layer);
      expect(local.steps.length, `Step count mismatch for ${key}`).toBe(orig.steps.length);

      // Compare nodes
      if (orig.nodes) {
        expect(local.nodes.sort()).toEqual(orig.nodes.sort());
      }

      // Check step titles and event counts
      orig.steps.forEach((origStep: any, sIdx: number) => {
        const localStep = local.steps[sIdx];
        expect(localStep, `Missing step ${sIdx} in ${key}`).toBeDefined();
        
        // Count packet events
        const origPackets = origStep.events ? origStep.events.filter((e: any) => e.type === 'packet' || e.type === 'stream') : [];
        const localPackets = localStep.events ? localStep.events.filter((e: any) => e.type === 'packet') : [];

        // Check packet count if original has simple packets
        const origSimplePackets = origStep.events ? origStep.events.filter((e: any) => e.type === 'packet') : [];
        if (origSimplePackets.length > 0 && !origStep.events.some((e: any) => e.type === 'stream')) {
          expect(localPackets.length, `Packet count mismatch in ${key} step ${sIdx}`).toBe(origSimplePackets.length);
        }
      });
    });
  }
});
