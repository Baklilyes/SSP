import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { buildDnsPacket } from '../../packet/builders/dns';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const DNS_IP = '8.8.8.8';

// 1. Query with DO=1 (DNSSEC OK)
const dnssecQ = buildDnsPacket({ id: 0x5a1b, qr: false, queryName: 'example.com' });
const edns = new PacketBuilder('edns', 'EDNS0 Option: DO=1 (DNSSEC OK)');
edns.field('Option Code', '0 (EDNS0)', () => edns.u16(0));
edns.field('Payload Size', '4096 bytes', () => edns.u16(4096));
edns.field('Z / DO Flag', '0x8000 (DNSSEC OK: 1)', () => edns.u16(0x8000), {
  note: 'Indique au résolveur que le client exige la réception des signatures RRSIG',
});
dnssecQ.append(edns);

const u1 = buildUdpDatagram({ srcPort: 51900, dstPort: 53, payloadLength: dnssecQ.length });
const ip1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: DNS_IP, protocol: 17, payloadLength: u1.length + dnssecQ.length });
const eth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frame1 = assembleLayers([eth1, ip1, u1, dnssecQ]);

// 2. Reply with RRSIG signature
const dnssecR = buildDnsPacket({ id: 0x5a1b, qr: true, queryName: 'example.com', answerIp: '93.184.216.34' });
const rrsig = new PacketBuilder('rrsig', 'RRSIG Resource Record');
rrsig.field('Type Covered', '1 (A Record)', () => rrsig.u16(1));
rrsig.field('Algorithm', '13 (ECDSA P-256 with SHA-256)', () => rrsig.u8(13));
rrsig.field('Labels', '2', () => rrsig.u8(2));
rrsig.field('Original TTL', '86400', () => rrsig.u32(86400));
rrsig.field('Signature Expiration', '2026-11-30 00:00:00', () => rrsig.u32(1796000000));
rrsig.field('Key Tag', '0x3a4f (14927)', () => rrsig.u16(0x3a4f));
rrsig.field('Signer Name', 'example.com', () => rrsig.ascii('example.com\0'));
rrsig.field('Cryptographic Signature', '64 bytes (ECDSA R+S)', () => rrsig.unknown(64), {
  note: 'Signature mathématique garantissant que l’adresse IP 93.184.216.34 n’a pas été falsifiée',
});
dnssecR.append(rrsig);

const u2 = buildUdpDatagram({ srcPort: 53, dstPort: 51900, payloadLength: dnssecR.length });
const ip2 = buildIpv4Packet({ srcIp: DNS_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: u2.length + dnssecR.length });
const eth2 = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame2 = assembleLayers([eth2, ip2, u2, dnssecR]);

export const dnssecProtocol: ProtocolDefinition = {
  id: 'dnssec',
  name: 'DNSSEC',
  title: 'Cryptographically Signed DNS Records',
  layer: 7,
  group: 'security',
  nodes: ['client', 'router', 'dns'],
  legend: [
    ['blue', 'Requête DNSSEC (Flag DO=1)'],
    ['green', 'Réponse Signée (A + RRSIG)'],
  ],
  overview: {
    full: 'DNS Security Extensions (RFC 4033)',
    description:
      'DNSSEC protège l’intégrité du DNS grâce à des signatures numériques à clé publique (RRSIG). Il empêche les attaques par empoisonnement de cache (DNS Cache Poisoning) en établissant une chaîne de confiance depuis la racine mondiale.',
    facts: [
      ['Couche OSI', 'Application / Sécurité (Couche 7)'],
      ['Enregistrements clés', 'RRSIG (Signature), DNSKEY (Clé publique), DS (Délégation signée)'],
      ['Algorithmes', 'ECDSA Curve P-256, Ed25519, RSA/SHA-256'],
      ['Protection', 'Intégrité et authenticité des données (non confidentiel)'],
      ['Standards', 'RFC 4033, RFC 4034, RFC 4035'],
    ],
  },
  steps: [
    {
      title: 'Requête avec indicateur DO (DNSSEC OK)',
      desc: 'Le client demande les signatures de validation',
      detail:
        'Le client envoie sa requête DNS avec l’extension EDNS0 contenant le drapeau DO (DNSSEC OK) activé pour notifier le résolveur qu’il doit inclure les signatures RRSIG.',
      facts: [
        ['Extension', 'EDNS0 (RFC 6891)'],
        ['Flag DO', '1 (DNSSEC OK)'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'dns'], frame: 'lookup' },
        {
          type: 'packet',
          from: 'client',
          to: 'dns',
          color: 'blue',
          label: 'DNSSEC QUERY',
          row: { time: '0.000 s', src: CLIENT_IP, dst: DNS_IP, proto: 'DNS', info: 'Query A example.com + DO bit (DNSSEC OK)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Réponse Signée (RRSIG)',
      desc: 'Réception de l’adresse et de la signature ECDSA',
      detail:
        'La réponse contient l’enregistrement A associé à l’enregistrement RRSIG. Le résolveur vérifie la signature avec la clé DNSKEY de la zone, elle-même validée par le condensé DS de la zone parent .com.',
      facts: [
        ['Algorithme signature', 'ECDSA P-256 SHA-256 (Alg 13)'],
        ['Chaîne de confiance', 'Validée jusqu’à la clé racine mondiale (.)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'dns',
          to: 'client',
          color: 'green',
          label: 'RRSIG ANSWER',
          row: { time: '0.015 s', src: DNS_IP, dst: CLIENT_IP, proto: 'DNS', info: 'Answer A 93.184.216.34 + RRSIG (ECDSA Verified)', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
  ],
};
