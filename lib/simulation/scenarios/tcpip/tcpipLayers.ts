export type TCPIPLayerNumber = 1 | 2 | 3 | 4;

export type TCPIPLayerId = 'host-network' | 'host-to-network' | 'internet' | 'transport' | 'application';

export type TCPIPPduUnit = 'message' | 'segment' | 'datagram' | 'packet' | 'frame' | 'bits';

export interface TCPIPLayer {
  id: TCPIPLayerId;
  number: TCPIPLayerNumber;
  name: string;
  nameFr: string;
  nameEn: string;
  shortName: string;
  description: string;
  descriptionFr: string;
  descriptionEn: string;
  protocols: string[];
  unit: TCPIPPduUnit;
  unitFr: string;
  unitEn: string;
  concepts: string[];
  conceptsFr: string[];
  conceptsEn: string[];
  color: string;
  bgRgba: string;
  osiEquivalentFr: string;
  osiEquivalentEn: string;
  osiLayerNumbers: number[];
  osiEquivalents: number[];
}

export const TCPIP_LAYERS: TCPIPLayer[] = [
  {
    id: 'host-network',
    number: 1,
    name: 'Hôte-Réseau (Accès Réseau)',
    nameFr: 'Hôte-Réseau (Accès Réseau)',
    nameEn: 'Host-to-Network (Network Access)',
    shortName: 'L1 · ACCÈS',
    description:
      'Spécifie la transmission des trames sur le média physique local et l’adressage matériel (ex. Ethernet, Wi-Fi).',
    descriptionFr:
      'Spécifie la transmission des trames sur le média physique local et l’adressage matériel (ex. Ethernet, Wi-Fi).',
    descriptionEn:
      'Specifies frame transmission over the physical local link and hardware addressing (e.g. Ethernet, Wi-Fi).',
    protocols: ['ethernet', 'wifi', 'ppp', 'arp'],
    unit: 'frame',
    unitFr: 'Trame (Frame) & Bits',
    unitEn: 'Frame & Bits',
    concepts: [
      'Adressage MAC source et destination',
      'Encapsulation en trame Ethernet II',
      'Contrôle de redondance cyclique (CRC/FCS)',
      'Signal électrique, optique ou radioélectrique',
    ],
    conceptsFr: [
      'Adressage MAC source et destination',
      'Encapsulation en trame Ethernet II',
      'Contrôle de redondance cyclique (CRC/FCS)',
      'Signal électrique, optique ou radioélectrique',
    ],
    conceptsEn: [
      'Source and destination MAC addressing',
      'Ethernet II frame encapsulation',
      'Cyclic redundancy check (CRC/FCS)',
      'Electrical, optical, or radio transmission',
    ],
    color: '#10b981',
    bgRgba: 'rgba(16, 185, 129, 0.12)',
    osiEquivalentFr: 'Couches 1 (Physique) et 2 (Liaison de données) du modèle OSI',
    osiEquivalentEn: 'Layers 1 (Physical) and 2 (Data Link) of the OSI model',
    osiLayerNumbers: [1, 2],
    osiEquivalents: [2, 1],
  },
  {
    id: 'internet',
    number: 2,
    name: 'Internet',
    nameFr: 'Internet',
    nameEn: 'Internet',
    shortName: 'L2 · INET',
    description:
      'Assure l’acheminement des datagrammes IP d’un bout à l’autre du réseau à travers des routeurs interconnectés.',
    descriptionFr:
      'Assure l’acheminement des datagrammes IP d’un bout à l’autre du réseau à travers des routeurs interconnectés.',
    descriptionEn:
      'Ensures end-to-end routing and delivery of IP datagrams across interconnected routers.',
    protocols: ['ip', 'ipv6', 'icmp', 'arp', 'bgp', 'ospf', 'ipsec'],
    unit: 'packet',
    unitFr: 'Paquet / Datagramme IP',
    unitEn: 'IP Packet / Datagram',
    concepts: [
      'Adressage logique universel (IPv4 / IPv6)',
      'Routage et sélection du prochain saut (Next-Hop)',
      'Durée de vie du paquet (TTL / Hop Limit)',
      'Indépendance du média sous-jacent',
    ],
    conceptsFr: [
      'Adressage logique universel (IPv4 / IPv6)',
      'Routage et sélection du prochain saut (Next-Hop)',
      'Durée de vie du paquet (TTL / Hop Limit)',
      'Indépendance du média sous-jacent',
    ],
    conceptsEn: [
      'Universal logical addressing (IPv4 / IPv6)',
      'Routing and next-hop selection',
      'Packet lifetime (TTL / Hop Limit)',
      'Independence from underlying transmission media',
    ],
    color: '#0ea5e9',
    bgRgba: 'rgba(14, 165, 233, 0.12)',
    osiEquivalentFr: 'Couche 3 (Réseau) du modèle OSI',
    osiEquivalentEn: 'Layer 3 (Network) of the OSI model',
    osiLayerNumbers: [3],
    osiEquivalents: [3],
  },
  {
    id: 'transport',
    number: 3,
    name: 'Transport',
    nameFr: 'Transport',
    nameEn: 'Transport',
    shortName: 'L3 · TRANS',
    description:
      'Assure la communication de bout en bout entre processus applicatifs hôte-à-hôte, avec gestion des ports, du flux et de la fiabilité.',
    descriptionFr:
      'Assure la communication de bout en bout entre processus applicatifs hôte-à-hôte, avec gestion des ports, du flux et de la fiabilité.',
    descriptionEn:
      'Provides end-to-end communication between application processes with ports, flow control, and optional reliability.',
    protocols: ['tcp', 'udp', 'quic', 'tls'],
    unit: 'segment',
    unitFr: 'Segment (TCP) / Datagramme (UDP)',
    unitEn: 'Segment (TCP) / Datagram (UDP)',
    concepts: [
      'Multiplexage par numéros de ports (0-65535)',
      'TCP : Fiabilité, séquence, contrôle de congestion',
      'UDP : Sans connexion, faible latence, envoi direct',
      'Détection d’erreurs par Checksum',
    ],
    conceptsFr: [
      'Multiplexage par numéros de ports (0-65535)',
      'TCP : Fiabilité, séquence, contrôle de congestion',
      'UDP : Sans connexion, faible latence, envoi direct',
      'Détection d’erreurs par Checksum',
    ],
    conceptsEn: [
      'Port number multiplexing (0-65535)',
      'TCP: Reliability, sequencing, congestion control',
      'UDP: Connectionless, low latency, raw datagrams',
      'Error verification with checksums',
    ],
    color: '#6366f1',
    bgRgba: 'rgba(99, 102, 241, 0.12)',
    osiEquivalentFr: 'Couche 4 (Transport) du modèle OSI',
    osiEquivalentEn: 'Layer 4 (Transport) of the OSI model',
    osiLayerNumbers: [4],
    osiEquivalents: [4],
  },
  {
    id: 'application',
    number: 4,
    name: 'Application',
    nameFr: 'Application',
    nameEn: 'Application',
    shortName: 'L4 · APP',
    description:
      'Englobe tous les protocoles de haut niveau utilisés directement par les applications logicielles (Web, DNS, Email, Fichiers).',
    descriptionFr:
      'Englobe tous les protocoles de haut niveau utilisés directement par les applications logicielles (Web, DNS, Email, Fichiers).',
    descriptionEn:
      'Encompasses all high-level protocols used directly by user application software (Web, DNS, Email, Files).',
    protocols: ['http', 'https', 'dns', 'dhcp', 'smtp', 'ftp', 'ssh', 'websocket', 'sip', 'bgp', 'modbus'],
    unit: 'message',
    unitFr: 'Message / Données brutes',
    unitEn: 'Message / Raw Data',
    concepts: [
      'Services réseau pour les logiciels utilisateurs',
      'Protocoles standards (HTTP/HTTPS, DNS, DHCP, SMTP)',
      'Formatage, encodage et sécurité intégrés par les protocoles',
      'Modèle Client-Serveur et Peer-to-Peer',
    ],
    conceptsFr: [
      'Services réseau pour les logiciels utilisateurs',
      'Protocoles standards (HTTP/HTTPS, DNS, DHCP, SMTP)',
      'Formatage, encodage et sécurité intégrés par les protocoles',
      'Modèle Client-Serveur et Peer-to-Peer',
    ],
    conceptsEn: [
      'Network services for user applications',
      'Standard protocols (HTTP/HTTPS, DNS, DHCP, SMTP)',
      'Formatting, encoding, and security handled in-protocol',
      'Client-Server and Peer-to-Peer models',
    ],
    color: '#ff7c28',
    bgRgba: 'rgba(255, 124, 40, 0.12)',
    osiEquivalentFr: 'Couches 5 (Session), 6 (Présentation) et 7 (Application) du modèle OSI',
    osiEquivalentEn: 'Layers 5 (Session), 6 (Presentation), and 7 (Application) of the OSI model',
    osiLayerNumbers: [5, 6, 7],
    osiEquivalents: [7, 6, 5],
  },
];

/** Ordre descendant canonique : 4 (haut) vers 1 (bas) */
export const TCPIP_LAYERS_TOP_DOWN = [...TCPIP_LAYERS].reverse();

/** Ordre ascendant canonique : 1 (bas) vers 4 (haut) */
export const TCPIP_LAYERS_BOTTOM_UP = [...TCPIP_LAYERS];

export function getTCPIPLayerByNumber(num: number): TCPIPLayer {
  const found = TCPIP_LAYERS.find((l) => l.number === num);
  return found || TCPIP_LAYERS[0];
}

export function getTCPIPLayerById(id: string): TCPIPLayer | undefined {
  if (id === 'host-to-network') return TCPIP_LAYERS.find((l) => l.id === 'host-network');
  return TCPIP_LAYERS.find((l) => l.id === id);
}

/** Modèle Hybride 5 couches utilisé dans l'enseignement réseau moderne */
export interface HybridLayer {
  number: number;
  nameFr: string;
  nameEn: string;
  tcpipLayer: string;
  osiLayer: string;
  color: string;
}

export const HYBRID_5_LAYERS: HybridLayer[] = [
  {
    number: 5,
    nameFr: 'Application',
    nameEn: 'Application',
    tcpipLayer: '4 — Application',
    osiLayer: '7, 6, 5 — Application, Présentation, Session',
    color: '#ff7c28',
  },
  {
    number: 4,
    nameFr: 'Transport',
    nameEn: 'Transport',
    tcpipLayer: '3 — Transport',
    osiLayer: '4 — Transport',
    color: '#6366f1',
  },
  {
    number: 3,
    nameFr: 'Réseau (Network / Internet)',
    nameEn: 'Network (Internet)',
    tcpipLayer: '2 — Internet',
    osiLayer: '3 — Réseau (Network)',
    color: '#0ea5e9',
  },
  {
    number: 2,
    nameFr: 'Liaison de données (Data Link)',
    nameEn: 'Data Link',
    tcpipLayer: '1 — Hôte-Réseau (partie haute)',
    osiLayer: '2 — Liaison de données',
    color: '#10b981',
  },
  {
    number: 1,
    nameFr: 'Physique (Physical)',
    nameEn: 'Physical',
    tcpipLayer: '1 — Hôte-Réseau (partie basse)',
    osiLayer: '1 — Physique',
    color: '#14b8a6',
  },
];
