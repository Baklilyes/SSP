import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';
import { buildSshPacket } from '../../packet/builders/ssh';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const SSH_SERVER_IP = '203.0.113.22';
const SSH_PORT = 22;

// 1. Version Exchange (Client -> Server)
const vClient = buildSshPacket({ type: 'version', versionString: 'SSH-2.0-OpenSSH_9.3\r\n' });
const vTcp = buildTcpSegment({ srcPort: 54120, dstPort: SSH_PORT, seq: 1001, ack: 5001, flags: { psh: true, ack: true }, payloadLength: vClient.length });
const vIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: SSH_SERVER_IP, protocol: 6, payloadLength: vTcp.length + vClient.length });
const ethC = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const ethS = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame1 = assembleLayers([ethC, vIp, vTcp, vClient]);

// 2. KEXINIT (Server -> Client)
const kexServer = buildSshPacket({ type: 'kexinit' });
const kexTcp = buildTcpSegment({ srcPort: SSH_PORT, dstPort: 54120, seq: 5001, ack: 1001 + vClient.length, flags: { psh: true, ack: true }, payloadLength: kexServer.length });
const kexIp = buildIpv4Packet({ srcIp: SSH_SERVER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: kexTcp.length + kexServer.length });
const frame2 = assembleLayers([ethS, kexIp, kexTcp, kexServer]);

// 3. Diffie-Hellman Key Exchange (Client -> Server)
const dhInit = buildSshPacket({ type: 'kexdh_init' });
const dhInitTcp = buildTcpSegment({ srcPort: 54120, dstPort: SSH_PORT, seq: 1001 + vClient.length, ack: 5001 + kexServer.length, flags: { psh: true, ack: true }, payloadLength: dhInit.length });
const dhInitIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: SSH_SERVER_IP, protocol: 6, payloadLength: dhInitTcp.length + dhInit.length });
const frame3 = assembleLayers([ethC, dhInitIp, dhInitTcp, dhInit]);

// 4. DH Reply + Host Key Signature (Server -> Client)
const dhReply = buildSshPacket({ type: 'kexdh_reply' });
const dhReplyTcp = buildTcpSegment({ srcPort: SSH_PORT, dstPort: 54120, seq: 5001 + kexServer.length, ack: 1001 + vClient.length + dhInit.length, flags: { psh: true, ack: true }, payloadLength: dhReply.length });
const dhReplyIp = buildIpv4Packet({ srcIp: SSH_SERVER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: dhReplyTcp.length + dhReply.length });
const frame4 = assembleLayers([ethS, dhReplyIp, dhReplyTcp, dhReply]);

// 5. Encrypted Shell Data
const encSsh = buildSshPacket({ type: 'encrypted', payloadLength: 80 });
const encTcp = buildTcpSegment({ srcPort: 54120, dstPort: SSH_PORT, seq: 2000, ack: 6500, flags: { psh: true, ack: true }, payloadLength: encSsh.length });
const encIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: SSH_SERVER_IP, protocol: 6, payloadLength: encTcp.length + encSsh.length });
const frame5 = assembleLayers([ethC, encIp, encTcp, encSsh]);

export const sshProtocol: ProtocolDefinition = {
  id: 'ssh',
  name: 'SSH',
  title: 'Secure Remote Login',
  layer: 7,
  group: 'security',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['blue', 'Échange de Version'],
    ['amber', 'Négociation d’Algorithmes (KEXINIT)'],
    ['violet', 'Échange de Clés Diffie-Hellman'],
    ['green', 'Session Interactive Chiffrée'],
  ],
  overview: {
    full: 'Secure Shell Protocol',
    description:
      'SSH permet de se connecter de manière chiffrée et authentifiée à une machine distante pour exécuter des commandes dans un terminal shell, transférer des fichiers (SFTP/SCP) ou établir des tunnels.',
    facts: [
      ['Couche OSI', 'Application / Sécurité (Couche 7)'],
      ['Port par défaut', 'TCP 22'],
      ['Chiffrement', 'ChaCha20-Poly1305, AES-GCM'],
      ['Échange de clés', 'Curve25519, Diffie-Hellman'],
      ['Authentification', 'Clés publiques Ed25519/RSA ou mot de passe chiffré'],
      ['Standard', 'RFC 4253'],
    ],
  },
  outro: {
    title: 'Session SSH sécurisée active',
    desc: 'Terminal distant interactif sous tunnel chiffré',
    text:
      'L’identité de l’hôte distant a été authentifiée par sa clé d’hôte Ed25519. Les secrets de session ont été négociés sans jamais transiter sur le réseau, protégeant mots de passe et frappes de touches.',
    facts: [
      ['Port actif', 'TCP 22'],
      ['Algorithme de clé d’hôte', 'ssh-ed25519'],
      ['Chiffrement actif', 'chacha20-poly1305@openssh.com'],
    ],
  },
  steps: [
    {
      title: 'Échange de Chaîne de Version',
      desc: 'Identification des logiciels clients et serveurs',
      detail:
        'Dès la poignée de main TCP terminée sur le port 22, les deux parties s’échangent en clair leur bannière de version pour convenir du protocole (SSH-2.0).',
      facts: [
        ['Bannière client', 'SSH-2.0-OpenSSH_9.3'],
        ['Format', 'Texte ASCII terminé par CRLF'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'blue',
          label: 'SSH IDENT',
          row: { time: '0.000 s', src: CLIENT_IP, dst: SSH_SERVER_IP, proto: 'SSH', info: 'Client: SSH-2.0-OpenSSH_9.3', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Négociation d’Algorithmes (KEXINIT)',
      desc: 'Proposition des suites cryptographiques supportées',
      detail:
        'Chaque extrémité envoie son message SSH_MSG_KEXINIT contenant 16 octets aléatoires (cookie anti-rejeu) et la liste des algorithmes de chiffrement, d’échange de clés et de hachage MAC.',
      facts: [
        ['Message Code', '20 (SSH_MSG_KEXINIT)'],
        ['Échange de clés favori', 'curve25519-sha256'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'amber',
          label: 'KEXINIT',
          row: { time: '0.017 s', src: SSH_SERVER_IP, dst: CLIENT_IP, proto: 'SSH', info: 'Server: SSH_MSG_KEXINIT (KEX, Ciphers, MACs)', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Échange Diffie-Hellman & Clé d’Hôte',
      desc: 'Transmission de la clé publique éphémère et signature',
      detail:
        'Le client génère sa part éphémère Diffie-Hellman (message 30). Le serveur répond (message 31) avec sa propre part, sa clé d’hôte publique et la signature cryptographique du hachage de l’échange.',
      facts: [
        ['Clé publique client', '32 octets Curve25519'],
        ['Signature serveur', 'Garantit l’absence d’attaque Man-in-the-Middle'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'violet',
          label: 'KEXDH_INIT',
          row: { time: '0.035 s', src: CLIENT_IP, dst: SSH_SERVER_IP, proto: 'SSH', info: 'SSH_MSG_KEXDH_INIT (Curve25519 public key)', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'violet',
          label: 'KEXDH_REPLY',
          row: { time: '0.052 s', src: SSH_SERVER_IP, dst: CLIENT_IP, proto: 'SSH', info: 'SSH_MSG_KEXDH_REPLY (Host Key & Signature)', len: `${frame4.bytes.length} B` },
          wire: frame4,
        },
      ],
    },
    {
      title: 'Session Interactive Chiffrée',
      desc: 'Échange de données de terminal sous tunnel',
      detail:
        'Les deux côtés activent les nouvelles clés avec SSH_MSG_NEWKEYS. Les frappes de commande et les flux de terminal sont chiffrés et authentifiés paquet par paquet.',
      facts: [
        ['Canal', 'Session Shell interactif'],
        ['Chiffrement actif', 'ChaCha20-Poly1305'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'SSH DATA [🔒]',
          row: { time: '0.065 s', src: CLIENT_IP, dst: SSH_SERVER_IP, proto: 'SSH', info: 'Encrypted Channel Data (Terminal input/output)', len: `${frame5.bytes.length} B` },
          wire: frame5,
          locked: true,
        },
      ],
    },
  ],
};
