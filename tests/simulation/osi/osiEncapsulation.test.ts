import { describe, it, expect } from 'vitest';
import { OSI_SIMULATION_STEPS } from '../../../lib/simulation/scenarios/osi/osiEvents';
import { buildOsiDissectedFrames } from '../../../lib/simulation/scenarios/osi/osiPacket';

describe('OSI Encapsulation and Decapsulation Protocol Verification', () => {
  it('starts with raw application payload at Layer 7', () => {
    const step0 = OSI_SIMULATION_STEPS[0];
    expect(step0.osiMeta.packetState.applicationData).toBe('Hello');
    expect(step0.osiMeta.packetState.transportHeader).toBeUndefined();
    expect(step0.osiMeta.packetState.networkHeader).toBeUndefined();
    expect(step0.osiMeta.packetState.dataLinkHeader).toBeUndefined();
  });

  it('adds TCP header at Layer 4 (Transport)', () => {
    const step3 = OSI_SIMULATION_STEPS[3];
    expect(step3.osiMeta.packetState.transportHeader).toBeDefined();
    expect(step3.osiMeta.packetState.transportHeader?.protocol).toBe('TCP');
    expect(step3.osiMeta.packetState.transportHeader?.sourcePort).toBe(49152);
    expect(step3.osiMeta.packetState.transportHeader?.destinationPort).toBe(80);
    expect(step3.osiMeta.packetState.networkHeader).toBeUndefined();
    expect(step3.osiMeta.packetState.dataLinkHeader).toBeUndefined();
  });

  it('adds IPv4 header at Layer 3 (Network)', () => {
    const step4 = OSI_SIMULATION_STEPS[4];
    expect(step4.osiMeta.packetState.transportHeader).toBeDefined();
    expect(step4.osiMeta.packetState.networkHeader).toBeDefined();
    expect(step4.osiMeta.packetState.networkHeader?.version).toBe(4);
    expect(step4.osiMeta.packetState.networkHeader?.sourceIP).toBe('192.168.1.100');
    expect(step4.osiMeta.packetState.networkHeader?.destinationIP).toBe('203.0.113.10');
    expect(step4.osiMeta.packetState.dataLinkHeader).toBeUndefined();
  });

  it('adds Ethernet II header at Layer 2 (Data Link) completing encapsulation', () => {
    const step5 = OSI_SIMULATION_STEPS[5];
    expect(step5.osiMeta.packetState.transportHeader).toBeDefined();
    expect(step5.osiMeta.packetState.networkHeader).toBeDefined();
    expect(step5.osiMeta.packetState.dataLinkHeader).toBeDefined();
    expect(step5.osiMeta.packetState.dataLinkHeader?.etherType).toContain('0x0800');
    expect(step5.osiMeta.packetState.rawBytesLength).toBe(59);
  });

  it('converts full frame to physical bits at Layer 1 (Physical)', () => {
    const step6 = OSI_SIMULATION_STEPS[6];
    expect(step6.osiMeta.packetState.physicalBits).toBeDefined();
    expect(step6.osiMeta.packetState.physicalBits).toMatch(/^[01 ]+$/);
  });

  it('decapsulates Ethernet header at receiver Layer 2', () => {
    const step8 = OSI_SIMULATION_STEPS[8];
    expect(step8.osiMeta.action).toBe('strip-ethernet');
    expect(step8.osiMeta.packetState.dataLinkHeader).toBeUndefined();
    expect(step8.osiMeta.packetState.networkHeader).toBeDefined();
    expect(step8.osiMeta.packetState.transportHeader).toBeDefined();
  });

  it('decapsulates IPv4 header at receiver Layer 3', () => {
    const step9 = OSI_SIMULATION_STEPS[9];
    expect(step9.osiMeta.action).toBe('strip-ip');
    expect(step9.osiMeta.packetState.dataLinkHeader).toBeUndefined();
    expect(step9.osiMeta.packetState.networkHeader).toBeUndefined();
    expect(step9.osiMeta.packetState.transportHeader).toBeDefined();
  });

  it('decapsulates TCP header at receiver Layer 4', () => {
    const step10 = OSI_SIMULATION_STEPS[10];
    expect(step10.osiMeta.action).toBe('strip-tcp');
    expect(step10.osiMeta.packetState.dataLinkHeader).toBeUndefined();
    expect(step10.osiMeta.packetState.networkHeader).toBeUndefined();
    expect(step10.osiMeta.packetState.transportHeader).toBeUndefined();
  });

  it('delivers the untouched original application payload "Hello" at receiver Layer 7', () => {
    const step11 = OSI_SIMULATION_STEPS[11];
    expect(step11.osiMeta.action).toBe('data-delivered');
    expect(step11.osiMeta.packetState.applicationData).toBe('Hello');
  });

  it('builds authentic dissectable wire frames via PacketBuilder', () => {
    const frames = buildOsiDissectedFrames();
    expect(frames.appFrame).toBeDefined();
    expect(frames.transportFrame).toBeDefined();
    expect(frames.networkFrame).toBeDefined();
    expect(frames.fullFrame).toBeDefined();

    expect(frames.fullFrame.layers.length).toBeGreaterThanOrEqual(3);
    const layerNames = frames.fullFrame.layers.map((l) => l.name);
    expect(layerNames.some((n) => n.includes('Ethernet'))).toBe(true);
    expect(layerNames.some((n) => n.includes('IPv4'))).toBe(true);
    expect(layerNames.some((n) => n.includes('TCP'))).toBe(true);
  });
});
