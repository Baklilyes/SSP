import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const PEER_MAC = '00:99:88:77:66:55';
const CLIENT_IP = '192.168.1.100';
const PEER_IP = '198.51.100.77';

// 1. STUN Binding Request (Discover public reflexive IP)
const stunReq = new PacketBuilder('stun', 'STUN Binding Request');
stunReq.field('Message Type', '0x0001 (Binding Request)', () => stunReq.u16(0x0001), { heading: true });
stunReq.field('Message Length', '0 bytes', () => stunReq.u16(0));
stunReq.field('Magic Cookie', '0x2112a442 (RFC 5389)', () => stunReq.u32(0x2112a442));
stunReq.field('Transaction ID', '0x7c4d123490abcdef', () => stunReq.u32(0x7c4d1234).u32(0x90abcdef));
const stunUdp = buildUdpDatagram({ srcPort: 54100, dstPort: 3478, payloadLength: stunReq.length });
const stunIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: '198.51.100.1 (STUN Server)', protocol: 17, payloadLength: stunUdp.length + stunReq.length });
const eth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: '00:22:33:44:55:66' });
const frame1 = assembleLayers([eth1, stunIp, stunUdp, stunReq]);

// 2. SRTP (Secure Real-Time Transport Protocol) Audio/Video Packet
const srtp = new PacketBuilder('srtp', 'SRTP Chiffré (Audio/Vidéo P2P)');
srtp.field('Version / Padding', 'V=2, P=0, X=0, CC=0', () => srtp.u8(0x80), { heading: true });
srtp.field('Payload Type', '111 (Opus Audio / H.264)', () => srtp.u8(111));
srtp.field('Sequence Number', '1042', () => srtp.u16(1042));
srtp.field('Timestamp', '0x1a2b3c4d', () => srtp.u32(0x1a2b3c4d));
srtp.field('SSRC Identifier', '0x99887766', () => srtp.u32(0x99887766));
srtp.field('Encrypted Media Payload', '160 bytes (AES-128-ICM)', () => srtp.unknown(160), {
  note: 'Flux audio/vidéo chiffré de bout en bout directement entre les navigateurs pairs',
});
srtp.field('Authentication Tag', '10 bytes', () => srtp.unknown(10));
const srtpUdp = buildUdpDatagram({ srcPort: 54100, dstPort: 54200, payloadLength: srtp.length });
const srtpIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: PEER_IP, protocol: 17, payloadLength: srtpUdp.length + srtp.length });
const frame2 = assembleLayers([eth1, srtpIp, srtpUdp, srtp]);

export const webrtcProtocol: ProtocolDefinition = {
  id: 'webrtc',
  name: 'WebRTC',
  title: 'Browser Video Calls (Peer-to-Peer)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'peer', 'lan'],
  legend: [
    ['amber', 'Découverte NAT (STUN)'],
    ['green', 'Flux Média Direct SRTP [🔒]'],
  ],
  overview: {
    full: 'Web Real-Time Communication (W3C / IETF)',
    description:
      'WebRTC permet aux navigateurs web d’échanger des flux audio, vidéo et de données arbitraires en direct de poste à poste (P2P), sans passer par un serveur de relais central une fois la session établie.',
    facts: [
      ['Couche OSI', 'Application / Transport Média (Couche 7)'],
      ['Transport', 'UDP (SRTP pour médias, SCTP sur DTLS pour DataChannels)'],
      ['Signalisation', 'SDP (Session Description Protocol)'],
      ['Traversée de NAT', 'ICE, STUN (RFC 5389), TURN (RFC 5766)'],
      ['Sécurité', 'Chiffrement obligatoire de bout en bout (DTLS-SRTP)'],
    ],
  },
  steps: [
    {
      title: 'Découverte de Candidats ICE via STUN',
      desc: 'Détermination de l’adresse IP et du port public réflexif',
      detail:
        'Le navigateur envoie une requête STUN Binding Request à un serveur externe pour découvrir son adresse IP publique et son port externe mappé par la passerelle NAT.',
      facts: [
        ['Protocole', 'STUN (Port UDP 3478)'],
        ['Objectif', 'Découverte de l’adresse réflexive pour le handshake ICE'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'peer'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'peer',
          color: 'amber',
          label: 'STUN BINDING',
          row: { time: '0.000 s', src: CLIENT_IP, dst: 'STUN Server', proto: 'STUN', info: 'Binding Request (Discover reflexive address)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Flux Audio/Vidéo Chiffré Direct (SRTP)',
      desc: 'Communication P2P sans serveur intermédiaire',
      detail:
        'L’offre et la réponse SDP ayant été échangées et les clés négociées par DTLS, les paquets média circulent directement entre les deux postes en SRTP chiffré.',
      facts: [
        ['Protocole', 'SRTP (Secure Real-Time Transport Protocol)'],
        ['Codec', 'Opus Audio (Type 111)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'peer',
          color: 'green',
          label: 'SRTP MEDIA [🔒]',
          row: { time: '0.020 s', src: CLIENT_IP, dst: PEER_IP, proto: 'SRTP', info: 'Encrypted Audio/Video (SSRC: 0x99887766)', len: `${frame2.bytes.length} B` },
          wire: frame2,
          locked: true,
        },
      ],
    },
  ],
};
