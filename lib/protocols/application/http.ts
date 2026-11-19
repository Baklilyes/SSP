import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { buildDnsPacket } from '../../packet/builders/dns';
import { buildHttpRequest, buildHttpResponse } from '../../packet/builders/http';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const ROUTER_IP = '192.168.1.1';
const DNS_IP = '8.8.8.8';
const WEB_IP = '203.0.113.10';

// Construction des paquets réels décodés
// 1. DNS Query
const dnsQueryPayload = buildDnsPacket({ qr: false, queryName: 'https://ssp-academy.com/' });
const dnsQueryUdp = buildUdpDatagram({ srcPort: 53124, dstPort: 53, payloadLength: dnsQueryPayload.length });
const dnsQueryIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: DNS_IP, protocol: 17, payloadLength: dnsQueryUdp.length + dnsQueryPayload.length });
const dnsQueryEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const dnsQueryFrame = assembleLayers([dnsQueryEth, dnsQueryIp, dnsQueryUdp, dnsQueryPayload]);

// 2. DNS Reply
const dnsReplyPayload = buildDnsPacket({ qr: true, queryName: 'https://ssp-academy.com/', answerIp: WEB_IP });
const dnsReplyUdp = buildUdpDatagram({ srcPort: 53, dstPort: 53124, payloadLength: dnsReplyPayload.length });
const dnsReplyIp = buildIpv4Packet({ srcIp: DNS_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: dnsReplyUdp.length + dnsReplyPayload.length });
const dnsReplyEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const dnsReplyFrame = assembleLayers([dnsReplyEth, dnsReplyIp, dnsReplyUdp, dnsReplyPayload]);

// 3. TCP SYN
const tcpSynPayload = buildTcpSegment({ srcPort: 52344, dstPort: 80, seq: 1000, flags: { syn: true } });
const tcpSynIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: tcpSynPayload.length });
const tcpSynEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const tcpSynFrame = assembleLayers([tcpSynEth, tcpSynIp, tcpSynPayload]);

// 4. TCP SYN-ACK
const tcpSynAckPayload = buildTcpSegment({ srcPort: 80, dstPort: 52344, seq: 5000, ack: 1001, flags: { syn: true, ack: true } });
const tcpSynAckIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpSynAckPayload.length });
const tcpSynAckEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const tcpSynAckFrame = assembleLayers([tcpSynAckEth, tcpSynAckIp, tcpSynAckPayload]);

// 5. TCP ACK
const tcpAckPayload = buildTcpSegment({ srcPort: 52344, dstPort: 80, seq: 1001, ack: 5001, flags: { ack: true } });
const tcpAckIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: tcpAckPayload.length });
const tcpAckEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const tcpAckFrame = assembleLayers([tcpAckEth, tcpAckIp, tcpAckPayload]);

// 6. HTTP GET Request
const httpGetPayload = buildHttpRequest({ method: 'GET', path: '/', host: 'https://ssp-academy.com/' });
const httpGetTcp = buildTcpSegment({ srcPort: 52344, dstPort: 80, seq: 1001, ack: 5001, flags: { psh: true, ack: true }, payloadLength: httpGetPayload.length });
const httpGetIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: httpGetTcp.length + httpGetPayload.length });
const httpGetEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const httpGetFrame = assembleLayers([httpGetEth, httpGetIp, httpGetTcp, httpGetPayload]);

// 7. HTTP 200 OK Response
const httpResPayload = buildHttpResponse({ statusCode: 200, statusText: 'OK' });
const httpResTcp = buildTcpSegment({ srcPort: 80, dstPort: 52344, seq: 5001, ack: 1001 + httpGetPayload.length, flags: { psh: true, ack: true }, payloadLength: httpResPayload.length });
const httpResIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: httpResTcp.length + httpResPayload.length });
const httpResEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const httpResFrame = assembleLayers([httpResEth, httpResIp, httpResTcp, httpResPayload]);

export const httpProtocol: ProtocolDefinition = {
  id: 'http',
  name: 'HTTP',
  title: 'Web Communication',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'dns', 'internet', 'web'],
  latency: {
    'client-dns': 0.012,
    'client-web': 0.017,
  },
  legend: [
    ['blue', 'DNS'],
    ['green', 'TCP'],
    ['amber', 'Requête HTTP'],
    ['violet', 'Réponse HTTP'],
  ],
  overview: {
    full: 'Hypertext Transfer Protocol',
    description:
      'HTTP est le protocole fondamental du Web. Un client émet une requête textuelle (GET, POST...) et le serveur répond avec un code de statut (200 OK), des en-têtes et le corps de ressource (HTML, JSON).',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Port par défaut', '80 (non chiffré)'],
      ['Transport', 'TCP (connexion fiable ordonnée)'],
      ['Format des données', 'Texte clair (en-têtes + corps optionnel)'],
      ['Méthodes courantes', 'GET, POST, PUT, DELETE, HEAD'],
      ['Standards', 'RFC 9110, RFC 9112'],
    ],
  },
  outro: {
    title: 'Page web délivrée',
    desc: 'Une requête, une réponse',
    text:
      'En moins d’un dixième de seconde, l’ordinateur a résolu le nom de domaine en adresse IP via DNS, ouvert une liaison TCP fiable par 3-way handshake, et échangé une requête et une réponse HTTP en clair.',
    facts: [
      ['Allers-retours (RTT)', '3 (DNS, Handshake TCP, Échange HTTP)'],
      ['Temps total estimé', '~0.094 s'],
      ['Sécurité', 'Texte clair : lisible par tout équipement sur le chemin réseau'],
    ],
  },
  start: {
    nodes: ['client'],
    frame: 'client',
  },
  steps: [
    {
      title: 'Requête Client',
      desc: 'Le navigateur prépare la demande',
      detail:
        'L’utilisateur saisit l’adresse https://ssp-academy.com/. Le navigateur s’apprête à envoyer une requête GET, mais les paquets IP s’acheminent vers des adresses numériques, pas des noms. Il doit d’abord interroger le DNS.',
      facts: [
        ['URL ciblée', 'https://ssp-academy.com/'],
        ['Méthode', 'GET'],
        ['Passerelle locale', 'Routeur 192.168.1.1'],
      ],
      events: [
        { type: 'type-url', text: 'https://ssp-academy.com/' },
        { type: 'show', nodes: ['router'], frame: 'local' },
      ],
    },
    {
      title: 'Résolution DNS',
      desc: 'Recherche de l’adresse IP du serveur',
      detail:
        'Le client demande au résolveur DNS 8.8.8.8 l’adresse IP associée à https://ssp-academy.com/. La requête part en UDP sur le port 53 et reçoit un enregistrement A contenant 203.0.113.10.',
      facts: [
        ['Résolveur', '8.8.8.8'],
        ['Transport', 'UDP, Port 53'],
        ['Réponse A', '203.0.113.10'],
      ],
      events: [
        { type: 'show', nodes: ['internet', 'dns'], frame: 'lookup' },
        {
          type: 'packet',
          from: 'client',
          to: 'dns',
          color: 'blue',
          label: 'DNS QUERY',
          row: {
            time: '0.000 s',
            src: CLIENT_IP,
            dst: DNS_IP,
            proto: 'DNS',
            info: 'Standard query A https://ssp-academy.com/',
            len: `${dnsQueryFrame.bytes.length} B`,
          },
          wire: dnsQueryFrame,
        },
        {
          type: 'packet',
          from: 'dns',
          to: 'client',
          color: 'blue',
          label: 'DNS REPLY',
          row: {
            time: '0.012 s',
            src: DNS_IP,
            dst: CLIENT_IP,
            proto: 'DNS',
            info: 'Standard query response A 203.0.113.10',
            len: `${dnsReplyFrame.bytes.length} B`,
          },
          wire: dnsReplyFrame,
        },
      ],
    },
    {
      title: 'Connexion TCP',
      desc: 'Établissement du lien fiable (3-Way Handshake)',
      detail:
        'HTTP s’appuie sur TCP pour garantir l’acheminement des données sans perte ni désordre. Avant tout échange de page, les deux hôtes négocient une connexion sur le port 80 : SYN → SYN-ACK → ACK.',
      facts: [
        ['Port Serveur', '80'],
        ['Port Client', '52344 (éphémère)'],
        ['Handshake', 'SYN (Client) → SYN-ACK (Serveur) → ACK (Client)'],
      ],
      events: [
        { type: 'show', nodes: ['web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'TCP SYN',
          row: {
            time: '0.024 s',
            src: CLIENT_IP,
            dst: WEB_IP,
            proto: 'TCP',
            info: '52344 → 80 [SYN] Seq=1000 Win=65535',
            len: `${tcpSynFrame.bytes.length} B`,
          },
          wire: tcpSynFrame,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'TCP SYN-ACK',
          row: {
            time: '0.041 s',
            src: WEB_IP,
            dst: CLIENT_IP,
            proto: 'TCP',
            info: '80 → 52344 [SYN, ACK] Seq=5000 Ack=1001',
            len: `${tcpSynAckFrame.bytes.length} B`,
          },
          wire: tcpSynAckFrame,
        },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'TCP ACK',
          row: {
            time: '0.058 s',
            src: CLIENT_IP,
            dst: WEB_IP,
            proto: 'TCP',
            info: '52344 → 80 [ACK] Seq=1001 Ack=5001',
            len: `${tcpAckFrame.bytes.length} B`,
          },
          wire: tcpAckFrame,
        },
      ],
    },
    {
      title: 'Échange HTTP',
      desc: 'Transmission de la requête et réception de la réponse',
      detail:
        'La connexion TCP étant ouverte, le navigateur envoie sa requête GET avec l’en-tête Host. Le serveur web analyse la requête et répond avec le code HTTP 200 OK et le code source HTML.',
      facts: [
        ['Statut de réponse', '200 OK'],
        ['Type de contenu', 'text/html; charset=utf-8'],
        ['Encodage', 'Texte clair non chiffré'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'GET / HTTP/1.1',
          row: {
            time: '0.058 s',
            src: CLIENT_IP,
            dst: WEB_IP,
            proto: 'HTTP',
            info: 'GET / HTTP/1.1 (Host: https://ssp-academy.com/)',
            len: `${httpGetFrame.bytes.length} B`,
          },
          wire: httpGetFrame,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'violet',
          label: '200 OK',
          row: {
            time: '0.076 s',
            src: WEB_IP,
            dst: CLIENT_IP,
            proto: 'HTTP',
            info: 'HTTP/1.1 200 OK (text/html)',
            len: `${httpResFrame.bytes.length} B`,
          },
          wire: httpResFrame,
        },
      ],
    },
    {
      title: 'Rendu du Document',
      desc: 'Affichage de la page par le navigateur',
      detail:
        'Le moteur de rendu du navigateur parse le code HTML, construit l’arbre DOM et peint la page à l’écran. La connexion TCP reste ouverte (*keep-alive*) pour d’éventuelles ressources associées.',
      facts: [
        ['Document', 'text/html'],
        ['État TCP', 'Connexion maintenue (Keep-Alive)'],
        ['Temps global', '0.094 s'],
      ],
      events: [
        { type: 'camera', frame: 'client' },
        { type: 'render', content: 'Example Domain' },
      ],
    },
  ],
};
