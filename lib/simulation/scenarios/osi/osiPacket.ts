import { PacketBuilder, assembleLayers } from '../../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../../packet/builders/ipv4';
import { buildTcpSegment } from '../../../packet/builders/tcp';
import { DissectedFrame } from '../../../packet/types';
import { OSILayerNumber } from './osiLayers';

export interface OSIEncapsulationState {
  applicationData: string;
  presentationEncoding?: string;
  sessionToken?: string;
  transportHeader?: {
    protocol: 'TCP' | 'UDP';
    sourcePort: number;
    destinationPort: number;
    seq: number;
    flags: string;
  };
  networkHeader?: {
    version: 4;
    sourceIP: string;
    destinationIP: string;
    ttl: number;
    protocol: string;
  };
  dataLinkHeader?: {
    sourceMAC: string;
    destinationMAC: string;
    etherType: string;
  };
  physicalBits?: string;
  currentLayer: OSILayerNumber;
  direction: 'encapsulation' | 'transmission' | 'decapsulation';
  rawBytesLength: number;
}

export const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
export const ROUTER_MAC = '00:22:33:44:55:66';
export const SERVER_MAC = '00:bb:cc:dd:ee:ff';

export const CLIENT_IP = '192.168.1.100';
export const SERVER_IP = '203.0.113.10';

export const CLIENT_PORT = 49152;
export const SERVER_PORT = 80;

export const RAW_PAYLOAD_TEXT = 'Hello';
export const RAW_PAYLOAD_BYTES = [0x48, 0x65, 0x6c, 0x6c, 0x6f]; // "Hello" in UTF-8 / ASCII
export const RAW_PAYLOAD_BITS = '01001000 01100101 01101100 01101100 01101111';

/**
 * Construit les couches et trames décodées réelles pour l'inspection de paquets
 */
export function buildOsiDissectedFrames(): {
  appFrame: DissectedFrame;
  transportFrame: DissectedFrame;
  networkFrame: DissectedFrame;
  fullFrame: DissectedFrame;
} {
  // Couche 7 : Message brut "Hello"
  const appBuilder = new PacketBuilder('app', 'Application Data');
  appBuilder.field('Payload Data', 'Hello (5 octets)', () => {
    appBuilder.ascii('Hello');
  });
  const appFrame = assembleLayers([appBuilder]);

  // Couche 4 : TCP + Payload
  const tcpBuilder = buildTcpSegment({
    srcPort: CLIENT_PORT,
    dstPort: SERVER_PORT,
    seq: 1000,
    ack: 0,
    flags: { psh: true, ack: true },
    payloadLength: 5,
  });
  tcpBuilder.ascii('Hello');
  const transportFrame = assembleLayers([tcpBuilder]);

  // Couche 3 : IPv4 + TCP + Payload
  const ipBuilder = buildIpv4Packet({
    srcIp: CLIENT_IP,
    dstIp: SERVER_IP,
    protocol: 6, // TCP
    payloadLength: tcpBuilder.length,
    ttl: 64,
  });
  const networkFrame = assembleLayers([ipBuilder, tcpBuilder]);

  // Couche 2 : Ethernet + IPv4 + TCP + Payload
  const ethBuilder = buildEthernetFrame({
    srcMac: CLIENT_MAC,
    dstMac: ROUTER_MAC,
    etherType: 0x0800, // IPv4
  });
  const fullFrame = assembleLayers([ethBuilder, ipBuilder, tcpBuilder]);

  return {
    appFrame,
    transportFrame,
    networkFrame,
    fullFrame,
  };
}
