import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { ipv4ToBytes } from '../../packet/formatters';

const STB_MAC = '00:1a:2b:44:55:66';
const ROUTER_MAC = '00:22:33:44:55:66';
const MULTICAST_MAC = '01:00:5e:7f:00:01';

const STB_IP = '192.168.1.180';
const ROUTER_IP = '192.168.1.1';
const MULTICAST_GROUP = '239.255.0.1'; // Groupe Multicast de la chaîne TV
const ALL_SYSTEMS = '224.0.0.1';

// 1. Membership Query (Router -> All Systems)
const queryIgmp = new PacketBuilder('igmp', 'IGMPv2 Membership Query');
queryIgmp.field('Type', '0x11 (Membership Query)', () => queryIgmp.u8(0x11), { heading: true });
queryIgmp.field('Max Response Time', '100 (10.0 sec)', () => queryIgmp.u8(100));
queryIgmp.field('Checksum', '0xee9b', () => queryIgmp.u16(0xee9b));
queryIgmp.field('Multicast Group Address', '0.0.0.0 (General Query)', () => queryIgmp.raw([0, 0, 0, 0]));
const queryIp = buildIpv4Packet({ srcIp: ROUTER_IP, dstIp: ALL_SYSTEMS, protocol: 2, payloadLength: queryIgmp.length, ttl: 1 });
const eth1 = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: '01:00:5e:00:00:01' });
const frame1 = assembleLayers([eth1, queryIp, queryIgmp]);

// 2. Membership Report (STB -> Multicast Group)
const reportIgmp = new PacketBuilder('igmp', `IGMPv2 Membership Report: ${MULTICAST_GROUP}`);
reportIgmp.field('Type', '0x16 (Membership Report)', () => reportIgmp.u8(0x16), { heading: true });
reportIgmp.field('Max Response Time', '0', () => reportIgmp.u8(0));
reportIgmp.field('Checksum', '0x09fc', () => reportIgmp.u16(0x09fc));
reportIgmp.field('Multicast Group Address', MULTICAST_GROUP, () => reportIgmp.raw(ipv4ToBytes(MULTICAST_GROUP)), {
  note: 'Souscription au flux vidéo de la chaîne TV demandée',
});
const reportIp = buildIpv4Packet({ srcIp: STB_IP, dstIp: MULTICAST_GROUP, protocol: 2, payloadLength: reportIgmp.length, ttl: 1 });
const eth2 = buildEthernetFrame({ srcMac: STB_MAC, dstMac: MULTICAST_MAC });
const frame2 = assembleLayers([eth2, reportIp, reportIgmp]);

// 3. Multicast UDP Video Stream (Router -> STB)
const videoData = new PacketBuilder('mpegts', 'MPEG-TS Video Data').ascii('MPEG_TRANSPORT_STREAM_VIDEO_PACKET');
const videoUdp = buildUdpDatagram({ srcPort: 1234, dstPort: 1234, payloadLength: videoData.length });
const videoIp = buildIpv4Packet({ srcIp: '198.51.100.99', dstIp: MULTICAST_GROUP, protocol: 17, payloadLength: videoUdp.length + videoData.length });
const frame3 = assembleLayers([eth1, videoIp, videoUdp, videoData]);

export const igmpProtocol: ProtocolDefinition = {
  id: 'igmp',
  name: 'IGMP',
  title: 'Multicast TV & Video Streaming',
  layer: 3,
  group: 'core',
  nodes: ['stb', 'router', 'isp'],
  legend: [
    ['blue', 'Requête d’adhésion (Query)'],
    ['amber', 'Souscription au canal TV (Report)'],
    ['green', 'Flux Vidéo Multicast (UDP)'],
  ],
  overview: {
    full: 'Internet Group Management Protocol',
    description:
      'IGMP permet aux hôtes locaux d’indiquer à leur routeur d’accès à quels groupes multicast ils souhaitent s’abonner, évitant d’inonder le réseau avec des flux vidéo ou TV non sollicités.',
    facts: [
      ['Couche OSI', 'Réseau (Couche 3)'],
      ['Encapsulation', 'Directement dans IP (Protocole 2)'],
      ['Plage IP Multicast', 'Classe D (224.0.0.0 à 239.255.255.255)'],
      ['Mécanisme clé', 'IGMP Snooping sur commutateurs Ethernet'],
      ['Standard', 'RFC 2236 (IGMPv2)'],
    ],
  },
  steps: [
    {
      title: 'Requête Générale de Voisinage (Query)',
      desc: 'Le routeur interroge les abonnés actifs',
      detail:
        'Périodiquement, le routeur émet un paquet IGMP Membership Query vers l’adresse multicast 224.0.0.1 (tous les systèmes) pour savoir quelles chaînes ou flux sont encore regardés.',
      facts: [
        ['Type', '0x11 (General Query)'],
        ['TTL', '1 (Strictement limité au réseau local)'],
      ],
      events: [
        { type: 'show', nodes: ['stb', 'router', 'isp'], frame: 'full' },
        {
          type: 'packet',
          from: 'router',
          to: 'stb',
          color: 'blue',
          label: 'IGMP QUERY',
          row: { time: '0.000 s', src: ROUTER_IP, dst: ALL_SYSTEMS, proto: 'IGMP', info: 'Membership Query, general', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Souscription au Flux TV (Membership Report)',
      desc: 'Le décodeur TV rejoint le groupe multicast',
      detail:
        'L’utilisateur change de chaîne sur sa télécommande. Le décodeur TV (STB) émet un rapport IGMPv2 pour rejoindre le groupe multicast de la chaîne 239.255.0.1.',
      facts: [
        ['Type', '0x16 (Membership Report)'],
        ['Groupe', MULTICAST_GROUP],
      ],
      events: [
        {
          type: 'packet',
          from: 'stb',
          to: 'router',
          color: 'amber',
          label: 'IGMP REPORT',
          row: { time: '0.005 s', src: STB_IP, dst: MULTICAST_GROUP, proto: 'IGMP', info: `Membership Report: ${MULTICAST_GROUP}`, len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Acheminement du Flux Vidéo MPEG-TS',
      desc: 'Le flux TV haute définition est distribué',
      detail:
        'Ayant enregistré l’abonnement, le routeur transfère les paquets de flux vidéo UDP émis par la tête de réseau TV vers le décodeur.',
      facts: [
        ['Protocole', 'UDP Multicast sur port 1234'],
        ['Format', 'MPEG-TS (Transport Stream) H.264/AAC'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'stb',
          color: 'green',
          label: 'MPEG-TS VIDEO',
          row: { time: '0.015 s', src: '198.51.100.99', dst: MULTICAST_GROUP, proto: 'UDP', info: 'MPEG-TS Video Packet (Stream 1)', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
