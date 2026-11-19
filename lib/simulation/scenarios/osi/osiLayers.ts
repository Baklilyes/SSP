export type OSILayerNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OSILayerId =
  | 'physical'
  | 'data-link'
  | 'network'
  | 'transport'
  | 'session'
  | 'presentation'
  | 'application';

export type OSIPduUnit = 'bits' | 'frame' | 'packet' | 'segment' | 'data';

export interface OSILayer {
  id: OSILayerId;
  number: OSILayerNumber;
  name: string;
  nameFr: string;
  nameEn: string;
  shortName: string;
  description: string;
  descriptionFr: string;
  descriptionEn: string;
  protocols: string[];
  unit: OSIPduUnit;
  unitFr: string;
  unitEn: string;
  concepts: string[];
  conceptsFr: string[];
  conceptsEn: string[];
  color: string;
  bgRgba: string;
}

export const OSI_LAYERS: OSILayer[] = [
  {
    id: 'application',
    number: 7,
    name: 'Application',
    nameFr: 'Application',
    nameEn: 'Application',
    shortName: 'L7 · APP',
    description: 'Fournit des services réseau directement aux applications logicielles et aux utilisateurs finaux.',
    descriptionFr: 'Fournit des services réseau directement aux applications logicielles et aux utilisateurs finaux.',
    descriptionEn: 'Provides network services directly to software applications and end users.',
    protocols: ['http', 'https', 'dns', 'dhcp', 'smtp', 'pop3', 'imap', 'ftp', 'ssh', 'websocket', 'sip', 'bgp'],
    unit: 'data',
    unitFr: 'Données (Message)',
    unitEn: 'Data (Message)',
    concepts: ['API et protocoles web', 'Messages applicatifs', 'Requêtes et réponses', 'Interactions utilisateurs'],
    conceptsFr: ['API et protocoles web', 'Messages applicatifs', 'Requêtes et réponses', 'Interactions utilisateurs'],
    conceptsEn: ['Web APIs and protocols', 'Application messages', 'Requests and responses', 'User interaction'],
    color: '#ff7c28',
    bgRgba: 'rgba(255, 124, 40, 0.12)',
  },
  {
    id: 'presentation',
    number: 6,
    name: 'Présentation',
    nameFr: 'Présentation',
    nameEn: 'Presentation',
    shortName: 'L6 · PRES',
    description: 'Assure le formatage des données, la conversion de syntaxe, le chiffrement et la compression.',
    descriptionFr: 'Assure le formatage des données, la conversion de syntaxe, le chiffrement et la compression.',
    descriptionEn: 'Handles data formatting, syntax translation, encryption and compression.',
    protocols: ['tls', 'ssl', 'ssh'],
    unit: 'data',
    unitFr: 'Données formatées',
    unitEn: 'Formatted Data',
    concepts: ['Encodage binaire / UTF-8', 'Formatage JSON / XML', 'Chiffrement TLS / Sécurité', 'Compression de flux'],
    conceptsFr: ['Encodage binaire / UTF-8', 'Formatage JSON / XML', 'Chiffrement TLS / Sécurité', 'Compression de flux'],
    conceptsEn: ['UTF-8 binary encoding', 'JSON / XML syntax', 'TLS encryption / security', 'Stream compression'],
    color: '#ec4899',
    bgRgba: 'rgba(236, 72, 153, 0.12)',
  },
  {
    id: 'session',
    number: 5,
    name: 'Session',
    nameFr: 'Session',
    nameEn: 'Session',
    shortName: 'L5 · SESS',
    description: 'Établit, synchronise, coordonne et termine les sessions de dialogue entre les deux hôtes.',
    descriptionFr: 'Établit, synchronise, coordonne et termine les sessions de dialogue entre les deux hôtes.',
    descriptionEn: 'Establishes, synchronizes, coordinates, and terminates dialogue sessions between hosts.',
    protocols: ['socks', 'sip'],
    unit: 'data',
    unitFr: 'Données de session',
    unitEn: 'Session Data',
    concepts: ['Ouverture / fermeture de session', 'Points de synchronisation', 'Gestion du dialogue (Duplex)', 'Reconnexion transparente'],
    conceptsFr: ['Ouverture / fermeture de session', 'Points de synchronisation', 'Gestion du dialogue (Duplex)', 'Reconnexion transparente'],
    conceptsEn: ['Session lifecycle', 'Checkpoints & synchronization', 'Dialogue control (Duplex)', 'Reconnection tokens'],
    color: '#a855f7',
    bgRgba: 'rgba(168, 85, 247, 0.12)',
  },
  {
    id: 'transport',
    number: 4,
    name: 'Transport',
    nameFr: 'Transport',
    nameEn: 'Transport',
    shortName: 'L4 · TRANS',
    description: 'Garantit la communication de bout en bout, le multiplexage par ports et le contrôle de flux.',
    descriptionFr: 'Garantit la communication de bout en bout, le multiplexage par ports et le contrôle de flux.',
    descriptionEn: 'Provides end-to-end communication, port multiplexing, reliability, and flow control.',
    protocols: ['tcp', 'udp', 'quic'],
    unit: 'segment',
    unitFr: 'Segment / Datagramme',
    unitEn: 'Segment / Datagram',
    concepts: ['Numéros de ports source et destination', 'Fiabilité et acquittements (ACK)', 'Contrôle de congestion', 'Poignée de main TCP (Handshake)'],
    conceptsFr: ['Numéros de ports source et destination', 'Fiabilité et acquittements (ACK)', 'Contrôle de congestion', 'Poignée de main TCP (Handshake)'],
    conceptsEn: ['Source and destination ports', 'Reliability and ACKs', 'Congestion control', 'TCP 3-way handshake'],
    color: '#3b82f6',
    bgRgba: 'rgba(59, 130, 246, 0.12)',
  },
  {
    id: 'network',
    number: 3,
    name: 'Réseau',
    nameFr: 'Réseau',
    nameEn: 'Network',
    shortName: 'L3 · NET',
    description: 'Achemine les paquets à travers les routeurs d’Internet grâce à l’adressage logique IP.',
    descriptionFr: 'Achemine les paquets à travers les routeurs d’Internet grâce à l’adressage logique IP.',
    descriptionEn: 'Routes packets across routers and internet subnets using logical IP addressing.',
    protocols: ['ip', 'ipv6', 'icmp', 'igmp', 'bgp', 'ipsec', 'wireguard'],
    unit: 'packet',
    unitFr: 'Paquet (Datagramme IP)',
    unitEn: 'Packet (IP Datagram)',
    concepts: ['Adresses IP (IPv4 / IPv6)', 'Routage mondial et tables de routage', 'Durée de vie (TTL)', 'Fragmentation et réassemblage'],
    conceptsFr: ['Adresses IP (IPv4 / IPv6)', 'Routage mondial et tables de routage', 'Durée de vie (TTL)', 'Fragmentation et réassemblage'],
    conceptsEn: ['IP addresses (IPv4 / IPv6)', 'Global internet routing tables', 'Time to Live (TTL)', 'Packet fragmentation'],
    color: '#06b6d4',
    bgRgba: 'rgba(6, 182, 212, 0.12)',
  },
  {
    id: 'data-link',
    number: 2,
    name: 'Liaison de données',
    nameFr: 'Liaison de données',
    nameEn: 'Data Link',
    shortName: 'L2 · LINK',
    description: 'Encapsule les paquets en trames, gère l’adressage physique MAC et contrôle l’accès au câble.',
    descriptionFr: 'Encapsule les paquets en trames, gère l’adressage physique MAC et contrôle l’accès au câble.',
    descriptionEn: 'Encapsulates packets into frames, handles hardware MAC addressing, and controls wire access.',
    protocols: ['ethernet', 'wifi', 'pppoe', 'wpa3', 'radius'],
    unit: 'frame',
    unitFr: 'Trame (Frame)',
    unitEn: 'Frame',
    concepts: ['Adresses MAC physiques (48 bits)', 'Commutation locale (Switches)', 'Détection d’erreurs (FCS / CRC32)', 'En-tête Ethernet et EtherType'],
    conceptsFr: ['Adresses MAC physiques (48 bits)', 'Commutation locale (Switches)', 'Détection d’erreurs (FCS / CRC32)', 'En-tête Ethernet et EtherType'],
    conceptsEn: ['Hardware MAC addresses (48-bit)', 'Local network switching', 'Error check (FCS / CRC32)', 'Ethernet header & EtherType'],
    color: '#10b981',
    bgRgba: 'rgba(16, 185, 129, 0.12)',
  },
  {
    id: 'physical',
    number: 1,
    name: 'Physique',
    nameFr: 'Physique',
    nameEn: 'Physical',
    shortName: 'L1 · PHYS',
    description: 'Convertit les trames en signaux physiques bruts (bits 0 et 1) transmis sur le support matériel.',
    descriptionFr: 'Convertit les trames en signaux physiques bruts (bits 0 et 1) transmis sur le support matériel.',
    descriptionEn: 'Converts frames into raw physical signals (bits 0 and 1) transmitted over physical media.',
    protocols: ['ethernet', 'wifi'],
    unit: 'bits',
    unitFr: 'Bits (Signaux)',
    unitEn: 'Bits (Signals)',
    concepts: ['Courant électrique (RJ45 cuivre)', 'Impulsions lumineuses (Fibre optique)', 'Ondes radio (Wi-Fi 2.4/5 GHz)', 'Codage de signal et débit binaire'],
    conceptsFr: ['Courant électrique (RJ45 cuivre)', 'Impulsions lumineuses (Fibre optique)', 'Ondes radio (Wi-Fi 2.4/5 GHz)', 'Codage de signal et débit binaire'],
    conceptsEn: ['Electrical voltages (copper RJ45)', 'Light pulses (Optical fiber)', 'Radio frequencies (Wi-Fi 2.4/5GHz)', 'Bit rate & modulation'],
    color: '#eab308',
    bgRgba: 'rgba(234, 179, 8, 0.12)',
  },
];

export const OSI_LAYERS_TOP_DOWN = OSI_LAYERS;
export const OSI_LAYERS_BOTTOM_UP = [...OSI_LAYERS].reverse();

// Helper pour retrouver une couche par son numéro
export function getLayerByNumber(num: OSILayerNumber): OSILayer {
  return OSI_LAYERS.find((l) => l.number === num) || OSI_LAYERS[0];
}

// Helper pour retrouver une couche par son ID
export function getLayerById(id: string): OSILayer | undefined {
  return OSI_LAYERS.find((l) => l.id === id);
}
