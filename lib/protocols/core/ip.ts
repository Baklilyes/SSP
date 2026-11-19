import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_LAN_MAC = '00:22:33:44:55:66';
const ROUTER_WAN_MAC = '00:77:88:99:aa:bb';
const WEB_MAC = '00:cc:dd:ee:ff:00';

const CLIENT_IP = '192.168.1.100';
const ROUTER_WAN_IP = '198.51.100.42';
const WEB_IP = '203.0.113.10';

// 1. Paquet IP quittant le client vers le routeur (LAN)
const ipPayload1 = new PacketBuilder('data', 'Data Payload').ascii('IPv4_PACKET_CONTENT');
const ipHdr1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: ipPayload1.length, ttl: 64, identification: 0x4a12 });
const eth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_LAN_MAC });
const frame1 = assembleLayers([eth1, ipHdr1, ipPayload1]);

// 2. Paquet IP routé sur le WAN (NAT + TTL décrémenté)
const ipPayload2 = new PacketBuilder('data', 'Data Payload').ascii('IPv4_PACKET_CONTENT');
const ipHdr2 = buildIpv4Packet({ srcIp: ROUTER_WAN_IP, dstIp: WEB_IP, protocol: 6, payloadLength: ipPayload2.length, ttl: 63, identification: 0x4a12 });
const eth2 = buildEthernetFrame({ srcMac: ROUTER_WAN_MAC, dstMac: WEB_MAC });
const frame2 = assembleLayers([eth2, ipHdr2, ipPayload2]);

export const ipProtocol: ProtocolDefinition = {
  id: 'ip',
  name: 'IP',
  title: 'Addressing & Routing (IPv4)',
  layer: 3,
  group: 'core',
  nodes: ['client', 'router', 'internet', 'web'],
  legend: [
    ['blue', 'Trafic Réseau Local (LAN)'],
    ['green', 'Trafic Routé & NAT (WAN)'],
  ],
  overview: {
    full: 'Internet Protocol version 4',
    description:
      'IPv4 est la colonne vertébrale du routage sur Internet. Il attribue des adresses logiques globales de 32 bits, gère la fragmentation et oriente chaque paquet à travers les routeurs intermédiaires vers sa destination.',
    facts: [
      ['Couche OSI', 'Réseau (Couche 3)'],
      ['Format d’adresse', '32 bits (4 octets, notation décimale pointée)'],
      ['Capacité d’adressage', '~4.29 milliards d’adresses'],
      ['En-tête de base', '20 octets (avec TTL et Checksum)'],
      ['Standard', 'RFC 791'],
    ],
  },
  outro: {
    title: 'Routage IPv4 accompli',
    desc: 'Interconnexion de réseaux hétérogènes',
    text:
      'Le paquet a traversé les frontières du réseau local privé vers le Web public : vérification de masque de sous-réseau, décrémentation du TTL, recalcul de somme de contrôle et réécriture NAT de l’adresse source.',
    facts: [
      ['Sauts réseau', 'Client LAN → Passerelle NAT → WAN Internet → Serveur cible'],
      ['Décrément TTL', '64 → 63 (détection de boucles)'],
      ['Intégrité', 'Somme de contrôle IP recalculée à chaque routeur'],
    ],
  },
  steps: [
    {
      title: 'Décision de Routage Locale',
      desc: 'Application du masque de sous-réseau',
      detail:
        'Le client compare 203.0.113.10 avec son propre sous-réseau (192.168.1.0/24). La cible étant hors du réseau local, le paquet est encapsulé dans une trame Ethernet adressée à la passerelle par défaut (Routeur 192.168.1.1).',
      facts: [
        ['Sous-réseau source', '192.168.1.0/24'],
        ['Adresse IP finale', '203.0.113.10 (Externe)'],
        ['Passerelle', '192.168.1.1'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router'], frame: 'local' },
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'blue',
          label: 'IP PKT (LAN)',
          row: { time: '0.000 s', src: CLIENT_IP, dst: WEB_IP, proto: 'IPv4', info: '192.168.1.100 → 203.0.113.10 TTL=64', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Routage & Traduction d’Adresse (NAT)',
      desc: 'Décrémentation du TTL et remplacement de l’adresse IP',
      detail:
        'Le routeur décrémente le champ Time to Live (TTL) de 64 à 63 pour prévenir les boucles de routage. Il effectue une traduction NAT pour substituer l’IP privée du client par son adresse publique WAN.',
      facts: [
        ['Nouveau TTL', '63'],
        ['IP Source WAN', '198.51.100.42'],
        ['Somme de contrôle', 'Recalculée immédiatement'],
      ],
      events: [
        { type: 'show', nodes: ['internet', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'router',
          to: 'web',
          color: 'green',
          label: 'IP PKT (WAN)',
          row: { time: '0.017 s', src: ROUTER_WAN_IP, dst: WEB_IP, proto: 'IPv4', info: '198.51.100.42 → 203.0.113.10 TTL=63 (NAT)', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
  ],
};
