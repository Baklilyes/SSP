import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildIcmpPacket } from '../../packet/builders/icmp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const ROUTER_IP = '192.168.1.1';
const WEB_IP = '203.0.113.10';

// 1. Ping Echo Request (client -> web)
const pingReqIcmp = buildIcmpPacket({ type: 8, seq: 1 });
const pingReqIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 1, payloadLength: pingReqIcmp.length, ttl: 64 });
const pingReqEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const pingReqFrame = assembleLayers([pingReqEth, pingReqIp, pingReqIcmp]);

// 2. Ping Echo Reply (web -> client)
const pingRepIcmp = buildIcmpPacket({ type: 0, seq: 1 });
const pingRepIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 1, payloadLength: pingRepIcmp.length, ttl: 58 });
const pingRepEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const pingRepFrame = assembleLayers([pingRepEth, pingRepIp, pingRepIcmp]);

// 3. TTL Exceeded (Traceroute probe with TTL=1 arriving at router)
const ttlExpIcmp = buildIcmpPacket({ type: 11, code: 0, seq: 2 });
const ttlExpIp = buildIpv4Packet({ srcIp: ROUTER_IP, dstIp: CLIENT_IP, protocol: 1, payloadLength: ttlExpIcmp.length, ttl: 64 });
const ttlExpEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const ttlExpFrame = assembleLayers([ttlExpEth, ttlExpIp, ttlExpIcmp]);

export const icmpProtocol: ProtocolDefinition = {
  id: 'icmp',
  name: 'ICMP',
  title: 'Network Diagnostics (Ping & Traceroute)',
  layer: 3,
  group: 'core',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['blue', 'Requête Echo (Type 8)'],
    ['green', 'Réponse Echo (Type 0)'],
    ['amber', 'TTL Dépassé (Type 11)'],
  ],
  overview: {
    full: 'Internet Control Message Protocol',
    description:
      'ICMP est le protocole de diagnostic et de notification d’erreurs de la couche réseau IPv4. Utilisé par les utilitaires `ping` et `traceroute`, il informe les émetteurs des problèmes d’acheminement.',
    facts: [
      ['Couche OSI', 'Réseau (Couche 3)'],
      ['Encapsulation', 'Directement dans IP (Protocole 1)'],
      ['Commandes associées', 'ping, traceroute, pathping'],
      ['Messages courants', 'Echo Request (8), Echo Reply (0), Time Exceeded (11)'],
      ['Standard', 'RFC 792'],
    ],
  },
  outro: {
    title: 'Diagnostics réseau complétés',
    desc: 'Mesure de latence et découverte de routeurs',
    text:
      'L’échange ICMP a permis de valider la connectivité réseau de bout en bout (Round-Trip Time ~34 ms) et d’illustrer le mécanisme d’expiration du TTL exploité par traceroute pour cartographier les sauts.',
    facts: [
      ['Temps Aller-Retour (RTT)', '34 ms'],
      ['Perte de paquets', '0%'],
      ['Diagnostic', 'Liaison saine et fonctionnelle'],
    ],
  },
  steps: [
    {
      title: 'Émission d’une Requête Ping (Echo Request)',
      desc: 'Envoi d’un message ICMP Type 8',
      detail:
        'Le client génère un paquet ICMP Echo Request vers le serveur web distant 203.0.113.10. Le paquet contient un identifiant unique et un numéro de séquence pour mesurer le temps de trajet.',
      facts: [
        ['Type ICMP', '8 (Echo Request)'],
        ['Numéro de séquence', '1'],
        ['TTL initial', '64'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'blue',
          label: 'ECHO REQUEST',
          row: { time: '0.000 s', src: CLIENT_IP, dst: WEB_IP, proto: 'ICMP', info: 'Echo (ping) request id=1 seq=1', len: `${pingReqFrame.bytes.length} B` },
          wire: pingReqFrame,
        },
      ],
    },
    {
      title: 'Réception de la Réponse (Echo Reply)',
      desc: 'Réponse ICMP Type 0 du serveur cible',
      detail:
        'Le serveur web reçoit la requête, inverse les adresses IP et renvoie un paquet ICMP Echo Reply (Type 0) avec les mêmes données de charge utile.',
      facts: [
        ['Type ICMP', '0 (Echo Reply)'],
        ['Temps écoulé', '34 ms'],
        ['TTL reçu', '58 (6 sauts de routeurs traversés)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'ECHO REPLY',
          row: { time: '0.034 s', src: WEB_IP, dst: CLIENT_IP, proto: 'ICMP', info: 'Echo (ping) reply id=1 seq=1', len: `${pingRepFrame.bytes.length} B` },
          wire: pingRepFrame,
        },
      ],
    },
    {
      title: 'Mécanisme Traceroute (TTL Exceeded)',
      desc: 'Expiration du TTL et notification ICMP Type 11',
      detail:
        'Lors d’un traceroute, un paquet est émis avec un TTL délibérément bas (TTL=1). Le premier routeur décrémente le TTL à 0, détruit le paquet et renvoie une alerte ICMP Time Exceeded (Type 11).',
      facts: [
        ['Type ICMP', '11 (Time Exceeded in Transit)'],
        ['Rôle', 'Permet au client de découvrir l’adresse IP du routeur'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'amber',
          label: 'TTL EXCEEDED',
          row: { time: '0.045 s', src: ROUTER_IP, dst: CLIENT_IP, proto: 'ICMP', info: 'Time-to-live exceeded in transit (TTL=0)', len: `${ttlExpFrame.bytes.length} B` },
          wire: ttlExpFrame,
        },
      ],
    },
  ],
};
