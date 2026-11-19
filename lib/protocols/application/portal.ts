import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const CLIENT_IP = '192.168.1.100';
const ROUTER_IP = '192.168.1.1';
const DEST_IP = '198.51.100.50'; // neverssl.com

// 1. Client unauthenticated HTTP GET
const getHttp = new PacketBuilder('http', 'HTTP GET (Non authentifié)');
getHttp.field('Request Line', 'GET /index.html HTTP/1.1', () =>
  getHttp.ascii('GET /index.html HTTP/1.1\r\nHost: neverssl.com\r\nUser-Agent: Mozilla/5.0\r\n\r\n')
);
const tcpGet = buildTcpSegment({
  srcPort: 52110,
  dstPort: 80,
  seq: 1000,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: getHttp.length,
});
const ipGet = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: DEST_IP, protocol: 6, payloadLength: tcpGet.length + getHttp.length });
const ethGet = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameGet = assembleLayers([ethGet, ipGet, tcpGet, getHttp]);

// 2. Gateway Interception & HTTP 302 Redirect to Portal
const redirectHttp = new PacketBuilder('http', 'HTTP 302 Redirection Portail Captif');
redirectHttp.field('Status Line', 'HTTP/1.1 302 Found', () =>
  redirectHttp.ascii(
    'HTTP/1.1 302 Found\r\n' +
    'Location: http://192.168.1.1:8080/login?mac=00:1a:2b:3c:4d:5e\r\n' +
    'Connection: close\r\n' +
    'Content-Length: 0\r\n\r\n'
  )
);
const tcpRedirect = buildTcpSegment({
  srcPort: 80,
  dstPort: 52110,
  seq: 1,
  ack: 1000 + getHttp.length,
  flags: { psh: true, ack: true },
  payloadLength: redirectHttp.length,
});
const ipRedirect = buildIpv4Packet({ srcIp: DEST_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpRedirect.length + redirectHttp.length });
const ethRedirect = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameRedirect = assembleLayers([ethRedirect, ipRedirect, tcpRedirect, redirectHttp]);

// 3. Client POST Acceptation CGU / Authentification
const authHttp = new PacketBuilder('http', 'HTTP POST Authentification Portail');
authHttp.field('Request Line', 'POST /login/auth HTTP/1.1', () =>
  authHttp.ascii(
    'POST /login/auth HTTP/1.1\r\n' +
    'Host: 192.168.1.1:8080\r\n' +
    'Content-Type: application/x-www-form-urlencoded\r\n' +
    'Content-Length: 29\r\n\r\n' +
    'accept_terms=true&voucher=VIP'
  )
);
const tcpAuth = buildTcpSegment({
  srcPort: 52112,
  dstPort: 8080,
  seq: 2000,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: authHttp.length,
});
const ipAuth = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: ROUTER_IP, protocol: 6, payloadLength: tcpAuth.length + authHttp.length });
const ethAuth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameAuth = assembleLayers([ethAuth, ipAuth, tcpAuth, authHttp]);

// 4. Portal Access Granted
const okHttp = new PacketBuilder('http', 'HTTP 200 OK Accès Autorisé');
okHttp.field('Status Line', 'HTTP/1.1 200 OK (Internet Débloqué)', () =>
  okHttp.ascii(
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: text/html\r\n' +
    'Content-Length: 38\r\n\r\n' +
    '<html><body>Connexion active</body></html>'
  )
);
const tcpOk = buildTcpSegment({
  srcPort: 8080,
  dstPort: 52112,
  seq: 1,
  ack: 2000 + authHttp.length,
  flags: { psh: true, ack: true },
  payloadLength: okHttp.length,
});
const ipOk = buildIpv4Packet({ srcIp: ROUTER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpOk.length + okHttp.length });
const ethOk = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameOk = assembleLayers([ethOk, ipOk, tcpOk, okHttp]);

export const portalProtocol: ProtocolDefinition = {
  id: 'portal',
  name: 'Captive Portal',
  title: 'Captive Portal (Hotspots & Wi-Fi Publics)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet'],
  legend: [
    ['amber', 'Trafic non authentifié intercepté'],
    ['blue', 'Redirection HTTP 302 vers le portail'],
    ['green', 'Validation et levée du pare-feu'],
  ],
  overview: {
    full: 'Captive Portal & Network Access Control (RFC 7710 / RFC 8952)',
    description:
      'Un portail captif force tout nouvel appareil se connectant à un réseau Wi-Fi public (hôtels, aéroports, cafés) à visualiser une page web de connexion ou de validation des conditions d’utilisation avant d’accéder à Internet.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Mécanisme', 'Interception pare-feu (iptables DNAT) et redirection HTTP 302'],
      ['Détection OS', 'RFC 8952 / requêtes automatisées (ex: captive.apple.com)'],
      ['Sécurité', 'Risque d’interception MITM sur les requêtes HTTPS si non conforme RFC 8952'],
    ],
  },
  steps: [
    {
      title: 'Tentative d’Accès Web Initiale (Client -> Web)',
      desc: 'Le client tente d’ouvrir une page HTTP non chiffrée',
      detail:
        'Le navigateur émet une requête HTTP GET vers neverssl.com sur le port 80. À ce stade, la passerelle bloque tout le trafic direct vers l’extérieur.',
      facts: [
        ['Cible', 'neverssl.com:80'],
        ['État pare-feu', 'Bloqué / En attente d’authentification'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'amber',
          label: 'HTTP GET (Intercepté)',
          row: {
            time: '0.000 ms',
            src: CLIENT_IP,
            dst: DEST_IP,
            proto: 'HTTP',
            info: 'GET /index.html HTTP/1.1 (Host: neverssl.com)',
            len: `${frameGet.bytes.length} o`,
            wire: frameGet,
          },
          wire: frameGet,
        },
      ],
    },
    {
      title: 'Interception et Redirection HTTP 302 (Passerelle -> Client)',
      desc: 'La passerelle se substitue au serveur web distant',
      detail:
        'Le routeur intercepte la connexion TCP et répond au nom de la destination avec un code HTTP 302 Found, redirigeant le navigateur vers son serveur web interne de login avec l’adresse MAC du client en paramètre.',
      facts: [
        ['Code HTTP', '302 Found'],
        ['En-tête Location', 'http://192.168.1.1:8080/login?mac=00:1a:2b:3c:4d:5e'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'blue',
          label: 'HTTP 302 Redirection',
          row: {
            time: '2.400 ms',
            src: DEST_IP,
            dst: CLIENT_IP,
            proto: 'HTTP',
            info: 'HTTP/1.1 302 Found -> http://192.168.1.1:8080/login',
            len: `${frameRedirect.bytes.length} o`,
            wire: frameRedirect,
          },
          wire: frameRedirect,
        },
      ],
    },
    {
      title: 'Validation des CGU / Identifiants (Client -> Passerelle)',
      desc: 'Soumission du formulaire d’acceptation ou du code d’accès',
      detail:
        'Le client valide les conditions générales d’utilisation. Un POST HTTP est envoyé au serveur web local du portail captif.',
      facts: [
        ['Méthode', 'POST /login/auth'],
        ['Données', 'accept_terms=true&voucher=VIP'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'blue',
          label: 'POST /login/auth',
          row: {
            time: '850.000 ms',
            src: CLIENT_IP,
            dst: ROUTER_IP,
            proto: 'HTTP',
            info: 'POST /login/auth (accept_terms=true)',
            len: `${frameAuth.bytes.length} o`,
            wire: frameAuth,
          },
          wire: frameAuth,
        },
      ],
    },
    {
      title: 'Autorisation et Levée du Filtrage Pare-feu',
      desc: 'Ajout de la MAC client à la table blanche (ipset/iptables)',
      detail:
        'Le portail valide le compte, ajoute la règle de forwarding dans le pare-feu du routeur et confirme au client qu’il dispose désormais d’un accès libre à Internet.',
      facts: [
        ['Règle pare-feu', 'iptables -I FORWARD -m mac --mac-source 00:1a:.. -j ACCEPT'],
        ['Statut', 'Accès WAN déverrouillé'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'green',
          label: 'HTTP 200 OK Accès',
          row: {
            time: '865.100 ms',
            src: ROUTER_IP,
            dst: CLIENT_IP,
            proto: 'HTTP',
            info: 'HTTP/1.1 200 OK (Connexion active)',
            len: `${frameOk.bytes.length} o`,
            wire: frameOk,
          },
          wire: frameOk,
        },
      ],
    },
  ],
};
