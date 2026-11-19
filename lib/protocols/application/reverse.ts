import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const PROXY_MAC = '00:aa:bb:cc:dd:ee';
const APP_MAC = '00:12:34:56:78:9a';

const CLIENT_IP = '192.168.1.100';
const REVERSE_PROXY_IP = '198.51.100.200'; // Public Edge IP (NGINX / Cloudflare)
const BACKEND_APP_IP = '10.0.0.50'; // Private VPC Backend IP

// 1. Client TLS Encrypted Application Data to Reverse Proxy (Port 443)
const clientTls = new PacketBuilder('tls', 'TLS 1.3 Données Applicatives Chiffrées [🔒]');
clientTls.field('Record Type', '0x17 (Application Data)', () => clientTls.u8(0x17), { heading: true });
clientTls.field('Legacy Version', '0x0303 (TLS 1.2 marker)', () => clientTls.u16(0x0303));
clientTls.field('Length', '128 bytes', () => clientTls.u16(128));
clientTls.field('Encrypted Payload', '112 bytes ciphertext (AES-128-GCM)', () => clientTls.unknown(112), {
  note: 'Contient GET /api/v1/orders chiffré par la clé de session client <-> reverse proxy',
});
clientTls.field('Auth Tag (GCM)', '16 bytes', () => clientTls.unknown(16));

const tcpClient = buildTcpSegment({
  srcPort: 54700,
  dstPort: 443,
  seq: 1000,
  ack: 500,
  flags: { psh: true, ack: true },
  payloadLength: clientTls.length,
});
const ipClient = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: REVERSE_PROXY_IP, protocol: 6, payloadLength: tcpClient.length + clientTls.length });
const ethClient = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameClient = assembleLayers([ethClient, ipClient, tcpClient, clientTls]);

// 2. Upstream Internal HTTP/1.1 Request with Injected Headers (Proxy -> Backend)
const upstreamHttp = new PacketBuilder('http', 'HTTP Interne avec En-têtes X-Forwarded-*');
upstreamHttp.field('Request Line', 'GET /api/v1/orders HTTP/1.1', () =>
  upstreamHttp.ascii(
    'GET /api/v1/orders HTTP/1.1\r\n' +
    'Host: backend.internal:8000\r\n' +
    'X-Forwarded-For: 192.168.1.100\r\n' +
    'X-Forwarded-Proto: https\r\n' +
    'X-Request-Id: 9f7b1234-abcd-4e01\r\n' +
    'Connection: keep-alive\r\n\r\n'
  )
);
const tcpUpstream = buildTcpSegment({
  srcPort: 48900,
  dstPort: 8000,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: upstreamHttp.length,
});
const ipUpstream = buildIpv4Packet({ srcIp: '10.0.0.1', dstIp: BACKEND_APP_IP, protocol: 6, payloadLength: tcpUpstream.length + upstreamHttp.length });
const ethUpstream = buildEthernetFrame({ srcMac: PROXY_MAC, dstMac: APP_MAC });
const frameUpstream = assembleLayers([ethUpstream, ipUpstream, tcpUpstream, upstreamHttp]);

// 3. Backend HTTP 200 OK Response (Backend -> Proxy)
const backendResp = new PacketBuilder('http', 'HTTP 200 OK Backend API JSON');
backendResp.field('Status Line', 'HTTP/1.1 200 OK', () =>
  backendResp.ascii(
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: application/json; charset=utf-8\r\n' +
    'Content-Length: 42\r\n\r\n' +
    '{"status":"success","orders":[{"id":1042}]}'
  )
);
const tcpBackend = buildTcpSegment({
  srcPort: 8000,
  dstPort: 48900,
  seq: 1,
  ack: 1 + upstreamHttp.length,
  flags: { psh: true, ack: true },
  payloadLength: backendResp.length,
});
const ipBackend = buildIpv4Packet({ srcIp: BACKEND_APP_IP, dstIp: '10.0.0.1', protocol: 6, payloadLength: tcpBackend.length + backendResp.length });
const ethBackend = buildEthernetFrame({ srcMac: APP_MAC, dstMac: PROXY_MAC });
const frameBackend = assembleLayers([ethBackend, ipBackend, tcpBackend, backendResp]);

// 4. Encrypted Response to Client (Proxy -> Client)
const proxyTlsResp = new PacketBuilder('tls', 'TLS 1.3 Réponse Chiffrée vers le Client [🔒]');
proxyTlsResp.field('Record Type', '0x17 (Application Data)', () => proxyTlsResp.u8(0x17), { heading: true });
proxyTlsResp.field('Length', '96 bytes', () => proxyTlsResp.u16(96));
proxyTlsResp.field('Encrypted JSON Payload', '80 bytes ciphertext', () => proxyTlsResp.unknown(80));
proxyTlsResp.field('Auth Tag (GCM)', '16 bytes', () => proxyTlsResp.unknown(16));

const tcpProxyResp = buildTcpSegment({
  srcPort: 443,
  dstPort: 54700,
  seq: 500,
  ack: 1000 + clientTls.length,
  flags: { psh: true, ack: true },
  payloadLength: proxyTlsResp.length,
});
const ipProxyResp = buildIpv4Packet({ srcIp: REVERSE_PROXY_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpProxyResp.length + proxyTlsResp.length });
const ethProxyResp = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameProxyResp = assembleLayers([ethProxyResp, ipProxyResp, tcpProxyResp, proxyTlsResp]);

export const reverseProtocol: ProtocolDefinition = {
  id: 'reverse',
  name: 'Reverse Proxy',
  title: 'Reverse Proxy & Déchargement TLS (NGINX / Envoy)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'relay', 'app'],
  legend: [
    ['green', 'Flux HTTPS Chiffré Public [🔒]'],
    ['blue', 'Requête HTTP Interne Déchiffrée (X-Forwarded-*)'],
    ['amber', 'Réponse JSON Microservice'],
  ],
  overview: {
    full: 'Reverse Proxy & TLS Termination (NGINX / HAProxy / Cloudflare)',
    description:
      'Un proxy inverse (Reverse Proxy) est placé en coupure devant les grappes de serveurs d’applications internes. Il assure la terminaison TLS (déchargement cryptographique CPU), la répartition de charge (load balancing), la mise en cache et injecte des en-têtes d’identification comme X-Forwarded-For.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Déchargement TLS', 'Le certificat SSL/TLS réside sur le reverse proxy ; le trafic interne vers les conteneurs/pods reste allégé'],
      ['En-têtes essentiels', 'X-Forwarded-For (IP réelle du visiteur), X-Forwarded-Proto (https), X-Request-Id'],
      ['Protection', 'Masquage de la topologie interne du datacenter et atténuation des attaques DDoS'],
    ],
  },
  steps: [
    {
      title: 'Envoi de la Requête HTTPS Chiffrée (Client -> Reverse Proxy)',
      desc: 'Le navigateur communique avec l’IP publique du répartiteur',
      detail:
        'Le client envoie sa requête chiffrée en TLS 1.3 sur le port 443 à destination du reverse proxy frontal. Pour le client, le reverse proxy apparaît comme le serveur web définitif.',
      facts: [
        ['Port', 'TCP 443 (HTTPS)'],
        ['Chiffrement', 'AES-128-GCM'],
        ['Cible', '198.51.100.200 (IP Edge publique)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'green',
          label: 'HTTPS GET [🔒]',
          row: {
            time: '0.000 ms',
            src: CLIENT_IP,
            dst: REVERSE_PROXY_IP,
            proto: 'TLS 1.3',
            info: 'Application Data: GET /api/v1/orders (Chiffré)',
            len: `${frameClient.bytes.length} o`,
            wire: frameClient,
          },
          wire: frameClient,
        },
      ],
    },
    {
      title: 'Déchiffrement TLS & Routage Amont (Proxy -> Backend)',
      desc: 'Injection des en-têtes X-Forwarded-For et transmission interne',
      detail:
        'Le reverse proxy termine la couche TLS, inspecte l’URL "/api/v1/orders", insère l’en-tête "X-Forwarded-For: 192.168.1.100" pour que l’application connaisse l’IP du client, et relaye la requête en HTTP clair vers le microservice (10.0.0.50:8000).',
      facts: [
        ['En-tête injecté', 'X-Forwarded-For: 192.168.1.100'],
        ['Protocole amont', 'HTTP/1.1 interne (proxy_pass)'],
        ['IP Backend', '10.0.0.50:8000 (Réseau privé VPC)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'relay',
          to: 'app',
          color: 'blue',
          label: 'proxy_pass HTTP',
          row: {
            time: '2.800 ms',
            src: '10.0.0.1',
            dst: BACKEND_APP_IP,
            proto: 'HTTP',
            info: 'GET /api/v1/orders (X-Forwarded-For: 192.168.1.100)',
            len: `${frameUpstream.bytes.length} o`,
            wire: frameUpstream,
          },
          wire: frameUpstream,
        },
      ],
    },
    {
      title: 'Réponse JSON du Microservice Amont (Backend -> Proxy)',
      desc: 'Génération du résultat applicatif sur le réseau privé',
      detail:
        'Le microservice interroge sa base de données et retourne un payload JSON avec le code HTTP 200 OK au reverse proxy.',
      facts: [
        ['Code HTTP', '200 OK'],
        ['Type de contenu', 'application/json'],
        ['Données', '{"status":"success","orders":[{"id":1042}]}'],
      ],
      events: [
        {
          type: 'packet',
          from: 'app',
          to: 'relay',
          color: 'amber',
          label: 'HTTP 200 JSON',
          row: {
            time: '8.400 ms',
            src: BACKEND_APP_IP,
            dst: '10.0.0.1',
            proto: 'HTTP',
            info: 'HTTP/1.1 200 OK (application/json, 42 octets)',
            len: `${frameBackend.bytes.length} o`,
            wire: frameBackend,
          },
          wire: frameBackend,
        },
      ],
    },
    {
      title: 'Chiffrement TLS & Retour au Client (Proxy -> Client)',
      desc: 'Compression et chiffrement du flux de sortie vers l’utilisateur',
      detail:
        'Le reverse proxy applique la compression Gzip/Brotli, chiffre les octets avec les secrets de session TLS 1.3 du client et expédie le paquet sur la liaison Internet.',
      facts: [
        ['Chiffrement', 'AES-128-GCM'],
        ['Optimisation', 'Mise en cache potentielle & compression'],
      ],
      events: [
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'green',
          label: 'HTTPS 200 [🔒]',
          row: {
            time: '14.200 ms',
            src: REVERSE_PROXY_IP,
            dst: CLIENT_IP,
            proto: 'TLS 1.3',
            info: 'Application Data: Réponse JSON chiffrée',
            len: `${frameProxyResp.bytes.length} o`,
            wire: frameProxyResp,
          },
          wire: frameProxyResp,
        },
      ],
    },
  ],
};
