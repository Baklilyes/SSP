import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { buildQuicPacket } from '../../packet/builders/quic';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const WEB_IP = '203.0.113.10';
const QUIC_PORT = 443;

// 1. QUIC Initial (Client -> Server)
const qInit = buildQuicPacket({ headerType: 'initial', destConnId: '8394c8f0', packetNumber: 0, payloadLength: 1162 });
const qInitUdp = buildUdpDatagram({ srcPort: 53991, dstPort: QUIC_PORT, payloadLength: qInit.length });
const qInitIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 17, payloadLength: qInitUdp.length + qInit.length });
const ethC = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const ethS = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame1 = assembleLayers([ethC, qInitIp, qInitUdp, qInit]);

// 2. QUIC Handshake / Initial Server Response (Server -> Client)
const qResp = buildQuicPacket({ headerType: 'handshake', destConnId: '514b6783', packetNumber: 0, payloadLength: 1040 });
const qRespUdp = buildUdpDatagram({ srcPort: QUIC_PORT, dstPort: 53991, payloadLength: qResp.length });
const qRespIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: qRespUdp.length + qResp.length });
const frame2 = assembleLayers([ethS, qRespIp, qRespUdp, qResp]);

// 3. Short Header 1-RTT STREAM Data (Client -> Server)
const qData1 = buildQuicPacket({ headerType: '1rtt', destConnId: '8394c8f0', packetNumber: 1, payloadLength: 320 });
const qDataUdp1 = buildUdpDatagram({ srcPort: 53991, dstPort: QUIC_PORT, payloadLength: qData1.length });
const qDataIp1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 17, payloadLength: qDataUdp1.length + qData1.length });
const frame3 = assembleLayers([ethC, qDataIp1, qDataUdp1, qData1]);

// 4. Short Header 1-RTT STREAM Response (Server -> Client)
const qData2 = buildQuicPacket({ headerType: '1rtt', destConnId: '514b6783', packetNumber: 1, payloadLength: 950 });
const qDataUdp2 = buildUdpDatagram({ srcPort: QUIC_PORT, dstPort: 53991, payloadLength: qData2.length });
const qDataIp2 = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: qDataUdp2.length + qData2.length });
const frame4 = assembleLayers([ethS, qDataIp2, qDataUdp2, qData2]);

export const quicProtocol: ProtocolDefinition = {
  id: 'quic',
  name: 'QUIC',
  title: 'HTTP/3 over UDP',
  layer: 4,
  group: 'core',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['amber', 'QUIC Initial (Long Header)'],
    ['blue', 'Handshake Server (Long Header)'],
    ['green', 'Données 1-RTT Protégées (Short Header)'],
  ],
  overview: {
    full: 'QUIC Transport Protocol (HTTP/3)',
    description:
      'QUIC est le protocole de transport Internet de nouvelle génération standardisé par l’IETF en 2021. Construit au-dessus d’UDP, il fusionne transport et sécurité TLS 1.3 en une seule négociation 1-RTT et élimine le blocage de tête de ligne.',
    facts: [
      ['Couche OSI', 'Transport / Sécurité (Couche 4)'],
      ['Transport sous-jacent', 'UDP (Port 443)'],
      ['Établissement', '1-RTT (Handshake combiné transport + TLS 1.3)'],
      ['Avantages clés', 'Zéro Head-of-Line Blocking, Migration de connexion, Faible latence'],
      ['Standards', 'RFC 9000, RFC 9001, RFC 9114 (HTTP/3)'],
    ],
  },
  outro: {
    title: 'Échange QUIC HTTP/3 achevé',
    desc: 'L’avenir du transport web en action',
    text:
      'En regroupant l’ouverture de transport et la négociation cryptographique en une seule étape sur UDP, QUIC a permis de transférer les flux HTTP/3 en divisant par deux le temps de connexion par rapport à TCP + TLS 1.2.',
    facts: [
      ['Délai de connexion', '1 RTT au lieu de 2 ou 3 RTT'],
      ['Tolérance aux coupures', 'Connexion préservée par Connection ID lors du passage Wi-Fi ↔ 4G/5G'],
      ['Multiplexage indépendant', 'La perte d’un paquet sur un flux ne bloque pas les autres'],
    ],
  },
  steps: [
    {
      title: 'Paquet Initial (Long Header)',
      desc: 'Émission combinée transport et poignée de main TLS 1.3',
      detail:
        'Le client envoie un paquet QUIC Initial sur le port UDP 443. Il contient le Destination Connection ID (DCID), un numéro de paquet et la trame CRYPTO contenant le Client Hello TLS 1.3. Pour prévenir l’amplification DDoS, le paquet est complété (padded) à au moins 1200 octets.',
      facts: [
        ['Type d’en-tête', 'Long Header : Initial'],
        ['Port Destination', 'UDP 443'],
        ['Taille minimale', '1200 octets (Anti-amplification)'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'QUIC INITIAL',
          row: { time: '0.000 s', src: CLIENT_IP, dst: WEB_IP, proto: 'QUIC', info: 'Initial, DCID=8394c8f0, CRYPTO[Client Hello]', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Réponse Serveur & Dérivation 1-RTT',
      desc: 'Confirmation de connexion et transmission des secrets',
      detail:
        'Le serveur retourne un paquet Handshake contenant le Server Hello et les extensions chiffrées dans sa trame CRYPTO. Les deux extrémités dérivent immédiatement les clés 1-RTT.',
      facts: [
        ['Type d’en-tête', 'Long Header : Handshake'],
        ['Statut', 'Clés d’application activées en 1 RTT'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'blue',
          label: 'QUIC HANDSHAKE',
          row: { time: '0.017 s', src: WEB_IP, dst: CLIENT_IP, proto: 'QUIC', info: 'Handshake, SCID=514b6783, CRYPTO[Server Hello]', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Flux de Données Protégés 1-RTT (Short Header)',
      desc: 'Multiplexage de flux indépendants sans blocage',
      detail:
        'Le client et le serveur basculent sur le Short Header (en-tête compact de seulement quelques octets). Les données HTTP/3 circulent dans des trames STREAM distinctes et chiffrées.',
      facts: [
        ['Format d’en-tête', 'Short Header (1-RTT Protected)'],
        ['Absence de HoL blocking', 'Chaque flux STREAM est ordonnancé isolément'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'QUIC STREAM [🔒]',
          row: { time: '0.025 s', src: CLIENT_IP, dst: WEB_IP, proto: 'QUIC', info: '1-RTT Short Header, STREAM[0] HTTP/3 GET /', len: `${frame3.bytes.length} B` },
          wire: frame3,
          locked: true,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'QUIC DATA [🔒]',
          row: { time: '0.042 s', src: WEB_IP, dst: CLIENT_IP, proto: 'QUIC', info: '1-RTT Short Header, STREAM[0] HTTP/3 200 OK', len: `${frame4.bytes.length} B` },
          wire: frame4,
          locked: true,
        },
      ],
    },
  ],
};
