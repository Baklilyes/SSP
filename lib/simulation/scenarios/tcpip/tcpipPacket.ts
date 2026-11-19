import { PacketBuilder, assembleLayers } from '../../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../../packet/builders/ipv4';
import { buildTcpSegment } from '../../../packet/builders/tcp';
import { DissectedFrame } from '../../../packet/types';
import { TCPIPLayerNumber } from './tcpipLayers';

export interface TCPIPEncapsulationState {
  applicationData: string;
  transportType: 'TCP' | 'UDP';
  networkAccessType: 'Ethernet' | 'Wi-Fi';
  transportHeader?: {
    protocol: 'TCP' | 'UDP';
    sourcePort: number;
    destinationPort: number;
    seq?: number;
    flags?: string;
    lengthBytes: number;
  };
  networkHeader?: {
    version: 4;
    sourceIP: string;
    destinationIP: string;
    ttl: number;
    protocol: string;
    lengthBytes: number;
  };
  networkAccessHeader?: {
    sourceMAC: string;
    destinationMAC: string;
    etherType: string;
    technology: 'Ethernet' | 'Wi-Fi';
    lengthBytes: number;
  };
  routerHopCount?: number;
  physicalBits?: string;
  currentLayer: TCPIPLayerNumber;
  direction: 'encapsulation' | 'transmission' | 'routing' | 'decapsulation';
  rawBytesLength: number;
}

export const TCPIP_CLIENT_MAC = '00:1A:2B:3C:4D:5E';
export const TCPIP_ROUTER1_IN_MAC = '00:22:33:44:55:66';
export const TCPIP_ROUTER1_OUT_MAC = '00:22:33:44:55:77';
export const TCPIP_ROUTER2_IN_MAC = '00:77:88:99:AA:BB';
export const TCPIP_ROUTER2_OUT_MAC = '00:77:88:99:AA:CC';
export const TCPIP_SERVER_MAC = '00:BB:CC:DD:EE:FF';

export const TCPIP_CLIENT_IP = '192.168.1.10';
export const TCPIP_ROUTER1_IP = '192.168.1.1';
export const TCPIP_ROUTER2_IP = '10.0.0.1';
export const TCPIP_SERVER_IP = '10.0.0.20';

export const TCPIP_CLIENT_PORT = 49152;
export const TCPIP_SERVER_PORT = 80;

export const TCPIP_PAYLOAD_TEXT = 'Hello';
export const TCPIP_PAYLOAD_BITS = '01001000 01100101 01101100 01101100 01101111';

/**
 * Construit les couches disséquées pour le modèle TCP/IP
 */
export function buildTcpipDissectedFrames(
  transport: 'TCP' | 'UDP' = 'TCP',
  networkAccess: 'Ethernet' | 'Wi-Fi' = 'Ethernet'
): {
  appFrame: DissectedFrame;
  transportFrame: DissectedFrame;
  networkFrame: DissectedFrame;
  fullFrame: DissectedFrame;
} {
  // 1. Couche 4 Application : Message brut "Hello"
  const appBuilder = new PacketBuilder('app', 'Application Data');
  appBuilder.field('Payload Data', 'Hello (5 octets)', () => {
    appBuilder.ascii(TCPIP_PAYLOAD_TEXT);
  });
  const appFrame = assembleLayers([appBuilder]);

  // 2. Couche 3 Transport : En-tête TCP (20 B) ou UDP (8 B) + Données
  let transportBuilder: PacketBuilder;
  if (transport === 'TCP') {
    transportBuilder = buildTcpSegment({
      srcPort: TCPIP_CLIENT_PORT,
      dstPort: TCPIP_SERVER_PORT,
      seq: 1000,
      ack: 0,
      flags: { psh: true, ack: true },
      payloadLength: 5,
    });
    transportBuilder.ascii(TCPIP_PAYLOAD_TEXT);
  } else {
    transportBuilder = new PacketBuilder('udp', 'UDP (User Datagram Protocol)');
    transportBuilder.field('Source Port', String(TCPIP_CLIENT_PORT), () => {
      transportBuilder.u16(TCPIP_CLIENT_PORT);
    });
    transportBuilder.field('Destination Port', String(TCPIP_SERVER_PORT), () => {
      transportBuilder.u16(TCPIP_SERVER_PORT);
    });
    transportBuilder.field('Length', '13 octets', () => {
      transportBuilder.u16(13); // 8 header + 5 data
    });
    transportBuilder.field('Checksum', '0x1A2B', () => {
      transportBuilder.u16(0x1a2b);
    });
    transportBuilder.ascii(TCPIP_PAYLOAD_TEXT);
  }
  const transportFrame = assembleLayers([transportBuilder]);

  // 3. Couche 2 Internet : En-tête IPv4 (20 B) + Transport + Données
  const ipBuilder = buildIpv4Packet({
    srcIp: TCPIP_CLIENT_IP,
    dstIp: TCPIP_SERVER_IP,
    protocol: transport === 'TCP' ? 6 : 17,
    payloadLength: transportBuilder.length,
    ttl: 64,
  });
  const networkFrame = assembleLayers([ipBuilder, transportBuilder]);

  // 4. Couche 1 Hôte-Réseau : En-tête Ethernet II (14 B) + IP + Transport + Données
  const ethBuilder = buildEthernetFrame({
    srcMac: TCPIP_CLIENT_MAC,
    dstMac: TCPIP_ROUTER1_IN_MAC,
    etherType: 0x0800, // IPv4
  });
  const fullFrame = assembleLayers([ethBuilder, ipBuilder, transportBuilder]);

  return {
    appFrame,
    transportFrame,
    networkFrame,
    fullFrame,
  };
}
