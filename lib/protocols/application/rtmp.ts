import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const STREAM_SERVER_IP = '203.0.113.193';
const RTMP_PORT = 1935;

// 1. RTMP Handshake C0 + C1 (Client -> Server)
const c0c1 = new PacketBuilder('rtmp', 'RTMP Handshake (C0 + C1)');
c0c1.summary = 'Handshake C0 + C1';
c0c1.field('C0: RTMP Version', '3', () => c0c1.u8(3), { heading: true });
c0c1.field('C1: Epoch Time', '0', () => c0c1.u32(0));
c0c1.field('C1: Zero Padding', '0x00000000', () => c0c1.u32(0));
c0c1.field('C1: Random Echo Data', '1528 random bytes', () => c0c1.unknown(1528));
const c0c1Tcp = buildTcpSegment({ srcPort: 53140, dstPort: RTMP_PORT, seq: 1000, ack: 5000, flags: { psh: true, ack: true }, payloadLength: c0c1.length });
const c0c1Ip = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: STREAM_SERVER_IP, protocol: 6, payloadLength: c0c1Tcp.length + c0c1.length });
const ethC = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const ethS = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame1 = assembleLayers([ethC, c0c1Ip, c0c1Tcp, c0c1]);

// 2. RTMP connect command (Client -> Server)
const conn = new PacketBuilder('rtmp', 'RTMP Command: connect("live")');
conn.summary = 'NetConnection.connect';
conn.field('Chunk Header', 'Format=0, CSID=3 (Command)', () => conn.u8(0x03));
conn.field('Message Type', '20 (AMF0 Command)', () => conn.u8(20));
conn.field('Command Name', '"connect"', () => {
  conn.u8(2); // String marker
  conn.u16(7);
  conn.ascii('connect');
});
conn.field('Transaction ID', '1.0', () => {
  conn.u8(0); // Number marker
  conn.u64(1);
});
conn.field('App Name', '"live"', () => {
  conn.u8(2);
  conn.u16(4);
  conn.ascii('live');
});
const connTcp = buildTcpSegment({ srcPort: 53140, dstPort: RTMP_PORT, seq: 2537, ack: 6537, flags: { psh: true, ack: true }, payloadLength: conn.length });
const connIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: STREAM_SERVER_IP, protocol: 6, payloadLength: connTcp.length + conn.length });
const frame2 = assembleLayers([ethC, connIp, connTcp, conn]);

// 3. RTMP publish command
const pub = new PacketBuilder('rtmp', 'RTMP Command: publish("stream_key_secret")');
pub.summary = 'NetStream.publish';
pub.field('Command Name', '"publish"', () => {
  pub.u8(2);
  pub.u16(7);
  pub.ascii('publish');
});
pub.field('Stream Key', '"live_abc123"', () => {
  pub.u8(2);
  pub.u16(11);
  pub.ascii('live_abc123');
});
pub.field('Publishing Type', '"live"', () => {
  pub.u8(2);
  pub.u16(4);
  pub.ascii('live');
});
const pubTcp = buildTcpSegment({ srcPort: 53140, dstPort: RTMP_PORT, seq: 2750, ack: 6700, flags: { psh: true, ack: true }, payloadLength: pub.length });
const pubIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: STREAM_SERVER_IP, protocol: 6, payloadLength: pubTcp.length + pub.length });
const frame3 = assembleLayers([ethC, pubIp, pubTcp, pub]);

export const rtmpProtocol: ProtocolDefinition = {
  id: 'rtmp',
  name: 'RTMP',
  title: 'Live Streaming Upload (OBS Studio)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['amber', 'Handshake RTMP (C0/C1)'],
    ['blue', 'Connexion Applicative AMF0'],
    ['green', 'Diffusion en Direct (Publish)'],
  ],
  overview: {
    full: 'Real-Time Messaging Protocol',
    description:
      'RTMP est le standard utilisé par les créateurs de contenu et les logiciels de régie (OBS Studio, vMix) pour envoyer leurs flux vidéo et audio en direct vers YouTube, Twitch, Facebook et les serveurs d’ingestion CDN.',
    facts: [
      ['Couche OSI', 'Application / Streaming Multimédia (Couche 7)'],
      ['Port par défaut', 'TCP 1935'],
      ['Format des commandes', 'AMF0 / AMF3 (Action Message Format)'],
      ['Segmentation', 'Découpage en chunks de 128 à 4096 octets'],
      ['Cas d’usage', 'Flux d’ingestion (Ingest) vers plateformes de diffusion'],
    ],
  },
  steps: [
    {
      title: 'Poignée de Main RTMP (Handshake C0/C1)',
      desc: 'Synchronisation temporelle et détection de version',
      detail:
        'Le logiciel OBS ouvre une connexion TCP sur le port 1935 et transmet le bloc C0 (version 3) et C1 (1536 octets incluant l’horodatage de référence et des données aléatoires).',
      facts: [
        ['Version', 'RTMP v3'],
        ['Taille Handshake', '1537 octets'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'RTMP C0+C1',
          row: { time: '0.000 s', src: CLIENT_IP, dst: STREAM_SERVER_IP, proto: 'RTMP', info: 'Handshake C0 (Ver 3) + C1 (1536 bytes)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Connexion Applicative (connect "live")',
      desc: 'Création du contexte de streaming',
      detail:
        'OBS transmet la commande AMF0 connect pour initialiser la session auprès de l’application live du serveur média.',
      facts: [
        ['Commande AMF0', 'connect'],
        ['Application', 'live'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'blue',
          label: 'RTMP CONNECT',
          row: { time: '0.020 s', src: CLIENT_IP, dst: STREAM_SERVER_IP, proto: 'RTMP', info: 'NetConnection.connect("live")', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Démarrage du Live (publish)',
      desc: 'Transmission du flux vidéo avec clé secrète',
      detail:
        'La commande publish authentifie la clé de stream secrète et déclenche l’envoi continu des trames vidéo H.264 et audio AAC segmentées en chunks.',
      facts: [
        ['Commande AMF0', 'publish'],
        ['Statut', 'Diffusion en direct active'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'RTMP PUBLISH',
          row: { time: '0.035 s', src: CLIENT_IP, dst: STREAM_SERVER_IP, proto: 'RTMP', info: 'NetStream.publish("live_abc123", "live")', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
