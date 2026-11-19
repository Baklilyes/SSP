import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const CAM_MAC = '00:aa:11:22:33:44';
const CLIENT_IP = '192.168.1.100';
const CAM_IP = '192.168.1.180';
const RTSP_PORT = 554;

function buildRtspMessage(firstLine: string, headers: [string, string][], sdpBody?: string): PacketBuilder {
  const rtsp = new PacketBuilder('rtsp', 'RTSP Stream Control');
  rtsp.summary = firstLine.trim();
  rtsp.field('Request / Status Line', firstLine, () => rtsp.ascii(`${firstLine}\r\n`), { heading: true });

  const allHeaders = [...headers, ['CSeq', '1']];
  if (sdpBody) {
    allHeaders.push(['Content-Type', 'application/sdp']);
    allHeaders.push(['Content-Length', `${sdpBody.length}`]);
  }

  for (const [k, v] of allHeaders) {
    rtsp.field(k, v, () => rtsp.ascii(`${k}: ${v}\r\n`));
  }
  rtsp.field('End of Headers', '\\r\\n', () => rtsp.ascii('\r\n'));

  if (sdpBody) {
    rtsp.field('SDP Video Track Info', `${sdpBody.length} bytes`, () => rtsp.ascii(sdpBody));
  }
  return rtsp;
}

// 1. DESCRIBE (Client -> Cam)
const descReq = buildRtspMessage('DESCRIBE rtsp://192.168.1.180/live RTSP/1.0', [['Accept', 'application/sdp']]);
const descTcp = buildTcpSegment({ srcPort: 52900, dstPort: RTSP_PORT, seq: 1000, ack: 5000, flags: { psh: true, ack: true }, payloadLength: descReq.length });
const descIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: CAM_IP, protocol: 6, payloadLength: descTcp.length + descReq.length });
const ethC = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: CAM_MAC });
const ethCam = buildEthernetFrame({ srcMac: CAM_MAC, dstMac: CLIENT_MAC });
const frame1 = assembleLayers([ethC, descIp, descTcp, descReq]);

// 2. SETUP (Client -> Cam : Transport Ports)
const setupReq = buildRtspMessage('SETUP rtsp://192.168.1.180/live/track1 RTSP/1.0', [
  ['Transport', 'RTP/AVP;unicast;client_port=50000-50001'],
]);
const setupTcp = buildTcpSegment({ srcPort: 52900, dstPort: RTSP_PORT, seq: 1000 + descReq.length, ack: 5000, flags: { psh: true, ack: true }, payloadLength: setupReq.length });
const setupIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: CAM_IP, protocol: 6, payloadLength: setupTcp.length + setupReq.length });
const frame2 = assembleLayers([ethC, setupIp, setupTcp, setupReq]);

// 3. PLAY (Client -> Cam)
const playReq = buildRtspMessage('PLAY rtsp://192.168.1.180/live RTSP/1.0', [['Range', 'npt=0.000-']]);
const playTcp = buildTcpSegment({ srcPort: 52900, dstPort: RTSP_PORT, seq: 1000 + descReq.length + setupReq.length, ack: 5000, flags: { psh: true, ack: true }, payloadLength: playReq.length });
const playIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: CAM_IP, protocol: 6, payloadLength: playTcp.length + playReq.length });
const frame3 = assembleLayers([ethC, playIp, playTcp, playReq]);

export const rtspProtocol: ProtocolDefinition = {
  id: 'rtsp',
  name: 'RTSP',
  title: 'IP Camera Streams (Surveillance)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'cam'],
  legend: [
    ['blue', 'Description du Flux (DESCRIBE)'],
    ['amber', 'Configuration Canaux (SETUP)'],
    ['green', 'Démarrage du Flux Vidéo (PLAY)'],
  ],
  overview: {
    full: 'Real-Time Streaming Protocol (RFC 7826)',
    description:
      'RTSP agit comme une télécommande réseau pour serveurs et caméras vidéo (IP Cam / NVR). Il permet de contrôler la lecture (PLAY, PAUSE, TEARDOWN) tandis que le flux vidéo circule en RTP.',
    facts: [
      ['Couche OSI', 'Application / Contrôle Multimédia (Couche 7)'],
      ['Port par défaut', 'TCP / UDP 554'],
      ['Commandes clés', 'DESCRIBE, SETUP, PLAY, PAUSE, TEARDOWN'],
      ['Transport vidéo associé', 'RTP (H.264 / H.265 / MJPEG)'],
      ['Standard', 'RFC 2326, RFC 7826 (RTSP 2.0)'],
    ],
  },
  steps: [
    {
      title: 'Description du Flux Vidéo (DESCRIBE)',
      desc: 'Obtention des caractéristiques de la caméra',
      detail:
        'Le visualiseur de vidéosurveillance interroge la caméra IP pour connaître la résolution, la fréquence d’images et l’encodage vidéo (H.264) via une charge utile SDP.',
      facts: [
        ['Méthode', 'DESCRIBE rtsp://192.168.1.180/live'],
        ['Format retourné', 'Session Description Protocol (SDP)'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'cam'], frame: 'local' },
        {
          type: 'packet',
          from: 'client',
          to: 'cam',
          color: 'blue',
          label: 'RTSP DESCRIBE',
          row: { time: '0.000 s', src: CLIENT_IP, dst: CAM_IP, proto: 'RTSP', info: 'DESCRIBE rtsp://192.168.1.180/live', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Négociation des Canaux de Transport (SETUP)',
      desc: 'Association des ports RTP pour la vidéo et RTCP pour le contrôle',
      detail:
        'Le client annonce les ports UDP locaux réservés pour recevoir le flux vidéo (RTP port 50000) et les statistiques de qualité (RTCP port 50001).',
      facts: [
        ['Méthode', 'SETUP track1'],
        ['Ports Client', 'RTP 50000 / RTCP 50001'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'cam',
          color: 'amber',
          label: 'RTSP SETUP',
          row: { time: '0.015 s', src: CLIENT_IP, dst: CAM_IP, proto: 'RTSP', info: 'SETUP track1 (RTP/AVP/UDP client_port=50000-50001)', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Lancement du Flux Vidéo (PLAY)',
      desc: 'La caméra démarre l’émission en continu',
      detail:
        'Le client émet l’instruction PLAY. La caméra commence immédiatement à diffuser les trames vidéo H.264 en continu vers le lecteur.',
      facts: [
        ['Méthode', 'PLAY'],
        ['Flux vidéo', 'Actif à 30 images par seconde'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'cam',
          color: 'green',
          label: 'RTSP PLAY',
          row: { time: '0.030 s', src: CLIENT_IP, dst: CAM_IP, proto: 'RTSP', info: 'PLAY rtsp://192.168.1.180/live (Start Stream)', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
