import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const CLIENT_IP = '192.168.1.100';
const PROXY_IP = '192.168.1.1'; // Forward Proxy
const TARGET_IP = '93.184.216.34'; // example.com

// 1. Client HTTP CONNECT Request to Proxy (Port 8080)
const connectReq = new PacketBuilder('http', 'HTTP CONNECT Tunnel Request');
connectReq.field('Request Line', 'CONNECT example.com:443 HTTP/1.1', () =>
  connectReq.ascii(
    'CONNECT example.com:443 HTTP/1.1\r\n' +
    'Host: example.com:443\r\n' +
    'Proxy-Connection: keep-alive\r\n' +
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n\r\n'
  )
);
const tcpConnect = buildTcpSegment({
  srcPort: 53150,
  dstPort: 8080,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: connectReq.length,
});
const ipConnect = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: PROXY_IP, protocol: 6, payloadLength: tcpConnect.length + connectReq.length });
const ethClient = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameConnect = assembleLayers([ethClient, ipConnect, tcpConnect, connectReq]);

// 2. Proxy 200 Connection Established Response
const connectResp = new PacketBuilder('http', 'HTTP 200 Connection Established');
connectResp.field('Status Line', 'HTTP/1.1 200 Connection Established', () =>
  connectResp.ascii('HTTP/1.1 200 Connection Established\r\nProxy-Agent: Squid/5.7\r\n\r\n')
);
const tcpConnectResp = buildTcpSegment({
  srcPort: 8080,
  dstPort: 53150,
  seq: 1,
  ack: 1 + connectReq.length,
  flags: { psh: true, ack: true },
  payloadLength: connectResp.length,
});
const ipConnectResp = buildIpv4Packet({ srcIp: PROXY_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpConnectResp.length + connectResp.length });
const ethProxy = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameConnectResp = assembleLayers([ethProxy, ipConnectResp, tcpConnectResp, connectResp]);

// 3. Encapsulated TLS 1.3 Client Hello inside the Tunnel
const tlsHello = new PacketBuilder('tls', 'TLS 1.3 Client Hello (Au travers du tunnel)');
tlsHello.field('Record Type', '0x16 (Handshake)', () => tlsHello.u8(0x16), { heading: true });
tlsHello.field('Legacy Version', '0x0301 (TLS 1.0 compatibility)', () => tlsHello.u16(0x0301));
tlsHello.field('Length', '180 bytes', () => tlsHello.u16(180));
tlsHello.field('Handshake Type', '0x01 (Client Hello)', () => tlsHello.u8(0x01));
tlsHello.field('Handshake Length', '176 bytes', () => tlsHello.u24(176));
tlsHello.field('Client Version', '0x0303 (TLS 1.2 marker)', () => tlsHello.u16(0x0303));
tlsHello.field('Client Random', '32 bytes random', () => tlsHello.unknown(32));
tlsHello.field('Session ID', '0 bytes (TLS 1.3 empty)', () => tlsHello.u8(0));
tlsHello.field('Cipher Suites Length', '2 suites (4 bytes)', () => tlsHello.u16(4));
tlsHello.field('Cipher Suites', 'TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384', () => tlsHello.u16(0x1301).u16(0x1302));
tlsHello.field('Extension: Server Name (SNI)', 'example.com', () => {
  tlsHello.u16(0x0000).u16(16).u16(14).u8(0).u16(11).ascii('example.com');
});
tlsHello.field('Extension: Supported Versions', 'TLS 1.3 (0x0304)', () => {
  tlsHello.u16(0x002b).u16(3).u8(2).u16(0x0304);
});

const tcpTls = buildTcpSegment({
  srcPort: 53150,
  dstPort: 8080,
  seq: 1 + connectReq.length,
  ack: 1 + connectResp.length,
  flags: { psh: true, ack: true },
  payloadLength: tlsHello.length,
});
const ipTls = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: PROXY_IP, protocol: 6, payloadLength: tcpTls.length + tlsHello.length });
const frameTls = assembleLayers([ethClient, ipTls, tcpTls, tlsHello]);

export const proxyProtocol: ProtocolDefinition = {
  id: 'proxy',
  name: 'HTTP Proxy',
  title: 'Forward Proxy & HTTP CONNECT Tunneling',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet', 'web'],
  legend: [
    ['blue', 'Requête Tunneling HTTP CONNECT'],
    ['amber', 'Confirmation 200 Connection Established'],
    ['green', 'Flux TLS Chiffré Transparent [🔒]'],
  ],
  overview: {
    full: 'HTTP Forward Proxy & Tunneling (RFC 9110 / RFC 2817)',
    description:
      'Un proxy direct (Forward Proxy) agit comme intermédiaire pour les requêtes sortantes des clients d’un réseau d’entreprise. La méthode HTTP CONNECT établit un tunnel TCP bidirectionnel aveugle permettant de faire transiter du trafic HTTPS chiffré sans que le proxy n’intercepte ni ne déchiffre les données secrètes.',
    facts: [
      ['Couche OSI', 'Application (Couche 7) / Pont de transport'],
      ['Méthode Clé', 'CONNECT destination:port HTTP/1.1'],
      ['Comportement', 'Dès que le proxy répond 200 OK, il devient un simple relais d’octets TCP (Opaque Pipe)'],
      ['Confidentialité', 'Chiffrement TLS intact de bout en bout entre le navigateur et le serveur d’origine'],
    ],
  },
  steps: [
    {
      title: 'Ouverture du Tunnel : Commande HTTP CONNECT (Client -> Proxy)',
      desc: 'Le navigateur demande au proxy de se relier à la cible HTTPS',
      detail:
        'Le client envoie une requête CONNECT avec le nom d’hôte et le port distant (example.com:443). Le proxy résout le nom DNS et initie une session TCP avec le serveur distant.',
      facts: [
        ['Commande', 'CONNECT example.com:443 HTTP/1.1'],
        ['Port Proxy', 'TCP 8080 (ou 3128)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'blue',
          label: 'HTTP CONNECT',
          row: {
            time: '0.000 ms',
            src: CLIENT_IP,
            dst: PROXY_IP,
            proto: 'HTTP',
            info: 'CONNECT example.com:443 HTTP/1.1',
            len: `${frameConnect.bytes.length} o`,
            wire: frameConnect,
          },
          wire: frameConnect,
        },
      ],
    },
    {
      title: 'Établissement du Tunnel : Réponse 200 OK (Proxy -> Client)',
      desc: 'Le proxy confirme que la liaison TCP distante est prête',
      detail:
        'Le proxy s’est connecté avec succès à example.com:443. Il renvoie au client la réponse 200 Connection Established. À compter de cet instant, tout octet entrant est recopié directement vers le serveur web sans inspection.',
      facts: [
        ['Statut HTTP', '200 Connection Established'],
        ['État du tunnel', 'Actif et opaque'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'amber',
          label: '200 Established',
          row: {
            time: '24.500 ms',
            src: PROXY_IP,
            dst: CLIENT_IP,
            proto: 'HTTP',
            info: 'HTTP/1.1 200 Connection Established',
            len: `${frameConnectResp.bytes.length} o`,
            wire: frameConnectResp,
          },
          wire: frameConnectResp,
        },
      ],
    },
    {
      title: 'Transmission du Handshake TLS 1.3 dans le Tunnel',
      desc: 'Poignée de main cryptographique directe avec le serveur web',
      detail:
        'Le client injecte sa trame TLS 1.3 Client Hello dans le flux TCP. Le proxy se contente de relayer les octets vers le serveur web distant sans pouvoir en déchiffrer le contenu.',
      facts: [
        ['Protocole enveloppé', 'TLS 1.3 Client Hello'],
        ['Chiffrement', 'Total de bout en bout (Client <-> Web)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'green',
          label: 'TLS Hello (Tunnel)',
          row: {
            time: '32.100 ms',
            src: CLIENT_IP,
            dst: PROXY_IP,
            proto: 'TLS 1.3',
            info: 'Handshake: Client Hello (example.com) via CONNECT tunnel',
            len: `${frameTls.bytes.length} o`,
            wire: frameTls,
          },
          wire: frameTls,
        },
        {
          type: 'packet',
          from: 'router',
          to: 'web',
          color: 'green',
          label: 'TLS Hello (WAN)',
          row: {
            time: '34.200 ms',
            src: PROXY_IP,
            dst: TARGET_IP,
            proto: 'TLS 1.3',
            info: 'Handshake: Client Hello relayé vers le serveur web',
            len: `${frameTls.bytes.length} o`,
            wire: frameTls,
          },
          wire: frameTls,
        },
      ],
    },
  ],
};
