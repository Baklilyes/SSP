import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { buildDnsPacket } from '../../packet/builders/dns';
import { buildTlsRecord } from '../../packet/builders/tls';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const DNS_IP = '8.8.8.8';
const WEB_IP = '203.0.113.10';

// 1. DNS Query & Reply
const dnsQ = buildDnsPacket({ qr: false, queryName: 'https://ssp-academy.com/' });
const dnsQUdp = buildUdpDatagram({ srcPort: 53124, dstPort: 53, payloadLength: dnsQ.length });
const dnsQIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: DNS_IP, protocol: 17, payloadLength: dnsQUdp.length + dnsQ.length });
const dnsQEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const dnsQFrame = assembleLayers([dnsQEth, dnsQIp, dnsQUdp, dnsQ]);

const dnsR = buildDnsPacket({ qr: true, queryName: 'https://ssp-academy.com/', answerIp: WEB_IP });
const dnsRUdp = buildUdpDatagram({ srcPort: 53, dstPort: 53124, payloadLength: dnsR.length });
const dnsRIp = buildIpv4Packet({ srcIp: DNS_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: dnsRUdp.length + dnsR.length });
const dnsREth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const dnsRFrame = assembleLayers([dnsREth, dnsRIp, dnsRUdp, dnsR]);

// 2. TCP SYN / SYN-ACK / ACK sur port 443
const syn = buildTcpSegment({ srcPort: 52411, dstPort: 443, seq: 1000, flags: { syn: true } });
const synIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: syn.length });
const synFrame = assembleLayers([dnsQEth, synIp, syn]);

const synAck = buildTcpSegment({ srcPort: 443, dstPort: 52411, seq: 5000, ack: 1001, flags: { syn: true, ack: true } });
const synAckIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: synAck.length });
const synAckFrame = assembleLayers([dnsREth, synAckIp, synAck]);

const ack = buildTcpSegment({ srcPort: 52411, dstPort: 443, seq: 1001, ack: 5001, flags: { ack: true } });
const ackIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: ack.length });
const ackFrame = assembleLayers([dnsQEth, ackIp, ack]);

// 3. TLS Handshake (Client Hello / Server Hello)
const ch = buildTlsRecord({ type: 'handshake', handshakeType: 'client_hello', serverName: 'https://ssp-academy.com/' });
const chTcp = buildTcpSegment({ srcPort: 52411, dstPort: 443, seq: 1001, ack: 5001, flags: { psh: true, ack: true }, payloadLength: ch.length });
const chIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: chTcp.length + ch.length });
const chFrame = assembleLayers([dnsQEth, chIp, chTcp, ch]);

const sh = buildTlsRecord({ type: 'handshake', handshakeType: 'server_hello' });
const shTcp = buildTcpSegment({ srcPort: 443, dstPort: 52411, seq: 5001, ack: 1001 + ch.length, flags: { psh: true, ack: true }, payloadLength: sh.length });
const shIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: shTcp.length + sh.length });
const shFrame = assembleLayers([dnsREth, shIp, shTcp, sh]);

// 4. Encrypted Application Data (HTTPS Request & Response)
const reqEnc = buildTlsRecord({ type: 'appdata', payloadLength: 640 });
const reqEncTcp = buildTcpSegment({ srcPort: 52411, dstPort: 443, seq: 1001 + ch.length, ack: 5001 + sh.length, flags: { psh: true, ack: true }, payloadLength: reqEnc.length });
const reqEncIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: reqEncTcp.length + reqEnc.length });
const reqEncFrame = assembleLayers([dnsQEth, reqEncIp, reqEncTcp, reqEnc]);

const resEnc = buildTlsRecord({ type: 'appdata', payloadLength: 1850 });
const resEncTcp = buildTcpSegment({ srcPort: 443, dstPort: 52411, seq: 5001 + sh.length, ack: 1001 + ch.length + reqEnc.length, flags: { psh: true, ack: true }, payloadLength: resEnc.length });
const resEncIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: resEncTcp.length + resEnc.length });
const resEncFrame = assembleLayers([dnsREth, resEncIp, resEncTcp, resEnc]);

export const httpsProtocol: ProtocolDefinition = {
  id: 'https',
  name: 'HTTPS',
  title: 'Secure Web Communication',
  layer: 7,
  group: 'security',
  nodes: ['client', 'router', 'dns', 'internet', 'web'],
  legend: [
    ['blue', 'Résolution DNS'],
    ['green', 'Connexion TCP (Port 443)'],
    ['amber', 'Négociation TLS 1.3'],
    ['violet', 'Requête & Réponse Chiffrées'],
  ],
  overview: {
    full: 'Hypertext Transfer Protocol Secure',
    description:
      'HTTPS est le protocole standard du Web moderne. Il encapsule l’ensemble du trafic HTTP dans une couche de chiffrement TLS, protégeant les utilisateurs contre les écoutes indiscrètes et la falsification de contenu.',
    facts: [
      ['Couche OSI', 'Application / Sécurité (Couches 6 et 7)'],
      ['Port par défaut', '443'],
      ['Composants', 'HTTP + TLS + TCP + IP'],
      ['Propriétés garanties', 'Confidentialité, Intégrité, Authentification du serveur'],
      ['Standard', 'RFC 9110'],
    ],
  },
  outro: {
    title: 'Navigation HTTPS sécurisée',
    desc: 'Protection intégrale du trafic web',
    text:
      'Le navigateur a vérifié l’identité du serveur via son certificat de clé publique, dérivé des clés de session inviolables et transféré la page web HTML dans un tunnel cryptographique hermétique.',
    facts: [
      ['Protocole sous-jacent', 'TLS 1.3 sur TCP port 443'],
      ['Indicateur navigateur', 'Cadenas vert / sécurisé actif'],
      ['Visibilité des en-têtes', 'Masqués à tout intermédiaire réseau'],
    ],
  },
  steps: [
    {
      title: 'Requête sécurisée',
      desc: 'Le navigateur demande https://',
      detail:
        'Le client saisit https://ssp-academy.com/. Le "s" indique au navigateur de protéger la connexion avec TLS sur le port 443 par défaut. Avant de pouvoir se connecter, il doit d’abord obtenir l’adresse IP du serveur.',
      facts: [
        ['URL', 'https://ssp-academy.com/'],
        ['Port visé', '443 (HTTPS)'],
        ['Passerelle locale', 'Routeur 192.168.1.1'],
      ],
      events: [
        { type: 'type-url', text: 'https://ssp-academy.com/' },
        { type: 'show', nodes: ['router'], frame: 'local' },
      ],
    },
    {
      title: 'Résolution DNS',
      desc: 'La même résolution qu’en HTTP, non chiffrée',
      detail:
        'La résolution se déroule de la même manière qu’en HTTP standard : requête vers 8.8.8.8 sur UDP port 53. Elle n’est pas chiffrée, tout intermédiaire peut voir le domaine interrogé.',
      facts: [
        ['Résolveur', '8.8.8.8'],
        ['Chiffrement', 'Non (DNS standard UDP 53)'],
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
          row: { time: '0.000 s', src: CLIENT_IP, dst: DNS_IP, proto: 'DNS', info: 'Query A https://ssp-academy.com/', len: `${dnsQFrame.bytes.length} B` },
          wire: dnsQFrame,
        },
        {
          type: 'packet',
          from: 'dns',
          to: 'client',
          color: 'blue',
          label: 'DNS REPLY',
          row: { time: '0.012 s', src: DNS_IP, dst: CLIENT_IP, proto: 'DNS', info: 'Answer A 203.0.113.10', len: `${dnsRFrame.bytes.length} B` },
          wire: dnsRFrame,
        },
      ],
    },
    {
      title: 'Poignée de main TCP',
      desc: 'Ouvre une connexion vers le port 443',
      detail:
        'TLS s’appuie sur TCP : une poignée de main à trois temps (SYN, SYN-ACK, ACK) s’établit d’abord vers le port 443. Rien n’est encore chiffré à ce stade.',
      facts: [
        ['Port Serveur', '443'],
        ['Port Client', '52411 (éphémère)'],
        ['Handshake', 'SYN → SYN-ACK → ACK'],
      ],
      events: [
        { type: 'show', nodes: ['web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'TCP SYN',
          row: { time: '0.024 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '52411 → 443 [SYN] Seq=1000', len: `${synFrame.bytes.length} B` },
          wire: synFrame,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'TCP SYN-ACK',
          row: { time: '0.041 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TCP', info: '443 → 52411 [SYN, ACK] Seq=5000 Ack=1001', len: `${synAckFrame.bytes.length} B` },
          wire: synAckFrame,
        },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'TCP ACK',
          row: { time: '0.058 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '52411 → 443 [ACK] Seq=1001 Ack=5001', len: `${ackFrame.bytes.length} B` },
          wire: ackFrame,
        },
      ],
    },
    {
      title: 'Négociation TLS',
      desc: 'Convient des clés, vérifie le certificat',
      detail:
        'Le client envoie son Client Hello avec l’extension SNI et ses parts de clés. Le serveur répond par Server Hello avec son certificat chiffré, vérifié par le navigateur.',
      facts: [
        ['Version', 'TLS 1.3'],
        ['Échange de clés', 'X25519 (ECDHE)'],
        ['Certificat', 'Vérifié valide'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'CLIENT HELLO',
          row: { time: '0.060 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TLSv1.3', info: 'Client Hello, SNI=https://ssp-academy.com/', len: `${chFrame.bytes.length} B` },
          wire: chFrame,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'amber',
          label: 'SERVER HELLO',
          row: { time: '0.077 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TLSv1.3', info: 'Server Hello, Change Cipher Spec', len: `${shFrame.bytes.length} B` },
          wire: shFrame,
        },
      ],
    },
    {
      title: 'Échange chiffré',
      desc: 'HTTP dans des enregistrements TLS',
      detail:
        'Le navigateur émet sa requête GET sous forme de record Application Data chiffré. Le serveur déchiffre la requête, génère la réponse HTML, la chiffre et la renvoie.',
      facts: [
        ['Chiffrement', 'AES-128-GCM'],
        ['Données masquées', 'En-têtes, URL, Cookies, Corps HTTP'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'violet',
          label: 'HTTPS GET [🔒]',
          row: { time: '0.080 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TLSv1.3', info: 'Application Data: Encrypted HTTP GET /', len: `${reqEncFrame.bytes.length} B` },
          wire: reqEncFrame,
          locked: true,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'violet',
          label: '200 OK [🔒]',
          row: { time: '0.098 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TLSv1.3', info: 'Application Data: Encrypted HTTP 200 OK', len: `${resEncFrame.bytes.length} B` },
          wire: resEncFrame,
          locked: true,
        },
      ],
    },
    {
      title: 'Affichage de la page',
      desc: 'Le navigateur affiche le cadenas',
      detail:
        'La page web sécurisée est déchiffrée localement et affichée à l’écran avec l’indicateur de sécurité cadenas.',
      facts: [
        ['Statut', 'Sécurisé (HTTPS)'],
        ['Indicateur visuel', 'Cadenas actif'],
      ],
      events: [
        { type: 'render', content: 'Secure Example' },
      ],
    },
  ],
};
