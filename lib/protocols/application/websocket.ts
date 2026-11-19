import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';
import { buildHttpRequest, buildHttpResponse } from '../../packet/builders/http';
import { buildWebsocketFrame } from '../../packet/builders/websocket';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const WEB_IP = '203.0.113.10';

// 1. HTTP Upgrade Request
const upReq = buildHttpRequest({
  method: 'GET',
  path: '/chat',
  host: 'https://ssp-academy.com/',
  headers: [
    ['Upgrade', 'websocket'],
    ['Connection', 'Upgrade'],
    ['Sec-WebSocket-Key', 'dGhlIHNhbXBsZSBub25jZQ=='],
    ['Sec-WebSocket-Version', '13'],
  ],
});
const upTcp = buildTcpSegment({ srcPort: 52100, dstPort: 80, seq: 1001, ack: 5001, flags: { psh: true, ack: true }, payloadLength: upReq.length });
const upIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: upTcp.length + upReq.length });
const ethC = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const ethS = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame1 = assembleLayers([ethC, upIp, upTcp, upReq]);

// 2. HTTP 101 Switching Protocols
const swRes = new PacketBuilder('http', 'HTTP/1.1 101 Switching Protocols');
swRes.summary = '101 Switching Protocols (Upgrade: websocket)';
swRes.field('Status Line', 'HTTP/1.1 101 Switching Protocols\r\n', () => swRes.ascii('HTTP/1.1 101 Switching Protocols\r\n'), { heading: true });
swRes.field('Upgrade', 'websocket\r\n', () => swRes.ascii('Upgrade: websocket\r\n'));
swRes.field('Connection', 'Upgrade\r\n', () => swRes.ascii('Connection: Upgrade\r\n'));
swRes.field('Sec-WebSocket-Accept', 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n\r\n', () => swRes.ascii('Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n\r\n'));
const swTcp = buildTcpSegment({ srcPort: 80, dstPort: 52100, seq: 5001, ack: 1001 + upReq.length, flags: { psh: true, ack: true }, payloadLength: swRes.length });
const swIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: swTcp.length + swRes.length });
const frame2 = assembleLayers([ethS, swIp, swTcp, swRes]);

// 3. Client Text Message (Masked)
const wsClient = buildWebsocketFrame({ opcode: 1, masked: true, payloadText: '{"action":"subscribe","channel":"live-feed"}' });
const wsTcp1 = buildTcpSegment({ srcPort: 52100, dstPort: 80, seq: 1001 + upReq.length, ack: 5001 + swRes.length, flags: { psh: true, ack: true }, payloadLength: wsClient.length });
const wsIp1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: wsTcp1.length + wsClient.length });
const frame3 = assembleLayers([ethC, wsIp1, wsTcp1, wsClient]);

// 4. Server Live Push (Unmasked)
const wsServer = buildWebsocketFrame({ opcode: 1, masked: false, payloadText: '{"status":"connected","subscribers":42}' });
const wsTcp2 = buildTcpSegment({ srcPort: 80, dstPort: 52100, seq: 5001 + swRes.length, ack: 1001 + upReq.length + wsClient.length, flags: { psh: true, ack: true }, payloadLength: wsServer.length });
const wsIp2 = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: wsTcp2.length + wsServer.length });
const frame4 = assembleLayers([ethS, wsIp2, wsTcp2, wsServer]);

export const websocketProtocol: ProtocolDefinition = {
  id: 'websocket',
  name: 'WebSocket',
  title: 'Two-Way Realtime Web Messaging',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['blue', 'Requête Upgrade HTTP'],
    ['amber', '101 Switching Protocols'],
    ['green', 'Trame Client (Masquée)'],
    ['violet', 'Trame Serveur (Push Direct)'],
  ],
  overview: {
    full: 'WebSocket Protocol',
    description:
      'WebSocket établit un canal de communication bidirectionnel et persistant en duplex intégral (Full-Duplex) sur une seule connexion TCP, surmontant la limitation requête/réponse stricte de HTTP.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'TCP (sur port HTTP 80 ou HTTPS 443)'],
      ['Mode', 'Duplex intégral bidirectionnel persistant'],
      ['Surcoût de trame', '2 à 14 octets seulement'],
      ['Cas d’usage', 'Messagerie instantanée, jeux en ligne, tableaux de bord financiers, streaming IoT'],
      ['Standard', 'RFC 6455'],
    ],
  },
  outro: {
    title: 'Canal WebSocket opérationnel',
    desc: 'Communication bidirectionnelle sans polling',
    text:
      'Après la poignée de main initiale d’élévation de protocole HTTP (Handshake Upgrade), le serveur et le client s’échangent des trames instantanées sans renvoyer d’en-têtes HTTP volumineux à chaque message.',
    facts: [
      ['Transition de protocole', 'Code HTTP 101 Switching Protocols'],
      ['Surcoût par message', 'Moins de 6 octets'],
      ['Persistance', 'Connexion TCP maintenue indéfiniment'],
    ],
  },
  steps: [
    {
      title: 'Poignée de Main d’Élévation (Upgrade)',
      desc: 'Requête HTTP GET demandant le protocole WebSocket',
      detail:
        'Le navigateur initie la transition en envoyant une requête HTTP classique enrichie des en-têtes Upgrade: websocket et d’une clé aléatoire encodée en base64 (Sec-WebSocket-Key).',
      facts: [
        ['Méthode', 'GET /chat HTTP/1.1'],
        ['En-tête clé', 'Upgrade: websocket'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'blue',
          label: 'HTTP UPGRADE',
          row: { time: '0.000 s', src: CLIENT_IP, dst: WEB_IP, proto: 'HTTP', info: 'GET /chat (Upgrade: websocket)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Réponse 101 Switching Protocols',
      desc: 'Validation et passage en mode binaire WebSocket',
      detail:
        'Le serveur web calcule le hachage SHA-1 de la clé cliente combinée à un identifiant universel standardisé (GUID), et renvoie le statut HTTP 101. La connexion est immédiatement transformée en flux de trames WebSocket.',
      facts: [
        ['Code réponse', '101 Switching Protocols'],
        ['En-tête de validation', 'Sec-WebSocket-Accept'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'amber',
          label: '101 SWITCHING',
          row: { time: '0.017 s', src: WEB_IP, dst: CLIENT_IP, proto: 'HTTP', info: 'HTTP/1.1 101 Switching Protocols', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Émission Client (Trame Masquée)',
      desc: 'Envoi d’un message avec masque XOR aléatoire',
      detail:
        'Le client transmet un message JSON. Conformément à la norme RFC 6455, chaque trame émise par un client Web est obligatoirement masquée par une clé XOR de 4 octets pour neutraliser les attaques par poison de cache.',
      facts: [
        ['Opcode', '1 (Text Frame)'],
        ['Masquage client', 'Obligatoire (Mask=1)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'WS CLIENT FRAME',
          row: { time: '0.025 s', src: CLIENT_IP, dst: WEB_IP, proto: 'WebSocket', info: 'Text Frame (Masked): {"action":"subscribe"}', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
    {
      title: 'Diffusion Serveur (Push Instantané)',
      desc: 'Envoi direct non sollicité du serveur vers le client',
      detail:
        'Le serveur répond ou notifie le client sans attendre de nouvelle requête. Contrairement aux trames clientes, les trames émises par le serveur ne sont pas masquées.',
      facts: [
        ['Opcode', '1 (Text Frame)'],
        ['Masquage serveur', 'Non masqué (Mask=0)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'violet',
          label: 'WS SERVER PUSH',
          row: { time: '0.042 s', src: WEB_IP, dst: CLIENT_IP, proto: 'WebSocket', info: 'Text Frame (Unmasked Push): {"status":"connected"}', len: `${frame4.bytes.length} B` },
          wire: frame4,
        },
      ],
    },
  ],
};
