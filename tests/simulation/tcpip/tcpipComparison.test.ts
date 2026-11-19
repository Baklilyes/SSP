import { describe, it, expect } from 'vitest';
import {
  TCPIP_LAYERS,
  HYBRID_5_LAYERS,
  getTCPIPLayerByNumber,
} from '../../../lib/simulation/scenarios/tcpip/tcpipLayers';
import { OSI_LAYERS } from '../../../lib/simulation/scenarios/osi/osiLayers';

describe('OSI 7-Layer vs TCP/IP 4-Layer Comparison & Hybrid 5-Layer', () => {
  it('covers all 7 OSI layers through the 4 TCP/IP layers', () => {
    const coveredOsiLayers = new Set<number>();
    TCPIP_LAYERS.forEach((l) => {
      l.osiEquivalents.forEach((osiNum) => coveredOsiLayers.add(osiNum));
    });

    // Every layer 1 to 7 must be covered
    for (let i = 1; i <= 7; i++) {
      expect(coveredOsiLayers.has(i)).toBe(true);
    }
  });

  it('correctly maps application layers (OSI 5, 6, 7 -> TCP/IP 4)', () => {
    const l4 = getTCPIPLayerByNumber(4);
    expect(l4.id).toBe('application');
    expect(l4.osiEquivalents).toEqual([7, 6, 5]);
  });

  it('correctly maps transport layers (OSI 4 -> TCP/IP 3)', () => {
    const l3 = getTCPIPLayerByNumber(3);
    expect(l3.id).toBe('transport');
    expect(l3.osiEquivalents).toEqual([4]);
  });

  it('correctly maps internet/network layers (OSI 3 -> TCP/IP 2)', () => {
    const l2 = getTCPIPLayerByNumber(2);
    expect(l2.id).toBe('internet');
    expect(l2.osiEquivalents).toEqual([3]);
  });

  it('correctly maps network access layers (OSI 1, 2 -> TCP/IP 1)', () => {
    const l1 = getTCPIPLayerByNumber(1);
    expect(['host-network', 'host-to-network']).toContain(l1.id);
    expect(l1.osiEquivalents).toEqual([2, 1]);
  });

  it('correctly models the 5-layer hybrid architecture', () => {
    expect(HYBRID_5_LAYERS).toHaveLength(5);
    expect(HYBRID_5_LAYERS[0].nameEn).toBe('Application');
    expect(HYBRID_5_LAYERS[1].nameEn).toBe('Transport');
    expect(HYBRID_5_LAYERS[2].nameEn).toContain('Network');
    expect(HYBRID_5_LAYERS[3].nameEn).toBe('Data Link');
    expect(HYBRID_5_LAYERS[4].nameEn).toBe('Physical');
  });
});
