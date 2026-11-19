import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';
import { buildBgpPacket } from '../../packet/builders/bgp';

const ISP_MAC = '00:11:22:33:44:55';
const TRANSIT_MAC = '00:66:77:88:99:aa';
const HOSTING_MAC = '00:bb:cc:dd:ee:ff';

const ISP_IP = '198.51.100.1';
const TRANSIT_IP = '198.51.100.2';
const HOSTING_IP = '198.51.100.3';
const BGP_PORT = 179;

// 1. BGP Open (ISP -> Transit)
const bgpOpen1 = buildBgpPacket({ type: 'open', myAs: 64500, bgpId: ISP_IP });
const tcpOpen1 = buildTcpSegment({ srcPort: 49152, dstPort: BGP_PORT, seq: 1000, ack: 5000, flags: { psh: true, ack: true }, payloadLength: bgpOpen1.length });
const ipOpen1 = buildIpv4Packet({ srcIp: ISP_IP, dstIp: TRANSIT_IP, protocol: 6, payloadLength: tcpOpen1.length + bgpOpen1.length });
const eth1 = buildEthernetFrame({ srcMac: ISP_MAC, dstMac: TRANSIT_MAC });
const frame1 = assembleLayers([eth1, ipOpen1, tcpOpen1, bgpOpen1]);

// 2. BGP Open Reply + Keepalive (Transit -> ISP)
const bgpOpen2 = buildBgpPacket({ type: 'open', myAs: 13335, bgpId: TRANSIT_IP });
const tcpOpen2 = buildTcpSegment({ srcPort: BGP_PORT, dstPort: 49152, seq: 5000, ack: 1000 + bgpOpen1.length, flags: { psh: true, ack: true }, payloadLength: bgpOpen2.length });
const ipOpen2 = buildIpv4Packet({ srcIp: TRANSIT_IP, dstIp: ISP_IP, protocol: 6, payloadLength: tcpOpen2.length + bgpOpen2.length });
const eth2 = buildEthernetFrame({ srcMac: TRANSIT_MAC, dstMac: ISP_MAC });
const frame2 = assembleLayers([eth2, ipOpen2, tcpOpen2, bgpOpen2]);

// 3. BGP Keepalive
const bgpKa = buildBgpPacket({ type: 'keepalive' });
const tcpKa = buildTcpSegment({ srcPort: 49152, dstPort: BGP_PORT, seq: 1000 + bgpOpen1.length, ack: 5000 + bgpOpen2.length, flags: { psh: true, ack: true }, payloadLength: bgpKa.length });
const ipKa = buildIpv4Packet({ srcIp: ISP_IP, dstIp: TRANSIT_IP, protocol: 6, payloadLength: tcpKa.length + bgpKa.length });
const frame3 = assembleLayers([eth1, ipKa, tcpKa, bgpKa]);

// 4. BGP Update (Route Advertisement: 203.0.113.0/24 via AS13335 -> AS15169)
const bgpUp = buildBgpPacket({ type: 'update', asPath: [13335, 15169], nextHop: TRANSIT_IP, nlriPrefix: '203.0.113.0/24' });
const tcpUp = buildTcpSegment({ srcPort: BGP_PORT, dstPort: 49152, seq: 5000 + bgpOpen2.length + bgpKa.length, ack: 1000 + bgpOpen1.length + bgpKa.length, flags: { psh: true, ack: true }, payloadLength: bgpUp.length });
const ipUp = buildIpv4Packet({ srcIp: TRANSIT_IP, dstIp: ISP_IP, protocol: 6, payloadLength: tcpUp.length + bgpUp.length });
const frame4 = assembleLayers([eth2, ipUp, tcpUp, bgpUp]);

export const bgpProtocol: ProtocolDefinition = {
  id: 'bgp',
  name: 'BGP',
  title: 'Internet Routes (Border Gateway Protocol)',
  layer: 7,
  group: 'core',
  nodes: ['isp', 'transit', 'hosting'],
  labels: {
    isp: ['Routeur du FAI', 'AS 64500'],
    transit: ['Routeur de transit', 'AS 64510'],
    hosting: ["Routeur de l'hébergeur", 'AS 64511'],
    web: ['https://ssp-academy.com/', '203.0.113.10'],
  },
  legend: [
    ['green', 'TCP'],
    ['blue', 'Session'],
    ['violet', 'Routes'],
    ['amber', "Les paquets de l'ordinateur"],
  ],
  overview: {
    full: 'Border Gateway Protocol (BGP-4)',
    description:
      'BGP est le protocole de routage inter-domaines qui unit l’Internet mondial. Il permet aux opérateurs de réseaux indépendants (Systèmes Autonomes - AS) d’échanger des tables de préfixes IP et de déterminer les meilleurs chemins de transit.',
    facts: [
      ['Couche OSI', 'Application / Routage Mondial (Couche 7)'],
      ['Transport', 'TCP (Port standard 179)'],
      ['Modèle', 'Vecteur de chemins (Path Vector Protocol)'],
      ['Attributs clés', 'AS_PATH, NEXT_HOP, ORIGIN, LOCAL_PREF, MED'],
      ['Standard', 'RFC 4271'],
    ],
  },
  outro: {
    title: 'ROUTE APPRISE',
    desc: 'Annoncée, relayée, utilisée',
    text:
      'Le réseau d’hébergement a annoncé ses adresses, le réseau de transit les a relayées en ajoutant son numéro, et le routeur du FAI a utilisé ce chemin pour les paquets de l’ordinateur. Quand la route a été retirée, la nouvelle s’est propagée de la même façon. Il n’y a pas de carte centrale : chaque réseau construit la sienne à partir de ce que disent ses voisins. Appuyez sur REVOIR pour tout revoir.',
    facts: [
      ['MESSAGES', 'OPEN, KEEPALIVE, UPDATE'],
      ['CHEMIN', '64510 64511'],
      ['CARTE', 'Chaque réseau fait la sienne'],
      ['PROTÉGER PAR', 'RPKI et filtres'],
    ],
  },
  steps: [
    {
      title: 'Ouverture de Session (Message OPEN)',
      desc: 'Négociation des identifiants et numéros d’AS',
      detail:
        'Après établissement de la connexion TCP sous-jacente sur le port 179, le routeur du FAI (AS64500) envoie son message BGP OPEN à son pair de transit (AS13335).',
      facts: [
        ['Mon Système Autonome', 'AS64500 (FAI local)'],
        ['BGP Identifier', '198.51.100.1'],
        ['Hold Time', '90 secondes'],
      ],
      events: [
        { type: 'show', nodes: ['isp', 'transit', 'hosting'], frame: 'full' },
        {
          type: 'packet',
          from: 'isp',
          to: 'transit',
          color: 'blue',
          label: 'BGP OPEN',
          row: { time: '0.000 s', src: ISP_IP, dst: TRANSIT_IP, proto: 'BGP', info: 'OPEN Message (My AS: 64500, Hold Time: 90)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
        {
          type: 'packet',
          from: 'transit',
          to: 'isp',
          color: 'blue',
          label: 'BGP OPEN REPLY',
          row: { time: '0.015 s', src: TRANSIT_IP, dst: ISP_IP, proto: 'BGP', info: 'OPEN Message (My AS: 13335, Hold Time: 90)', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Maintien de Voisinage (KEEPALIVE)',
      desc: 'Passage à l’état de voisinage BGP ESTABLISHED',
      detail:
        'Les deux routeurs confirment la validité des paramètres reçus par un message BGP KEEPALIVE de 19 octets. La session passe à l’état officiel ESTABLISHED.',
      facts: [
        ['Message', 'Type 4 (KEEPALIVE)'],
        ['État du peering', 'ESTABLISHED'],
      ],
      events: [
        {
          type: 'packet',
          from: 'isp',
          to: 'transit',
          color: 'amber',
          label: 'BGP KEEPALIVE',
          row: { time: '0.020 s', src: ISP_IP, dst: TRANSIT_IP, proto: 'BGP', info: 'KEEPALIVE Message', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
    {
      title: 'Annonce de Route (Message UPDATE)',
      desc: 'Propagation du préfixe réseau et des attributs de chemin',
      detail:
        'Le routeur de transit transmet une annonce BGP UPDATE informant son pair que le sous-réseau 203.0.113.0/24 est joignable via le chemin AS13335 → AS15169 avec NEXT_HOP 198.51.100.2.',
      facts: [
        ['Préfixe réseau (NLRI)', '203.0.113.0/24'],
        ['AS_PATH', 'AS13335 → AS15169 (Hébergeur Cloud)'],
        ['Prochain saut', '198.51.100.2'],
      ],
      events: [
        {
          type: 'packet',
          from: 'transit',
          to: 'isp',
          color: 'green',
          label: 'BGP UPDATE',
          row: { time: '0.035 s', src: TRANSIT_IP, dst: ISP_IP, proto: 'BGP', info: 'UPDATE: 203.0.113.0/24 [AS_PATH: 13335 15169]', len: `${frame4.bytes.length} B` },
          wire: frame4,
        },
      ],
    },
  ],
};
