import { describe, it, expect } from 'vitest';
import { ROUTER_HOPS } from '../../../lib/simulation/scenarios/tcpip/tcpipRouting';
import { getTcpipSteps } from '../../../lib/simulation/scenarios/tcpip/tcpipEvents';
import {
  TCPIP_CLIENT_IP,
  TCPIP_SERVER_IP,
} from '../../../lib/simulation/scenarios/tcpip/tcpipPacket';

describe('TCP/IP Layer 2 Internet Routing & Router Mechanics', () => {
  it('defines the 2 intermediate router hops', () => {
    expect(ROUTER_HOPS).toHaveLength(2);
    expect(ROUTER_HOPS[0].routerName).toBe('Routeur Passerelle (R1)');
    expect(ROUTER_HOPS[1].routerName).toContain('R2');
  });

  it('verifies TTL decrement behavior across router steps', () => {
    const steps = getTcpipSteps('fr', 'TCP', 'Ethernet');

    // Step 3 (Client IP creation): TTL starts at 64
    expect(steps[2].tcpipMeta?.packetState.networkHeader?.ttl).toBe(64);

    // Step 6 (Arrival at Router 1): TTL still 64
    expect(steps[5].tcpipMeta?.packetState.networkHeader?.ttl).toBe(64);

    // Step 7 (Router 1 routing decision): TTL decremented 64 -> 63
    expect(steps[6].tcpipMeta?.packetState.networkHeader?.ttl).toBe(63);

    // Step 8 (Router re-encapsulation & transit): TTL is 62
    expect(steps[7].tcpipMeta?.packetState.networkHeader?.ttl).toBe(62);
  });

  it('ensures end-to-end IP addresses remain immutable across all hops', () => {
    const steps = getTcpipSteps('fr', 'TCP', 'Ethernet');

    // All steps that have an IP header must retain client IP and server IP
    steps.forEach((step, idx) => {
      const net = step.tcpipMeta?.packetState.networkHeader;
      if (net) {
        expect(net.sourceIP).toBe(TCPIP_CLIENT_IP);
        expect(net.destinationIP).toBe(TCPIP_SERVER_IP);
      }
    });
  });

  it('demonstrates MAC rewrite at each network link', () => {
    const steps = getTcpipSteps('fr', 'TCP', 'Ethernet');

    // Step 4 (Client to R1 link): Source is Client MAC, Dst is R1 eth0 MAC
    const clientLinkMacs = steps[3].tcpipMeta?.packetState.networkAccessHeader;
    expect(clientLinkMacs?.sourceMAC).toBe('00:1A:2B:3C:4D:5E');
    expect(clientLinkMacs?.destinationMAC).toBe('00:22:33:44:55:66');

    // Step 8 (Transit link towards destination network): MAC addresses are updated
    const transitLinkMacs = steps[7].tcpipMeta?.packetState.networkAccessHeader;
    expect(transitLinkMacs?.sourceMAC).toBe('00:22:33:44:55:77');
    expect(transitLinkMacs?.destinationMAC).toBe('00:BB:CC:DD:EE:FF');
  });
});
