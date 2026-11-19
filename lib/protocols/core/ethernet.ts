import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const LAN_MAC = '00:11:22:33:44:55';
const BROADCAST_MAC = 'ff:ff:ff:ff:ff:ff';

// ARP Request (Broadcast)
const arpReq = new PacketBuilder('arp', 'ARP Request (Who has 192.168.1.150?)');
arpReq.field('Hardware Type', '1 (Ethernet)', () => arpReq.u16(1));
arpReq.field('Protocol Type', '0x0800 (IPv4)', () => arpReq.u16(0x0800));
arpReq.field('Hardware / Protocol Size', 'MAC: 6, IP: 4', () => arpReq.u8(6).u8(4));
arpReq.field('Opcode', '1 (Request)', () => arpReq.u16(1), { heading: true });
arpReq.field('Sender MAC', CLIENT_MAC, () => arpReq.raw([0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]));
arpReq.field('Sender IP', '192.168.1.100', () => arpReq.raw([192, 168, 1, 100]));
arpReq.field('Target MAC', '00:00:00:00:00:00 (Inconnue)', () => arpReq.raw(Array(6).fill(0)));
arpReq.field('Target IP', '192.168.1.150', () => arpReq.raw([192, 168, 1, 150]));
const eth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: BROADCAST_MAC, etherType: 0x0806 });
const frame1 = assembleLayers([eth1, arpReq]);

// ARP Reply (Unicast)
const arpRep = new PacketBuilder('arp', 'ARP Reply (192.168.1.150 is at 00:11:22:33:44:55)');
arpRep.field('Opcode', '2 (Reply)', () => arpRep.u16(2), { heading: true });
arpRep.field('Sender MAC', LAN_MAC, () => arpRep.raw([0x00, 0x11, 0x22, 0x33, 0x44, 0x55]));
arpRep.field('Sender IP', '192.168.1.150', () => arpRep.raw([192, 168, 1, 150]));
arpRep.field('Target MAC', CLIENT_MAC, () => arpRep.raw([0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]));
arpRep.field('Target IP', '192.168.1.100', () => arpRep.raw([192, 168, 1, 100]));
const eth2 = buildEthernetFrame({ srcMac: LAN_MAC, dstMac: CLIENT_MAC, etherType: 0x0806 });
const frame2 = assembleLayers([eth2, arpRep]);

export const ethernetProtocol: ProtocolDefinition = {
  id: 'ethernet',
  name: 'Ethernet',
  title: 'Frames & Switches (Layer 2)',
  layer: 2,
  group: 'core',
  nodes: ['client', 'switch', 'lan'],
  legend: [
    ['amber', 'Trame Diffusion Broadcast (ARP)'],
    ['green', 'Trame Unicast Dirigée'],
  ],
  overview: {
    full: 'Ethernet II (IEEE 802.3)',
    description:
      'Ethernet est le standard universel des réseaux locaux câblés. Les commutateurs (switches) analysent les trames de 14 octets, apprennent les adresses MAC sur chaque port et acheminent le trafic sans collision.',
    facts: [
      ['Couche OSI', 'Liaison de données (Couche 2)'],
      ['Format d’adresse', 'MAC 48 bits (6 octets, ex: 00:1a:2b:3c:4d:5e)'],
      ['Taille de trame standard', '64 à 1518 octets (MTU 1500)'],
      ['Commutation', 'Table CAM (apprentissage automatique des adresses source)'],
      ['Standard', 'IEEE 802.3 / RFC 894'],
    ],
  },
  steps: [
    {
      title: 'Diffusion Broadcast (Apprentissage du Switch)',
      desc: 'Le commutateur inonde la trame sur tous les ports',
      detail:
        'Le client cherche à joindre 192.168.1.150 mais ignore son adresse physique MAC. Il émet une trame Ethernet adressée à FF:FF:FF:FF:FF:FF. Le switch enregistre la MAC du client sur le port 1 et retransmet la trame sur tous les autres ports.',
      facts: [
        ['Adresse destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
        ['Apprentissage switch', 'Port 1 ➔ MAC Client enregistrée'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'switch', 'lan'], frame: 'local' },
        {
          type: 'packet',
          from: 'client',
          to: 'switch',
          color: 'amber',
          label: 'ETH BROADCAST',
          row: { time: '0.000 s', src: CLIENT_MAC, dst: BROADCAST_MAC, proto: 'ARP', info: 'Who has 192.168.1.150? Tell 192.168.1.100', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
        {
          type: 'packet',
          from: 'switch',
          to: 'lan',
          color: 'amber',
          label: 'SWITCH FLOOD',
          row: { time: '0.001 s', src: CLIENT_MAC, dst: BROADCAST_MAC, proto: 'ARP', info: 'Flood to all ports except ingress', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Réponse Unicast Dirigée',
      desc: 'Commutation ciblée sans inondation',
      detail:
        'L’hôte local répond avec son adresse MAC. Le commutateur associe sa MAC au port 2 et transmet directement la trame au client sans inonder le réseau.',
      facts: [
        ['Type d’acheminement', 'Unicast ciblé (Port 2 ➔ Port 1)'],
        ['État du switch', 'Table MAC complète'],
      ],
      events: [
        {
          type: 'packet',
          from: 'lan',
          to: 'switch',
          color: 'green',
          label: 'ETH UNICAST',
          row: { time: '0.002 s', src: LAN_MAC, dst: CLIENT_MAC, proto: 'ARP', info: '192.168.1.150 is at 00:11:22:33:44:55', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
        {
          type: 'packet',
          from: 'switch',
          to: 'client',
          color: 'green',
          label: 'SWITCH FORWARD',
          row: { time: '0.003 s', src: LAN_MAC, dst: CLIENT_MAC, proto: 'ARP', info: 'Forwarded directly to port 1', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
  ],
};
