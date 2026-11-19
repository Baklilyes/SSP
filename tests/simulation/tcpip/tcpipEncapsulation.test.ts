import { describe, it, expect } from 'vitest';
import {
  buildTcpipDissectedFrames,
  TCPIP_CLIENT_IP,
  TCPIP_SERVER_IP,
  TCPIP_PAYLOAD_TEXT,
} from '../../../lib/simulation/scenarios/tcpip/tcpipPacket';
import { getTcpipSteps } from '../../../lib/simulation/scenarios/tcpip/tcpipEvents';

describe('TCP/IP Encapsulation & Decapsulation Mechanics', () => {
  it('builds dissected frames for TCP over Ethernet', () => {
    const frames = buildTcpipDissectedFrames('TCP', 'Ethernet');
    expect(frames.appFrame).toBeDefined();
    expect(frames.transportFrame).toBeDefined();
    expect(frames.networkFrame).toBeDefined();
    expect(frames.fullFrame).toBeDefined();

    // Verify layer stack
    expect(frames.fullFrame.layers).toHaveLength(3); // eth, ip, tcp
    expect(frames.fullFrame.layers[0].id).toBe('eth');
    expect(frames.fullFrame.layers[1].id).toBe('ip');
    expect(frames.fullFrame.layers[2].id).toBe('tcp');
  });

  it('builds dissected frames for UDP over Ethernet', () => {
    const frames = buildTcpipDissectedFrames('UDP', 'Ethernet');
    expect(frames.fullFrame.layers[2].id).toBe('udp');
  });

  it('verifies byte lengths across top-down encapsulation', () => {
    const steps = getTcpipSteps('fr', 'TCP', 'Ethernet');

    // Step 1: Application data "Hello" = 5 octets
    expect(steps[0].tcpipMeta?.packetState.rawBytesLength).toBe(5);
    expect(steps[0].tcpipMeta?.packetState.applicationData).toBe('Hello');

    // Step 2: Transport encapsulation (+20 B TCP) = 25 octets
    expect(steps[1].tcpipMeta?.packetState.rawBytesLength).toBe(25);
    expect(steps[1].tcpipMeta?.packetState.transportHeader?.lengthBytes).toBe(20);

    // Step 3: Internet encapsulation (+20 B IPv4) = 45 octets
    expect(steps[2].tcpipMeta?.packetState.rawBytesLength).toBe(45);
    expect(steps[2].tcpipMeta?.packetState.networkHeader?.lengthBytes).toBe(20);
    expect(steps[2].tcpipMeta?.packetState.networkHeader?.sourceIP).toBe(TCPIP_CLIENT_IP);
    expect(steps[2].tcpipMeta?.packetState.networkHeader?.destinationIP).toBe(TCPIP_SERVER_IP);

    // Step 4: Network Access encapsulation (+14 B Ethernet) = 59 octets
    expect(steps[3].tcpipMeta?.packetState.rawBytesLength).toBe(59);
    expect(steps[3].tcpipMeta?.packetState.networkAccessHeader?.lengthBytes).toBe(14);
  });

  it('verifies UDP byte sizes (8 B header instead of 20 B)', () => {
    const udpSteps = getTcpipSteps('fr', 'UDP', 'Ethernet');

    // Step 2 with UDP: 5 + 8 = 13 B
    expect(udpSteps[1].tcpipMeta?.packetState.rawBytesLength).toBe(13);
    // Step 3 with UDP: 13 + 20 = 33 B
    expect(udpSteps[2].tcpipMeta?.packetState.rawBytesLength).toBe(33);
    // Step 4 with UDP: 33 + 14 = 47 B
    expect(udpSteps[3].tcpipMeta?.packetState.rawBytesLength).toBe(47);
  });

  it('verifies bottom-up decapsulation at the destination', () => {
    const steps = getTcpipSteps('fr', 'TCP', 'Ethernet');

    // Step 9: Server receives frame and strips L1 Ethernet
    expect(steps[8].tcpipMeta?.direction).toBe('decapsulation');
    expect(steps[8].tcpipMeta?.packetState.rawBytesLength).toBe(45); // IP datagram remaining

    // Step 10: Server strips L2 IPv4 header
    expect(steps[9].tcpipMeta?.direction).toBe('decapsulation');
    expect(steps[9].tcpipMeta?.packetState.rawBytesLength).toBe(25); // TCP segment remaining

    // Step 11: Server strips L3 TCP header
    expect(steps[10].tcpipMeta?.direction).toBe('decapsulation');
    expect(steps[10].tcpipMeta?.packetState.rawBytesLength).toBe(5); // App data remaining

    // Step 12: Final message delivered
    expect(steps[11].tcpipMeta?.direction).toBe('decapsulation');
    expect(steps[11].tcpipMeta?.packetState.applicationData).toBe(TCPIP_PAYLOAD_TEXT);
  });
});
