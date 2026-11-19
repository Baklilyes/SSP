import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv6Packet } from '../../packet/builders/ipv6';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const MULTICAST_MAC = '33:33:00:00:00:02';

const CLIENT_LL = 'fe80::1a2b:3c4d:5e00';
const ROUTER_LL = 'fe80::0022:3344:5566';
const ALL_ROUTERS = 'ff02::2';
const CLIENT_GLOBAL = '2001:db8:1::1a2b:3c4d:5e00';
const WEB_GLOBAL = '2001:db8:ffff::10';

// 1. Router Solicitation (ICMPv6 Type 133)
const rsIcmp = new PacketBuilder('icmp6', 'ICMPv6 Router Solicitation');
rsIcmp.summary = 'Router Solicitation (Type 133)';
rsIcmp.field('Type', '133 (Router Solicitation)', () => rsIcmp.u8(133), { heading: true });
rsIcmp.field('Code', '0', () => rsIcmp.u8(0));
rsIcmp.field('Checksum', '0xa142', () => rsIcmp.u16(0xa142));
rsIcmp.field('Reserved', '0x00000000', () => rsIcmp.u32(0));
const rsIp = buildIpv6Packet({ srcIp: CLIENT_LL, dstIp: ALL_ROUTERS, nextHeader: 58, payloadLength: rsIcmp.length, hopLimit: 255 });
const eth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: MULTICAST_MAC, etherType: 0x86dd });
const frame1 = assembleLayers([eth1, rsIp, rsIcmp]);

// 2. Router Advertisement (ICMPv6 Type 134)
const raIcmp = new PacketBuilder('icmp6', 'ICMPv6 Router Advertisement');
raIcmp.summary = 'Router Advertisement (Prefix 2001:db8:1::/64)';
raIcmp.field('Type', '134 (Router Advertisement)', () => raIcmp.u8(134), { heading: true });
raIcmp.field('Code', '0', () => raIcmp.u8(0));
raIcmp.field('Checksum', '0xb231', () => raIcmp.u16(0xb231));
raIcmp.field('Cur Hop Limit', '64', () => raIcmp.u8(64));
raIcmp.field('Flags', '0x00 (Managed: 0, Other: 0 -> SLAAC active)', () => raIcmp.u8(0x00));
raIcmp.field('Router Lifetime', '1800 seconds', () => raIcmp.u16(1800));
raIcmp.field('Option: Prefix Information', '2001:db8:1::/64 (Valid: 30 days)', () => {
  raIcmp.u8(3); // Type 3 = Prefix Info
  raIcmp.u8(4); // Length 32 bytes
  raIcmp.u8(64); // Prefix length /64
  raIcmp.u8(0xc0); // Flags L=1, A=1 (Autonomous SLAAC)
  raIcmp.u32(2592000); // Valid Lifetime
  raIcmp.u32(604800);  // Preferred Lifetime
  raIcmp.u32(0); // Reserved
  raIcmp.raw([0x20, 0x01, 0x0d, 0xb8, 0x00, 0x01, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0, 0]);
});
const raIp = buildIpv6Packet({ srcIp: ROUTER_LL, dstIp: 'ff02::1', nextHeader: 58, payloadLength: raIcmp.length, hopLimit: 255 });
const eth2 = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: '33:33:00:00:00:01', etherType: 0x86dd });
const frame2 = assembleLayers([eth2, raIp, raIcmp]);

// 3. Global IPv6 Communication
const payload3 = new PacketBuilder('data', 'IPv6 Application Traffic').ascii('HELLO_IPV6_WORLD');
const dataIp = buildIpv6Packet({ srcIp: CLIENT_GLOBAL, dstIp: WEB_GLOBAL, nextHeader: 6, payloadLength: payload3.length, hopLimit: 64 });
const eth3 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC, etherType: 0x86dd });
const frame3 = assembleLayers([eth3, dataIp, payload3]);

export const ipv6Protocol: ProtocolDefinition = {
  id: 'ipv6',
  name: 'IPv6',
  title: 'Next-Gen Addressing & SLAAC',
  layer: 3,
  group: 'core',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['blue', 'Sollicitation Routeur (RS)'],
    ['amber', 'Annonce Routeur & Préfixe (RA)'],
    ['green', 'Trafic IPv6 Global Configuré'],
  ],
  overview: {
    full: 'Internet Protocol version 6',
    description:
      'IPv6 succède à IPv4 en offrant un espace d’adressage quasi inépuisable sur 128 bits, un en-tête simplifié à taille fixe de 40 octets et l’autoconfiguration d’adresses sans état (SLAAC).',
    facts: [
      ['Couche OSI', 'Réseau (Couche 3)'],
      ['Format d’adresse', '128 bits (16 octets, notation hexadécimale)'],
      ['Nombre d’adresses', '3.4 × 10^38 adresses'],
      ['Autoconfiguration', 'SLAAC (Stateless Address Autoconfiguration)'],
      ['Standard', 'RFC 8200'],
    ],
  },
  outro: {
    title: 'Connectivité IPv6 universelle établie',
    desc: 'Adresses 128 bits et routage sans NAT',
    text:
      'Grâce au protocole Neighbor Discovery et aux messages Router Advertisement, le client a configuré son adresse IPv6 globale sans aucun serveur DHCP, rétablissant la connectivité directe de bout en bout sans translation NAT.',
    facts: [
      ['Adresse IPv6 acquise', '2001:db8:1::1a2b:3c4d:5e00/64'],
      ['Passerelle', 'fe80::0022:3344:5566 (Lien Local)'],
      ['Architecture', 'Chaque appareil dispose d’une IP publique directe'],
    ],
  },
  steps: [
    {
      title: 'Sollicitation de Routeur (Router Solicitation)',
      desc: 'Le client interroge les routeurs du segment local',
      detail:
        'Dès la connexion physique, le client configure une adresse de lien local (fe80::...) et diffuse un paquet ICMPv6 Router Solicitation vers l’adresse de multicast ff02::2 (tous les routeurs IPv6).',
      facts: [
        ['Adresse source', 'fe80::1a2b:3c4d:5e00 (Lien-Local)'],
        ['Adresse destination', 'ff02::2 (Multicast Tous les Routeurs)'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router'], frame: 'local' },
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'blue',
          label: 'ROUTER SOLICIT',
          row: { time: '0.000 s', src: CLIENT_LL, dst: ALL_ROUTERS, proto: 'ICMPv6', info: 'Router Solicitation (Type 133)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Annonce de Routeur & Préfixe SLAAC',
      desc: 'Le routeur publie le préfixe réseau global',
      detail:
        'Le routeur répond par un Router Advertisement annonçant le préfixe public 2001:db8:1::/64. Le drapeau A (Autonomous) indique au client qu’il peut générer son adresse globale de façon autonome.',
      facts: [
        ['Préfixe réseau', '2001:db8:1::/64'],
        ['Méthode', 'SLAAC (Stateless Address Autoconfiguration)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'amber',
          label: 'ROUTER ADVERT',
          row: { time: '0.012 s', src: ROUTER_LL, dst: 'ff02::1', proto: 'ICMPv6', info: 'Router Advertisement: Prefix 2001:db8:1::/64', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Communication IPv6 Globale de Bout en Bout',
      desc: 'Échange direct sans passer par une passerelle NAT',
      detail:
        'Le client combine le préfixe reçu et son identifiant d’interface pour former son adresse 2001:db8:1::1a2b:3c4d:5e00. Il communique directement avec le serveur web mondial sans traduction NAT.',
      facts: [
        ['IP Source', '2001:db8:1::1a2b:3c4d:5e00'],
        ['IP Destination', '2001:db8:ffff::10'],
        ['Absence de NAT', 'Communication transparente de bout en bout'],
      ],
      events: [
        { type: 'show', nodes: ['web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'IPV6 TRAFFIC',
          row: { time: '0.030 s', src: CLIENT_GLOBAL, dst: WEB_GLOBAL, proto: 'IPv6', info: '2001:db8:1:: → 2001:db8:ffff::10 (No NAT)', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
