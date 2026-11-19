import { describe, it, expect } from 'vitest';
import { getAllProtocols, getProtocol } from '../lib/protocols/registry';
import { PROTOCOLS_LIST } from '../data/protocols';

describe('Protocols Registry & Integrity Verification', () => {
  const protocols = getAllProtocols();

  it('contains all 41 registered protocols', () => {
    expect(protocols.length).toBe(41);
  });

  it('matches all protocols listed in PROTOCOLS_LIST', () => {
    expect(PROTOCOLS_LIST.length).toBe(41);
    PROTOCOLS_LIST.forEach((meta) => {
      const p = getProtocol(meta.id);
      expect(p).toBeDefined();
      expect(p.id).toBe(meta.id);
    });
  });

  protocols.forEach((proto) => {
    describe(`Protocol: ${proto.name} (${proto.id})`, () => {
      it('has valid metadata and overview', () => {
        expect(proto.id).toBeTruthy();
        expect(proto.name).toBeTruthy();
        expect(proto.title).toBeTruthy();
        expect(proto.overview.full).toBeTruthy();
        expect(proto.overview.description).toBeTruthy();
        expect(proto.overview.facts.length).toBeGreaterThan(0);
        expect(proto.steps.length).toBeGreaterThan(0);
      });

      it('has consistent packet bytes and field offsets', () => {
        proto.steps.forEach((step, sIdx) => {
          step.events.forEach((evt, eIdx) => {
            if (evt.type === 'packet') {
              const frame = evt.wire;
              expect(frame.bytes.length).toBeGreaterThan(0);
              expect(frame.layers.length).toBeGreaterThan(0);

              // Vérification de la cohérence des couches
              frame.layers.forEach((layer) => {
                expect(layer.from).toBeLessThanOrEqual(layer.to);
                expect(layer.to).toBeLessThanOrEqual(frame.bytes.length);
              });

              // Vérification de la cohérence des champs
              frame.fields.forEach((f) => {
                expect(f.from).toBeLessThanOrEqual(f.to);
              });
            }
          });
        });
      });
    });
  });
});
