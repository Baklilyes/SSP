import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { PacketBuilder } from '../../packet/PacketBuilder';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const DNS_IP = '8.8.8.8';

// Payload UDP
const udpData1 = new PacketBuilder('app', 'DNS Query Payload').ascii('UDP_FAST_QUERY_PAYLOAD');
const udpHdr1 = buildUdpDatagram({ srcPort: 51234, dstPort: 53, payloadLength: udpData1.length });
const udpIp1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: DNS_IP, protocol: 17, payloadLength: udpHdr1.length + udpData1.length });
const udpEth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const udpFrame1 = assembleLayers([udpEth1, udpIp1, udpHdr1, udpData1]);

const udpData2 = new PacketBuilder('app', 'DNS Reply Payload').ascii('UDP_FAST_REPLY_PAYLOAD');
const udpHdr2 = buildUdpDatagram({ srcPort: 53, dstPort: 51234, payloadLength: udpData2.length });
const udpIp2 = buildIpv4Packet({ srcIp: DNS_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: udpHdr2.length + udpData2.length });
const udpEth2 = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const udpFrame2 = assembleLayers([udpEth2, udpIp2, udpHdr2, udpData2]);

export const udpProtocol: ProtocolDefinition = {
  id: 'udp',
  name: 'UDP',
  title: 'User Datagram Protocol',
  layer: 4,
  group: 'core',
  nodes: ['client', 'router', 'dns'],
  legend: [
    ['amber', 'Datagramme Émis'],
    ['blue', 'Datagramme Reçu'],
  ],
  overview: {
    full: 'User Datagram Protocol',
    description:
      'UDP est un protocole de transport minimaliste sans connexion. Il transmet des datagrammes indépendants sans négociation préalable (0 RTT), sans accusé de réception et sans garantie d’ordre.',
    facts: [
      ['Couche OSI', 'Transport (Couche 4)'],
      ['En-tête', '8 octets seulement'],
      ['Mode', 'Sans état (Connectionless)'],
      ['Fiabilité', 'Meilleur effort (Best Effort)'],
      ['Cas d’usage', 'DNS, DHCP, streaming, jeux en temps réel, VoIP, QUIC'],
      ['Standard', 'RFC 768'],
    ],
  },
  outro: {
    title: 'Échange UDP achevé',
    desc: 'Simplicité et vitesse maximale',
    text:
      'Sans poignée de main initiale ni accusé de réception, les datagrammes UDP ont été transmis avec une surcharge minimale (8 octets d’en-tête), garantissant une latence incompressible.',
    facts: [
      ['Délai d’établissement', '0 ms (immédiat)'],
      ['Surcoût d’en-tête', '8 octets par paquet'],
      ['Complexité protocolaire', 'Minimale'],
    ],
  },
  steps: [
    {
      title: 'Envoi du Datagramme Client',
      desc: 'Émission immédiate sans poignée de main',
      detail:
        'Le client génère un datagramme UDP vers le port 53. Contrairement à TCP, aucun paquet SYN préalable n’est requis : les données utiles partent dès le tout premier paquet.',
      facts: [
        ['Port Source', '51234 (éphémère)'],
        ['Port Destination', '53 (DNS)'],
        ['En-tête UDP', 'Source, Dest, Longueur, Checksum (8 octets)'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'dns'], frame: 'lookup' },
        {
          type: 'packet',
          from: 'client',
          to: 'dns',
          color: 'amber',
          label: 'UDP DATAGRAM',
          row: { time: '0.000 s', src: CLIENT_IP, dst: DNS_IP, proto: 'UDP', info: '51234 → 53 Len=30', len: `${udpFrame1.bytes.length} B` },
          wire: udpFrame1,
        },
      ],
    },
    {
      title: 'Réponse Directe du Serveur',
      desc: 'Réception et transmission sans acquittement',
      detail:
        'Le résolveur distant traite le datagramme et renvoie immédiatement sa réponse. Chaque datagramme est totalement indépendant des précédents.',
      facts: [
        ['Statut', 'Délivré'],
        ['Contrôle de congestion', 'Aucun'],
        ['Temps d’aller-retour', '1 RTT pur'],
      ],
      events: [
        {
          type: 'packet',
          from: 'dns',
          to: 'client',
          color: 'blue',
          label: 'UDP REPLY',
          row: { time: '0.012 s', src: DNS_IP, dst: CLIENT_IP, proto: 'UDP', info: '53 → 51234 Len=30', len: `${udpFrame2.bytes.length} B` },
          wire: udpFrame2,
        },
      ],
    },
  ],
};
