import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { buildDnsPacket } from '../../packet/builders/dns';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const DNS_IP = '8.8.8.8';
const ROOT_IP = '198.41.0.4';
const TLD_IP = '192.5.6.30';
const AUTH_IP = '198.51.100.53';
const TARGET_IP = '203.0.113.10';

// 1. Client -> Resolver
const q1 = buildDnsPacket({ id: 0x1a2b, qr: false, queryName: 'https://ssp-academy.com/' });
const u1 = buildUdpDatagram({ srcPort: 52143, dstPort: 53, payloadLength: q1.length });
const ip1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: DNS_IP, protocol: 17, payloadLength: u1.length + q1.length });
const eth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frame1 = assembleLayers([eth1, ip1, u1, q1]);

// 2. Resolver -> Root
const q2 = buildDnsPacket({ id: 0x2b3c, qr: false, queryName: 'https://ssp-academy.com/' });
const u2 = buildUdpDatagram({ srcPort: 60100, dstPort: 53, payloadLength: q2.length });
const ip2 = buildIpv4Packet({ srcIp: DNS_IP, dstIp: ROOT_IP, protocol: 17, payloadLength: u2.length + q2.length });
const eth2 = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: ROUTER_MAC });
const frame2 = assembleLayers([eth2, ip2, u2, q2]);

// 3. Root -> Resolver (Delegation to TLD)
const r3 = buildDnsPacket({ id: 0x2b3c, qr: true, queryName: 'https://ssp-academy.com/', answerIp: TLD_IP, ttl: 172800 });
const u3 = buildUdpDatagram({ srcPort: 53, dstPort: 60100, payloadLength: r3.length });
const ip3 = buildIpv4Packet({ srcIp: ROOT_IP, dstIp: DNS_IP, protocol: 17, payloadLength: u3.length + r3.length });
const frame3 = assembleLayers([eth2, ip3, u3, r3]);

// 4. Resolver -> Auth
const q4 = buildDnsPacket({ id: 0x3c4d, qr: false, queryName: 'https://ssp-academy.com/' });
const u4 = buildUdpDatagram({ srcPort: 60101, dstPort: 53, payloadLength: q4.length });
const ip4 = buildIpv4Packet({ srcIp: DNS_IP, dstIp: AUTH_IP, protocol: 17, payloadLength: u4.length + q4.length });
const frame4 = assembleLayers([eth2, ip4, u4, q4]);

// 5. Auth -> Resolver (Authoritative A record)
const r5 = buildDnsPacket({ id: 0x3c4d, qr: true, queryName: 'https://ssp-academy.com/', answerIp: TARGET_IP, ttl: 3600 });
const u5 = buildUdpDatagram({ srcPort: 53, dstPort: 60101, payloadLength: r5.length });
const ip5 = buildIpv4Packet({ srcIp: AUTH_IP, dstIp: DNS_IP, protocol: 17, payloadLength: u5.length + r5.length });
const frame5 = assembleLayers([eth2, ip5, u5, r5]);

// 6. Resolver -> Client (Final Answer)
const r6 = buildDnsPacket({ id: 0x1a2b, qr: true, queryName: 'https://ssp-academy.com/', answerIp: TARGET_IP, ttl: 3600 });
const u6 = buildUdpDatagram({ srcPort: 53, dstPort: 52143, payloadLength: r6.length });
const ip6 = buildIpv4Packet({ srcIp: DNS_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: u6.length + r6.length });
const eth6 = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame6 = assembleLayers([eth6, ip6, u6, r6]);

export const dnsProtocol: ProtocolDefinition = {
  id: 'dns',
  name: 'DNS',
  title: 'Hierarchical Name Resolution',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'dns', 'root', 'tld', 'auth'],
  legend: [
    ['blue', 'Requête Récursive Client'],
    ['amber', 'Résolution Itérative (Racine & TLD)'],
    ['green', 'Réponse Autorisée Finale'],
  ],
  overview: {
    full: 'Domain Name System',
    description:
      'DNS est l’annuaire universel d’Internet. Il convertit les noms de domaine compréhensibles pour l’humain (ex: example.com) en adresses IP numériques exploitables par les routeurs.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'UDP (port 53 par défaut), TCP pour transferts de zone (>512 B)'],
      ['Structure', 'Arborescence hiérarchique (. -> tld -> domaine)'],
      ['Enregistrements clés', 'A (IPv4), AAAA (IPv6), CNAME (Alias), MX (Mail), TXT, NS'],
      ['Standards', 'RFC 1034, RFC 1035'],
    ],
  },
  outro: {
    title: 'Résolution DNS accomplie',
    desc: 'De la racine au serveur autoritaire',
    text:
      'Le résolveur a interrogé la hiérarchie DNS mondiale : serveurs racine (.), serveurs de domaine de premier niveau (.com), puis serveurs autoritaires pour obtenir l’enregistrement A précis.',
    facts: [
      ['Nom résolu', 'https://ssp-academy.com/'],
      ['Adresse IP retournée', '203.0.113.10'],
      ['Durée de vie (TTL)', '3600 s (mise en cache locale)'],
    ],
  },
  steps: [
    {
      title: 'Requête Récursive Initiale',
      desc: 'Le client interroge son résolveur configuré',
      detail:
        'Le système d’exploitation envoie une requête DNS standard au résolveur récursif (8.8.8.8) avec le drapeau RD (Recursion Desired) activé pour https://ssp-academy.com/.',
      facts: [
        ['Question', 'https://ssp-academy.com/ (Type A)'],
        ['ID de transaction', '0x1a2b'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'dns'], frame: 'lookup' },
        {
          type: 'packet',
          from: 'client',
          to: 'dns',
          color: 'blue',
          label: 'DNS QUERY',
          row: { time: '0.000 s', src: CLIENT_IP, dst: DNS_IP, proto: 'DNS', info: 'Standard query A https://ssp-academy.com/', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Interrogation des Serveurs Racine',
      desc: 'Délégation vers le TLD correspondant',
      detail:
        'N’ayant pas la réponse en cache, le résolveur contacte un serveur racine de l’Internet. Celui-ci répond qu’il ne connaît pas l’adresse finale, mais oriente vers les serveurs du TLD .com.',
      facts: [
        ['Serveur racine contacté', '198.41.0.4 (a.root-servers.net)'],
        ['Délégation fournie', 'Enregistrement NS pour .com'],
      ],
      events: [
        { type: 'show', nodes: ['root'], frame: 'full' },
        {
          type: 'packet',
          from: 'dns',
          to: 'root',
          color: 'amber',
          label: 'ROOT QUERY',
          row: { time: '0.015 s', src: DNS_IP, dst: ROOT_IP, proto: 'DNS', info: 'Query A https://ssp-academy.com/', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
        {
          type: 'packet',
          from: 'root',
          to: 'dns',
          color: 'amber',
          label: 'ROOT REFERRAL',
          row: { time: '0.030 s', src: ROOT_IP, dst: DNS_IP, proto: 'DNS', info: 'Referral to .com TLD', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
    {
      title: 'Serveur Autoritaire & Réponse Finale',
      desc: 'Obtention de l’adresse IP définitive',
      detail:
        'Après avoir interrogé le serveur autoritaire ns1.example.com, le résolveur reçoit l’enregistrement A officiel (203.0.113.10) avec son TTL de 3600 secondes et le retourne au client.',
      facts: [
        ['Serveur autoritaire', '198.51.100.53'],
        ['Réponse faisant foi', 'A 203.0.113.10'],
      ],
      events: [
        { type: 'show', nodes: ['auth'], frame: 'full' },
        {
          type: 'packet',
          from: 'dns',
          to: 'auth',
          color: 'amber',
          label: 'AUTH QUERY',
          row: { time: '0.045 s', src: DNS_IP, dst: AUTH_IP, proto: 'DNS', info: 'Query A https://ssp-academy.com/', len: `${frame4.bytes.length} B` },
          wire: frame4,
        },
        {
          type: 'packet',
          from: 'auth',
          to: 'dns',
          color: 'green',
          label: 'AUTH ANSWER',
          row: { time: '0.060 s', src: AUTH_IP, dst: DNS_IP, proto: 'DNS', info: 'Answer A 203.0.113.10 (TTL=3600)', len: `${frame5.bytes.length} B` },
          wire: frame5,
        },
        {
          type: 'packet',
          from: 'dns',
          to: 'client',
          color: 'green',
          label: 'DNS ANSWER',
          row: { time: '0.075 s', src: DNS_IP, dst: CLIENT_IP, proto: 'DNS', info: 'Standard response A 203.0.113.10', len: `${frame6.bytes.length} B` },
          wire: frame6,
        },
      ],
    },
  ],
};
