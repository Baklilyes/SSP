import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';
import { buildTlsRecord } from '../../packet/builders/tls';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const WEB_IP = '203.0.113.10';

// 1. Client Hello
const chTls = buildTlsRecord({ type: 'handshake', handshakeType: 'client_hello', serverName: 'https://ssp-academy.com/' });
const chTcp = buildTcpSegment({ srcPort: 52411, dstPort: 443, seq: 1001, ack: 5001, flags: { psh: true, ack: true }, payloadLength: chTls.length });
const chIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: chTcp.length + chTls.length });
const chEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const chFrame = assembleLayers([chEth, chIp, chTcp, chTls]);

// 2. Server Hello
const shTls = buildTlsRecord({ type: 'handshake', handshakeType: 'server_hello' });
const shTcp = buildTcpSegment({ srcPort: 443, dstPort: 52411, seq: 5001, ack: 1001 + chTls.length, flags: { psh: true, ack: true }, payloadLength: shTls.length });
const shIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: shTcp.length + shTls.length });
const shEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const shFrame = assembleLayers([shEth, shIp, shTcp, shTls]);

// 3. Encrypted Extensions, Cert, Finished (Server -> Client)
const encTls = buildTlsRecord({ type: 'appdata', payloadLength: 1420 });
const encTcp = buildTcpSegment({ srcPort: 443, dstPort: 52411, seq: 5001 + shTls.length, ack: 1001 + chTls.length, flags: { psh: true, ack: true }, payloadLength: encTls.length });
const encIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: encTcp.length + encTls.length });
const encFrame = assembleLayers([shEth, encIp, encTcp, encTls]);

// 4. Encrypted Application Data (Client -> Server)
const appTls = buildTlsRecord({ type: 'appdata', payloadLength: 480 });
const appTcp = buildTcpSegment({ srcPort: 52411, dstPort: 443, seq: 1001 + chTls.length, ack: 5001 + shTls.length + encTls.length, flags: { psh: true, ack: true }, payloadLength: appTls.length });
const appIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: appTcp.length + appTls.length });
const appFrame = assembleLayers([chEth, appIp, appTcp, appTls]);

export const tlsProtocol: ProtocolDefinition = {
  id: 'tls',
  name: 'TLS/SSL',
  title: 'Transport Layer Security 1.3',
  layer: 6,
  group: 'security',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['blue', 'Client Hello (Clés & Algorithmes)'],
    ['amber', 'Server Hello & Choix de Suite'],
    ['violet', 'Certificats & Extensions Chiffrées'],
    ['green', 'Données Applicatives Chiffrées'],
  ],
  overview: {
    full: 'Transport Layer Security 1.3',
    description:
      'TLS 1.3 est la norme de chiffrement moderne qui sécurise le Web (HTTPS). Il supprime les algorithmes obsolètes, impose la confidentialité persistante (PFS) et réduit le handshake à 1 seul aller-retour (1-RTT).',
    facts: [
      ['Couche OSI', 'Présentation / Sécurité (Couche 6)'],
      ['Version standard', 'TLS 1.3 (RFC 8446)'],
      ['Échange de clés', 'Diffie-Hellman éphémère (Curve25519 / X25519)'],
      ['Chiffrement symétrique', 'AEAD : AES-128-GCM ou ChaCha20-Poly1305'],
      ['Authentification', 'Certificats X.509 et signatures numériques RSA / ECDSA'],
      ['Standard', 'RFC 8446'],
    ],
  },
  outro: {
    title: 'Canal sécurisé TLS 1.3 établi',
    desc: 'Confidentialité, intégrité et authenticité garanties',
    text:
      'En 1 seul aller-retour, les clés de session ont été dérivées de manière éphémère. Même si un attaquant capture l’ensemble des paquets et s’empare ultérieurement de la clé privée du serveur, le déchiffrement rétroactif reste impossible (Perfect Forward Secrecy).',
    facts: [
      ['Temps de négociation', '1 RTT'],
      ['Suite négociée', 'TLS_AES_128_GCM_SHA256'],
      ['Confidentialité persistante (PFS)', 'Oui (Échange X25519)'],
    ],
  },
  steps: [
    {
      title: 'Client Hello',
      desc: 'Présentation des capacités et part de clé éphémère',
      detail:
        'Le client transmet la liste des suites cryptographiques qu’il supporte, le nom de domaine ciblé (extension SNI) et sa part de clé publique Diffie-Hellman (X25519).',
      facts: [
        ['Version demandée', 'TLS 1.3'],
        ['Clé publique X25519', '32 octets aléatoires'],
        ['Extension SNI', 'https://ssp-academy.com/'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'blue',
          label: 'CLIENT HELLO',
          row: { time: '0.000 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TLSv1.3', info: 'Client Hello, SNI=https://ssp-academy.com/, X25519 Key Share', len: `${chFrame.bytes.length} B` },
          wire: chFrame,
        },
      ],
    },
    {
      title: 'Server Hello & Dérivation des Clés',
      desc: 'Sélection de la suite et calcul immédiat des secrets',
      detail:
        'Le serveur répond en choisissant TLS_AES_128_GCM_SHA256 et transmet sa propre part de clé X25519. Dès cet instant, les deux parties possèdent le secret partagé et activent le chiffrement.',
      facts: [
        ['Suite retenue', 'TLS_AES_128_GCM_SHA256'],
        ['Part de clé serveur', 'Fournie dans l’extension Key Share'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'amber',
          label: 'SERVER HELLO',
          row: { time: '0.017 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TLSv1.3', info: 'Server Hello, Selected Cipher=0x1301', len: `${shFrame.bytes.length} B` },
          wire: shFrame,
        },
      ],
    },
    {
      title: 'Certificats & Finalisation Chiffrée',
      desc: 'Authentification du serveur sous tunnel chiffré',
      detail:
        'Contrairement à TLS 1.2 où le certificat était transmis en clair, TLS 1.3 chiffre les certificats, la signature Certificate Verify et le message de confirmation Finished.',
      facts: [
        ['Chiffrement actif', 'Dès la fin du Server Hello'],
        ['Chaîne X.509', 'Chiffrée (masque l’identité aux écoutes passives)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'violet',
          label: 'ENCRYPTED EXT',
          row: { time: '0.020 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TLSv1.3', info: 'Encrypted Extensions, Certificate, Finished', len: `${encFrame.bytes.length} B` },
          wire: encFrame,
          locked: true,
        },
      ],
    },
    {
      title: 'Échange de Données Applicatives Chiffrées',
      desc: 'Transport sécurisé des requêtes HTTP (HTTPS)',
      detail:
        'Le canal sécurisé est établi. Toute communication applicative (ex: requêtes HTTP) est désormais transmise sous forme de records Application Data chiffrés et authentifiés.',
      facts: [
        ['Record Type', '23 (Application Data)'],
        ['Protection', 'Confidentialité et détection d’altération AEAD'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'APP DATA [🔒]',
          row: { time: '0.040 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TLSv1.3', info: 'Application Data (Encrypted Request)', len: `${appFrame.bytes.length} B` },
          wire: appFrame,
          locked: true,
        },
      ],
    },
  ],
};
