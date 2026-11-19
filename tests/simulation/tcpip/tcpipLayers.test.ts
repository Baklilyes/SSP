import { describe, it, expect } from 'vitest';
import {
  TCPIP_LAYERS,
  TCPIP_LAYERS_TOP_DOWN,
  TCPIP_LAYERS_BOTTOM_UP,
  getTCPIPLayerByNumber,
  getTCPIPLayerById,
  HYBRID_5_LAYERS,
} from '../../../lib/simulation/scenarios/tcpip/tcpipLayers';

describe('TCP/IP Layers Domain Model', () => {
  it('defines exactly four layers according to RFC 1122 / DoD architecture', () => {
    expect(TCPIP_LAYERS).toHaveLength(4);
  });

  it('maintains strict top-down order from Layer 4 Application to Layer 1 Host-to-Network', () => {
    const numbers = TCPIP_LAYERS_TOP_DOWN.map((l) => l.number);
    expect(numbers).toEqual([4, 3, 2, 1]);
    expect(TCPIP_LAYERS_TOP_DOWN[0].id).toBe('application');
    expect(TCPIP_LAYERS_TOP_DOWN[1].id).toBe('transport');
    expect(TCPIP_LAYERS_TOP_DOWN[2].id).toBe('internet');
    expect(['host-network', 'host-to-network']).toContain(TCPIP_LAYERS_TOP_DOWN[3].id);
  });

  it('maintains bottom-up order from Layer 1 to Layer 4', () => {
    const numbers = TCPIP_LAYERS_BOTTOM_UP.map((l) => l.number);
    expect(numbers).toEqual([1, 2, 3, 4]);
  });

  it('assigns correct PDU units to each TCP/IP layer', () => {
    expect(getTCPIPLayerByNumber(4).unit).toBe('message');
    expect(getTCPIPLayerByNumber(3).unit).toBe('segment');
    expect(getTCPIPLayerByNumber(2).unit).toBe('packet');
    expect(getTCPIPLayerByNumber(1).unit).toBe('frame');
  });

  it('maps correctly to OSI model layers', () => {
    // Layer 4 Application maps to OSI 7, 6, 5
    expect(getTCPIPLayerByNumber(4).osiEquivalents).toEqual([7, 6, 5]);
    // Layer 3 Transport maps to OSI 4
    expect(getTCPIPLayerByNumber(3).osiEquivalents).toEqual([4]);
    // Layer 2 Internet maps to OSI 3
    expect(getTCPIPLayerByNumber(2).osiEquivalents).toEqual([3]);
    // Layer 1 Host-to-Network maps to OSI 2, 1
    expect(getTCPIPLayerByNumber(1).osiEquivalents).toEqual([2, 1]);
  });

  it('retrieves layers by id and provides bilingual names', () => {
    const app = getTCPIPLayerById('application');
    expect(app?.nameFr).toBe('Application');
    expect(app?.nameEn).toBe('Application');

    const trans = getTCPIPLayerById('transport');
    expect(trans?.nameFr).toBe('Transport');
    expect(trans?.protocols).toContain('tcp');
    expect(trans?.protocols).toContain('udp');

    const internet = getTCPIPLayerById('internet');
    expect(internet?.nameFr).toBe('Internet');
    expect(internet?.protocols).toContain('ip');
    expect(internet?.protocols).toContain('ipv6');

    const host = getTCPIPLayerById('host-to-network');
    expect(host?.nameFr).toBe('Hôte-Réseau (Accès Réseau)');
    expect(host?.protocols).toContain('ethernet');
  });

  it('defines the modern 5-layer hybrid model', () => {
    expect(HYBRID_5_LAYERS).toHaveLength(5);
    const order = HYBRID_5_LAYERS.map((l) => l.number);
    expect(order).toEqual([5, 4, 3, 2, 1]);
    expect(HYBRID_5_LAYERS[0].nameEn).toBe('Application');
    expect(HYBRID_5_LAYERS[1].nameEn).toBe('Transport');
    expect(HYBRID_5_LAYERS[2].nameEn).toContain('Network');
    expect(HYBRID_5_LAYERS[3].nameEn).toBe('Data Link');
    expect(HYBRID_5_LAYERS[4].nameEn).toBe('Physical');
  });
});
