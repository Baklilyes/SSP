import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const IPSEC_GW_IP = '198.51.100.50';

// 1. IKE_SA_INIT (UDP port 500)
const ikeInit = new PacketBuilder('ike', 'IKEv2 IKE_SA_INIT Request');
ikeInit.field('Initiator SPI', '0x1234567890abcdef', () => ikeInit.u32(0x12345678).u32(0x90abcdef));
ikeInit.field('Responder SPI', '0x0000000000000000', () => ikeInit.u32(0).u32(0));
ikeInit.field('Next Payload', '33 (Security Association - SA)', () => ikeInit.u8(33));
ikeInit.field('Major / Minor Version', '2.0 (IKEv2)', () => ikeInit.u8(0x20));
ikeInit.field('Exchange Type', '34 (IKE_SA_INIT)', () => ikeInit.u8(34), { heading: true });
ikeInit.field('Flags', '0x08 (Initiator)', () => ikeInit.u8(0x08));
ikeInit.field('Message ID', '0', () => ikeInit.u32(0));
ikeInit.field('Length', '320 bytes', () => ikeInit.u32(320));
ikeInit.field('Payload: Key Exchange (KE)', 'Curve25519 Ephemeral Public Key (32 bytes)', () => ikeInit.unknown(32));
ikeInit.field('Payload: Nonce (Ni)', '32 random bytes', () => ikeInit.unknown(32));
const ikeUdp1 = buildUdpDatagram({ srcPort: 500, dstPort: 500, payloadLength: ikeInit.length });
const ikeIp1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: IPSEC_GW_IP, protocol: 17, payloadLength: ikeUdp1.length + ikeInit.length });
const ethC = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const ethS = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame1 = assembleLayers([ethC, ikeIp1, ikeUdp1, ikeInit]);

// 2. IKE_SA_INIT Response
const ikeResp = new PacketBuilder('ike', 'IKEv2 IKE_SA_INIT Response');
ikeResp.field('Exchange Type', '34 (IKE_SA_INIT)', () => ikeResp.u8(34), { heading: true });
ikeResp.field('Flags', '0x20 (Response)', () => ikeResp.u8(0x20));
ikeResp.field('Payload: Key Exchange (KE)', 'Server Curve25519 Public Key', () => ikeResp.unknown(32));
ikeResp.field('Payload: Nonce (Nr)', 'Server Nonce (32 bytes)', () => ikeResp.unknown(32));
const ikeUdp2 = buildUdpDatagram({ srcPort: 500, dstPort: 500, payloadLength: ikeResp.length });
const ikeIp2 = buildIpv4Packet({ srcIp: IPSEC_GW_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: ikeUdp2.length + ikeResp.length });
const frame2 = assembleLayers([ethS, ikeIp2, ikeUdp2, ikeResp]);

// 3. ESP Tunnel Data (Protocol 50)
const esp = new PacketBuilder('esp', 'IPsec ESP (Encapsulating Security Payload)');
esp.field('Security Parameters Index (SPI)', '0x0a1b2c3d', () => esp.u32(0x0a1b2c3d), { heading: true });
esp.field('Sequence Number', '1', () => esp.u32(1));
esp.field('Encrypted IP Packet & Payload', '1350 bytes (AES-256-GCM)', () => esp.unknown(1350), {
  note: 'Paquet IP interne privé entièrement dissimulé et chiffré',
});
esp.field('Authentication ICV / Tag', '16 bytes (GCM Tag)', () => esp.unknown(16));
const espIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: IPSEC_GW_IP, protocol: 50, payloadLength: esp.length });
const frame3 = assembleLayers([ethC, espIp, esp]);

export const ipsecProtocol: ProtocolDefinition = {
  id: 'ipsec',
  name: 'IPsec',
  title: 'IKEv2 & ESP Secure Tunnels',
  layer: 3,
  group: 'security',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['amber', 'Négociation IKE_SA_INIT (UDP 500)'],
    ['blue', 'Réponse IKEv2'],
    ['green', 'Tunnel ESP Chiffré (IP Proto 50)'],
  ],
  overview: {
    full: 'Internet Protocol Security (RFC 4301)',
    description:
      'IPsec sécurise les échanges au niveau de la couche réseau (Couche 3). Il comprend le protocole de négociation IKEv2 (port UDP 500) et le protocole d’encapsulation chiffrée ESP (protocole IP 50).',
    facts: [
      ['Couche OSI', 'Réseau / Tunnel (Couche 3)'],
      ['Composants', 'IKEv2 (Négociation des clés) et ESP (Chiffrement des données)'],
      ['Protocoles IP', 'UDP 500 / 4500 (IKE) et Protocole IP 50 (ESP)'],
      ['Modes', 'Tunnel (chiffrement complet du paquet IP) ou Transport'],
      ['Standard', 'RFC 4301, RFC 7296 (IKEv2)'],
    ],
  },
  steps: [
    {
      title: 'IKE_SA_INIT (Négociation IKEv2)',
      desc: 'Échange de clés Diffie-Hellman sur le port UDP 500',
      detail:
        'Le client contacte la passerelle VPN IPsec pour ouvrir l’association de sécurité IKE SA. Les deux extrémités s’échangent des clés éphémères et des nonces aléatoires.',
      facts: [
        ['Port', 'UDP 500'],
        ['Échange', 'IKE_SA_INIT'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'IKE_SA_INIT',
          row: { time: '0.000 s', src: CLIENT_IP, dst: IPSEC_GW_IP, proto: 'IKEv2', info: 'IKE_SA_INIT Request (Curve25519, Nonce)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'blue',
          label: 'IKE_SA_RESP',
          row: { time: '0.018 s', src: IPSEC_GW_IP, dst: CLIENT_IP, proto: 'IKEv2', info: 'IKE_SA_INIT Response', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Données Tunnelisées ESP (IP Protocol 50)',
      desc: 'Chiffrement intégral du trafic réseau',
      detail:
        'La session est établie. Tout paquet destiné au réseau privé distant est encapsulé dans un paquet ESP (IP Protocole 50) chiffré en AES-GCM avec vérification d’intégrité ICV.',
      facts: [
        ['Protocole IP', '50 (ESP - Encapsulating Security Payload)'],
        ['Chiffrement', 'AES-256-GCM'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'IPsec ESP [🔒]',
          row: { time: '0.035 s', src: CLIENT_IP, dst: IPSEC_GW_IP, proto: 'ESP', info: 'ESP (SPI: 0x0a1b2c3d, Seq: 1, Encrypted Tunnel)', len: `${frame3.bytes.length} B` },
          wire: frame3,
          locked: true,
        },
      ],
    },
  ],
};
