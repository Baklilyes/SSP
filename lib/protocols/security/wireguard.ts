import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { buildWireguardPacket } from '../../packet/builders/wireguard';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const WG_SERVER_IP = '198.51.100.200';
const WG_PORT = 51820;

// 1. Handshake Initiation (Client -> Server)
const initWg = buildWireguardPacket({ type: 'initiation' });
const initUdp = buildUdpDatagram({ srcPort: 49123, dstPort: WG_PORT, payloadLength: initWg.length });
const initIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WG_SERVER_IP, protocol: 17, payloadLength: initUdp.length + initWg.length });
const initEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const initFrame = assembleLayers([initEth, initIp, initUdp, initWg]);

// 2. Handshake Response (Server -> Client)
const respWg = buildWireguardPacket({ type: 'response' });
const respUdp = buildUdpDatagram({ srcPort: WG_PORT, dstPort: 49123, payloadLength: respWg.length });
const respIp = buildIpv4Packet({ srcIp: WG_SERVER_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: respUdp.length + respWg.length });
const respEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const respFrame = assembleLayers([respEth, respIp, respUdp, respWg]);

// 3. Encrypted Data Transfer (Client -> Server)
const dataWg1 = buildWireguardPacket({ type: 'data', counter: 0, payloadLength: 1420 });
const dataUdp1 = buildUdpDatagram({ srcPort: 49123, dstPort: WG_PORT, payloadLength: dataWg1.length });
const dataIp1 = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WG_SERVER_IP, protocol: 17, payloadLength: dataUdp1.length + dataWg1.length });
const dataFrame1 = assembleLayers([initEth, dataIp1, dataUdp1, dataWg1]);

// 4. Encrypted Data Response (Server -> Client)
const dataWg2 = buildWireguardPacket({ type: 'data', counter: 0, payloadLength: 1420 });
const dataUdp2 = buildUdpDatagram({ srcPort: WG_PORT, dstPort: 49123, payloadLength: dataWg2.length });
const dataIp2 = buildIpv4Packet({ srcIp: WG_SERVER_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: dataUdp2.length + dataWg2.length });
const dataFrame2 = assembleLayers([respEth, dataIp2, dataUdp2, dataWg2]);

export const wireguardProtocol: ProtocolDefinition = {
  id: 'wireguard',
  name: 'WireGuard',
  title: 'A Modern, Fast VPN',
  layer: 3,
  group: 'security',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['amber', 'Handshake Initiation'],
    ['blue', 'Handshake Response'],
    ['green', 'Données VPN Chiffrées (ChaCha20)'],
  ],
  overview: {
    full: 'WireGuard Secure Network Tunnel',
    description:
      'WireGuard est un protocole VPN de nouvelle génération extrêmement rapide et simple. Fondé sur le cadre Noise Protocol (Noise_IK), il remplace les architectures complexes d’IPsec et d’OpenVPN avec moins de 4000 lignes de code.',
    facts: [
      ['Couche OSI', 'Réseau / Tunnel (Couche 3)'],
      ['Transport', 'UDP (port standard 51820)'],
      ['Cryptographie', 'Curve25519, ChaCha20-Poly1305, BLAKE2s, SipHash24'],
      ['Mécanisme clé', 'Cryptokey Routing (association clé publique ↔ IP autorisées)'],
      ['Standard', 'RFC 8598'],
    ],
  },
  outro: {
    title: 'Tunnel VPN WireGuard établi',
    desc: 'Performances maximales et furtivité réseau',
    text:
      'En un unique échange (Initiation + Response), le tunnel WireGuard est opérationnel. Lorsqu’aucun trafic ne circule, WireGuard reste silencieux et ne transmet aucun paquet pour empêcher le scan de ports (Stealth Mode).',
    facts: [
      ['Handshake', '1-RTT (Initiation + Response)'],
      ['Chiffrement', 'ChaCha20-Poly1305 avec compteur 64 bits'],
      ['Mode silencieux', 'Aucune réponse aux paquets non authentifiés'],
    ],
  },
  steps: [
    {
      title: 'Handshake Initiation',
      desc: 'Envoi de la part éphémère et de la clé statique chiffrée',
      detail:
        'Le client génère une clé éphémère Curve25519, chiffre sa propre clé publique statique avec la clé publique du serveur, et transmet le premier message (Type 1) avec un horodatage chiffré anti-rejeu.',
      facts: [
        ['Message', 'Type 1 (148 octets)'],
        ['Clé éphémère', 'Curve25519 (32 octets)'],
        ['Port d’écoute', 'UDP 51820'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'WG INITIATION',
          row: { time: '0.000 s', src: CLIENT_IP, dst: WG_SERVER_IP, proto: 'WireGuard', info: 'Handshake Initiation to 198.51.100.200:51820', len: `${initFrame.bytes.length} B` },
          wire: initFrame,
        },
      ],
    },
    {
      title: 'Handshake Response',
      desc: 'Réponse du serveur et finalisation des secrets',
      detail:
        'Le serveur valide le message, génère sa propre clé éphémère et retourne le message Type 2 (92 octets). Les deux pairs dérivent leurs clés d’envoi et de réception symétriques.',
      facts: [
        ['Message', 'Type 2 (92 octets)'],
        ['Statut', 'Clés de session activées'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'blue',
          label: 'WG RESPONSE',
          row: { time: '0.017 s', src: WG_SERVER_IP, dst: CLIENT_IP, proto: 'WireGuard', info: 'Handshake Response (Session established)', len: `${respFrame.bytes.length} B` },
          wire: respFrame,
        },
      ],
    },
    {
      title: 'Transport de Données Tunnelisées',
      desc: 'Encapsulation de paquets IP chiffrés',
      detail:
        'Le trafic réseau de la machine est encapsulé dans des paquets Type 4. Chaque paquet est chiffré par ChaCha20-Poly1305 avec un compteur d’octets strict servant de nonce unique.',
      facts: [
        ['Type de paquet', 'Type 4 (Transport Data)'],
        ['Routage', 'Cryptokey Routing'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'WG DATA [🔒]',
          row: { time: '0.025 s', src: CLIENT_IP, dst: WG_SERVER_IP, proto: 'WireGuard', info: 'Encrypted Transport Data (Counter 0)', len: `${dataFrame1.bytes.length} B` },
          wire: dataFrame1,
          locked: true,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'WG DATA [🔒]',
          row: { time: '0.042 s', src: WG_SERVER_IP, dst: CLIENT_IP, proto: 'WireGuard', info: 'Encrypted Transport Data Reply (Counter 0)', len: `${dataFrame2.bytes.length} B` },
          wire: dataFrame2,
          locked: true,
        },
      ],
    },
  ],
};
