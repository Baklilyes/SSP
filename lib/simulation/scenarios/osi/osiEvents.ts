import { SimulationStep, PacketEvent } from '../../types';
import {
  OSIEncapsulationState,
  buildOsiDissectedFrames,
  CLIENT_IP,
  SERVER_IP,
  CLIENT_MAC,
  ROUTER_MAC,
  RAW_PAYLOAD_TEXT,
  RAW_PAYLOAD_BITS,
} from './osiPacket';
import { OSILayerNumber } from './osiLayers';

export interface OSIStepMeta {
  layer: OSILayerNumber;
  action:
    | 'data-created'
    | 'presentation'
    | 'session'
    | 'add-tcp'
    | 'add-ip'
    | 'add-ethernet'
    | 'transmit-bits'
    | 'receive-bits'
    | 'strip-ethernet'
    | 'strip-ip'
    | 'strip-tcp'
    | 'data-delivered';
  direction: 'encapsulation' | 'transmission' | 'decapsulation';
  packetState: OSIEncapsulationState;
  node: 'client' | 'network' | 'server';
}

export type OSISimulationStep = SimulationStep & {
  osiMeta: OSIStepMeta;
  titleEn?: string;
  descEn?: string;
  detailEn?: string;
  factsEn?: [string, string][];
};

const frames = buildOsiDissectedFrames();

export const OSI_SIMULATION_STEPS: OSISimulationStep[] = [
  // 1. Couche 7 Application (Émetteur)
  {
    title: 'Création du message applicatif',
    desc: 'L’application génère la donnée brute',
    detail:
      'L’utilisateur saisit ou transmet le message "Hello". La couche Application (L7) initie le processus en créant la charge utile (Payload) de 5 octets sans aucun en-tête de transport ou réseau.',
    facts: [
      ['Couche active', '7 · Application'],
      ['Unité de données (PDU)', 'Données applicatives'],
      ['Message brut', '"Hello" (5 octets)'],
      ['Rôle de la couche', 'Interface directe avec le logiciel utilisateur'],
    ],
    titleEn: 'Application Message Creation',
    descEn: 'Application generates raw payload',
    detailEn:
      'The user sends the message "Hello". The Application layer (L7) initiates the communication by generating a 5-byte payload without transport or network headers.',
    factsEn: [
      ['Active Layer', '7 · Application'],
      ['Data Unit (PDU)', 'Application Data'],
      ['Raw Message', '"Hello" (5 bytes)'],
      ['Layer Role', 'Direct interface with user application software'],
    ],
    osiMeta: {
      layer: 7,
      action: 'data-created',
      direction: 'encapsulation',
      node: 'client',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        currentLayer: 7,
        direction: 'encapsulation',
        rawBytesLength: 5,
      },
    },
    events: [
      { type: 'show', nodes: ['client'], frame: 'client' },
      {
        type: 'packet',
        from: 'client',
        to: 'client',
        color: 'amber',
        label: 'DATA: "Hello"',
        payload: 'Hello',
        row: {
          time: '0.000 s',
          src: 'Client (App)',
          dst: 'L6 Présentation',
          proto: 'DATA',
          info: 'Application message created: "Hello"',
          len: '5 B',
        },
        wire: frames.appFrame,
      },
    ],
  },

  // 2. Couche 6 Présentation (Émetteur)
  {
    title: 'Encodage et mise en forme',
    desc: 'Traduction des caractères en octets UTF-8',
    detail:
      'La couche Présentation (L6) convertit la chaîne "Hello" en un encodage binaire universel (UTF-8 / ASCII : 0x48 0x65 0x6c 0x6c 0x6f). Elle assure également, si nécessaire, le chiffrement (TLS) et la compression.',
    facts: [
      ['Couche active', '6 · Présentation'],
      ['Unité de données (PDU)', 'Données formatées'],
      ['Encodage appliqué', 'UTF-8 / ASCII standard'],
      ['Octets correspondants', '0x48 0x65 0x6C 0x6C 0x6F'],
    ],
    titleEn: 'Encoding and Presentation',
    descEn: 'Character translation into UTF-8 bytes',
    detailEn:
      'The Presentation layer (L6) converts the string "Hello" into a standardized binary encoding (UTF-8 / ASCII: 0x48 0x65 0x6c 0x6c 0x6f). It also handles encryption (TLS) and data compression if required.',
    factsEn: [
      ['Active Layer', '6 · Presentation'],
      ['Data Unit (PDU)', 'Formatted Data'],
      ['Applied Encoding', 'Standard UTF-8 / ASCII'],
      ['Byte Values', '0x48 0x65 0x6C 0x6C 0x6F'],
    ],
    osiMeta: {
      layer: 6,
      action: 'presentation',
      direction: 'encapsulation',
      node: 'client',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        presentationEncoding: 'UTF-8 (ASCII)',
        currentLayer: 6,
        direction: 'encapsulation',
        rawBytesLength: 5,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'client',
        to: 'client',
        color: 'amber',
        label: 'UTF-8: 0x48 65 6C 6C 6F',
        payload: 'UTF-8 Encoded',
        row: {
          time: '0.002 s',
          src: 'L6 Présentation',
          dst: 'L5 Session',
          proto: 'UTF-8',
          info: 'Standard syntax formatting: 5 bytes encoded',
          len: '5 B',
        },
        wire: frames.appFrame,
      },
    ],
  },

  // 3. Couche 5 Session (Émetteur)
  {
    title: 'Gestion de la session de dialogue',
    desc: 'Coordination et jetons de synchronisation',
    detail:
      'La couche Session (L5) établit les repères de dialogue entre les deux applications hôtes. Elle s’assure que la communication est synchronisée (duplex intégral) avant de transmettre les données à la couche de transport.',
    facts: [
      ['Couche active', '5 · Session'],
      ['Unité de données (PDU)', 'Données de session'],
      ['Mode de dialogue', 'Full-Duplex bidirectionnel'],
      ['Point de contrôle', 'Session ID #49281'],
    ],
    titleEn: 'Dialogue Session Management',
    descEn: 'Coordination and sync checkpoints',
    detailEn:
      'The Session layer (L5) establishes dialogue checkpoints between the two host applications. It ensures communication is properly coordinated and synchronized before passing data to the transport layer.',
    factsEn: [
      ['Active Layer', '5 · Session'],
      ['Data Unit (PDU)', 'Session Data'],
      ['Dialogue Mode', 'Bidirectional Full-Duplex'],
      ['Checkpoint', 'Session ID #49281'],
    ],
    osiMeta: {
      layer: 5,
      action: 'session',
      direction: 'encapsulation',
      node: 'client',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        presentationEncoding: 'UTF-8',
        sessionToken: 'Session ID #49281',
        currentLayer: 5,
        direction: 'encapsulation',
        rawBytesLength: 5,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'client',
        to: 'client',
        color: 'violet',
        label: 'SESSION #49281',
        payload: 'Session Synced',
        row: {
          time: '0.004 s',
          src: 'L5 Session',
          dst: 'L4 Transport',
          proto: 'SESSION',
          info: 'Dialog managed and synchronized',
          len: '5 B',
        },
        wire: frames.appFrame,
      },
    ],
  },

  // 4. Couche 4 Transport (Émetteur)
  {
    title: 'Encapsulation Transport : En-tête TCP',
    desc: 'Ajout des ports source/destination et numéros de séquence',
    detail:
      'La couche Transport (L4) encapsule le message dans un Segment TCP de 20 octets. Elle alloue le port source éphémère 49152 au client et vise le port standard 80 (HTTP). La taille du message passe à 25 octets.',
    facts: [
      ['Couche active', '4 · Transport'],
      ['Unité de données (PDU)', 'Segment TCP'],
      ['Ports (Source → Dest)', '49152 → 80'],
      ['En-tête ajouté', 'TCP (20 octets, Seq: 1000, Flags: PSH+ACK)'],
    ],
    titleEn: 'Transport Encapsulation: TCP Header',
    descEn: 'Adding source/dest ports and sequence numbers',
    detailEn:
      'The Transport layer (L4) encapsulates the message into a 20-byte TCP Segment. It assigns ephemeral source port 49152 to the client and targets standard port 80 (HTTP). Message size increases to 25 bytes.',
    factsEn: [
      ['Active Layer', '4 · Transport'],
      ['Data Unit (PDU)', 'TCP Segment'],
      ['Ports (Source → Dest)', '49152 → 80'],
      ['Added Header', 'TCP (20 bytes, Seq: 1000, Flags: PSH+ACK)'],
    ],
    osiMeta: {
      layer: 4,
      action: 'add-tcp',
      direction: 'encapsulation',
      node: 'client',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        transportHeader: {
          protocol: 'TCP',
          sourcePort: 49152,
          destinationPort: 80,
          seq: 1000,
          flags: 'PSH, ACK',
        },
        currentLayer: 4,
        direction: 'encapsulation',
        rawBytesLength: 25,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'client',
        to: 'client',
        color: 'blue',
        label: 'TCP SEGMENT [Port 49152 → 80]',
        payload: ['TCP Header (20B)', 'Data "Hello" (5B)'],
        row: {
          time: '0.006 s',
          src: 'L4 Transport',
          dst: 'L3 Réseau',
          proto: 'TCP',
          info: 'Added TCP header (20 B) · Total 25 B',
          len: '25 B',
        },
        wire: frames.transportFrame,
      },
    ],
  },

  // 5. Couche 3 Réseau (Émetteur)
  {
    title: 'Encapsulation Réseau : En-tête IPv4',
    desc: 'Ajout de l’adressage logique IP et du routage',
    detail:
      'La couche Réseau (L3) encapsule le segment TCP dans un Paquet IP en lui adjoignant un en-tête IPv4 de 20 octets. Elle y inscrit l’adresse IP source (192.168.1.100), l’IP de destination (203.0.113.10) et le TTL (64). La taille totale atteint 45 octets.',
    facts: [
      ['Couche active', '3 · Réseau'],
      ['Unité de données (PDU)', 'Paquet (Datagramme IP)'],
      ['Adresses (IP Source → Dest)', '192.168.1.100 → 203.0.113.10'],
      ['En-tête ajouté', 'IPv4 (20 octets, Protocole: TCP/6, TTL: 64)'],
    ],
    titleEn: 'Network Encapsulation: IPv4 Header',
    descEn: 'Adding logical IP addressing and routing',
    detailEn:
      'The Network layer (L3) encapsulates the TCP segment into an IP Packet by attaching a 20-byte IPv4 header. It adds source IP (192.168.1.100), destination IP (203.0.113.10), and TTL (64). Total size reaches 45 bytes.',
    factsEn: [
      ['Active Layer', '3 · Network'],
      ['Data Unit (PDU)', 'Packet (IP Datagram)'],
      ['Addresses (Src → Dst IP)', '192.168.1.100 → 203.0.113.10'],
      ['Added Header', 'IPv4 (20 bytes, Protocol: TCP/6, TTL: 64)'],
    ],
    osiMeta: {
      layer: 3,
      action: 'add-ip',
      direction: 'encapsulation',
      node: 'client',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        transportHeader: {
          protocol: 'TCP',
          sourcePort: 49152,
          destinationPort: 80,
          seq: 1000,
          flags: 'PSH, ACK',
        },
        networkHeader: {
          version: 4,
          sourceIP: CLIENT_IP,
          destinationIP: SERVER_IP,
          ttl: 64,
          protocol: 'TCP (6)',
        },
        currentLayer: 3,
        direction: 'encapsulation',
        rawBytesLength: 45,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'client',
        to: 'client',
        color: 'blue',
        label: 'IP PACKET [192.168.1.100 → 203.0.113.10]',
        payload: ['IPv4 (20B)', 'TCP (20B)', 'Data (5B)'],
        row: {
          time: '0.008 s',
          src: 'L3 Réseau',
          dst: 'L2 Liaison',
          proto: 'IPv4',
          info: 'Added IPv4 header (20 B) · Total 45 B',
          len: '45 B',
        },
        wire: frames.networkFrame,
      },
    ],
  },

  // 6. Couche 2 Liaison de données (Émetteur)
  {
    title: 'Encapsulation Liaison : Trame Ethernet',
    desc: 'Ajout des adresses physiques MAC et du contrôle FCS',
    detail:
      'La couche Liaison de données (L2) enveloppe le paquet IP dans une Trame Ethernet II de 14 octets d’en-tête (MAC Source, MAC Passerelle/Dest, EtherType 0x0800 IPv4) complétée par un code de contrôle d’erreur CRC32/FCS. La trame mesure 59 octets.',
    facts: [
      ['Couche active', '2 · Liaison de données'],
      ['Unité de données (PDU)', 'Trame Ethernet (Frame)'],
      ['Adresses physiques (MAC)', `${CLIENT_MAC} → ${ROUTER_MAC}`],
      ['En-tête ajouté', 'Ethernet II (14 octets, EtherType: 0x0800)'],
    ],
    titleEn: 'Data Link Encapsulation: Ethernet Frame',
    descEn: 'Adding MAC hardware addresses and FCS check',
    detailEn:
      'The Data Link layer (L2) wraps the IP packet into an Ethernet II Frame with a 14-byte header (Source MAC, Gateway/Dest MAC, EtherType 0x0800 IPv4) followed by CRC32/FCS error check. The frame measures 59 bytes.',
    factsEn: [
      ['Active Layer', '2 · Data Link'],
      ['Data Unit (PDU)', 'Ethernet Frame'],
      ['Physical Addresses (MAC)', `${CLIENT_MAC} → ${ROUTER_MAC}`],
      ['Added Header', 'Ethernet II (14 bytes, EtherType: 0x0800)'],
    ],
    osiMeta: {
      layer: 2,
      action: 'add-ethernet',
      direction: 'encapsulation',
      node: 'client',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        transportHeader: {
          protocol: 'TCP',
          sourcePort: 49152,
          destinationPort: 80,
          seq: 1000,
          flags: 'PSH, ACK',
        },
        networkHeader: {
          version: 4,
          sourceIP: CLIENT_IP,
          destinationIP: SERVER_IP,
          ttl: 64,
          protocol: 'TCP (6)',
        },
        dataLinkHeader: {
          sourceMAC: CLIENT_MAC,
          destinationMAC: ROUTER_MAC,
          etherType: '0x0800 (IPv4)',
        },
        currentLayer: 2,
        direction: 'encapsulation',
        rawBytesLength: 59,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'client',
        to: 'client',
        color: 'green',
        label: 'ETHERNET FRAME [59 B]',
        payload: ['Eth Header', 'IPv4 Header', 'TCP Header', 'Hello'],
        row: {
          time: '0.010 s',
          src: CLIENT_MAC,
          dst: ROUTER_MAC,
          proto: 'ETH',
          info: 'Encapsulation complete: Ethernet Frame (59 B)',
          len: '59 B',
        },
        wire: frames.fullFrame,
      },
    ],
  },

  // 7. Couche 1 Physique : Transmission sur le média
  {
    title: 'Couche Physique : Émission binaire',
    desc: 'Conversion de la trame en signaux physiques sur le média',
    detail:
      'La couche Physique (L1) convertit l’ensemble des octets de la trame en un flux continu de bits (zéros et uns), modulés en tensions électriques sur câble RJ45 ou impulsions lumineuses sur fibre optique vers le réseau.',
    facts: [
      ['Couche active', '1 · Physique'],
      ['Unité de données (PDU)', 'Bits / Signaux matériels'],
      ['Flux binaire brut', RAW_PAYLOAD_BITS],
      ['Média de transport', 'Câble cuivre 1000BASE-T / Radio Wi-Fi'],
    ],
    titleEn: 'Physical Layer: Bitstream Transmission',
    descEn: 'Converting frame into physical signals on the wire',
    detailEn:
      'The Physical layer (L1) converts all frame bytes into a continuous stream of bits (0s and 1s), modulated into electrical voltages over copper RJ45 or light pulses over optical fiber across the network.',
    factsEn: [
      ['Active Layer', '1 · Physical'],
      ['Data Unit (PDU)', 'Bits / Physical Signals'],
      ['Raw Bitstream', RAW_PAYLOAD_BITS],
      ['Transmission Media', 'Copper cable 1000BASE-T / Wi-Fi Radio'],
    ],
    osiMeta: {
      layer: 1,
      action: 'transmit-bits',
      direction: 'transmission',
      node: 'network',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        transportHeader: {
          protocol: 'TCP',
          sourcePort: 49152,
          destinationPort: 80,
          seq: 1000,
          flags: 'PSH, ACK',
        },
        networkHeader: {
          version: 4,
          sourceIP: CLIENT_IP,
          destinationIP: SERVER_IP,
          ttl: 64,
          protocol: 'TCP (6)',
        },
        dataLinkHeader: {
          sourceMAC: CLIENT_MAC,
          destinationMAC: ROUTER_MAC,
          etherType: '0x0800',
        },
        physicalBits: RAW_PAYLOAD_BITS,
        currentLayer: 1,
        direction: 'transmission',
        rawBytesLength: 59,
      },
    },
    events: [
      { type: 'show', nodes: ['client', 'internet', 'web'], frame: 'full' },
      {
        type: 'packet',
        from: 'client',
        to: 'web',
        color: 'amber',
        label: 'BITS: 01001000 01100101...',
        payload: 'Physical Bitstream',
        row: {
          time: '0.015 s',
          src: 'L1 Émetteur',
          dst: 'L1 Récepteur',
          proto: 'BITS',
          info: 'Physical transmission across network media: 59 bytes (472 bits)',
          len: '472 bits',
        },
        wire: frames.fullFrame,
      },
    ],
  },

  // 8. Couche 1 Physique (Récepteur)
  {
    title: 'Couche Physique Récepteur : Détection des signaux',
    desc: 'L’interface réseau réceptrice capte les impulsions et reconstitue les octets',
    detail:
      'L’émetteur-récepteur PHY de la carte réseau du serveur cible détecte les impulsions physiques sur le connecteur et démodule le train d’ondes en octets numériques ordonnés pour la couche supérieure.',
    facts: [
      ['Couche active', '1 · Physique (Serveur)'],
      ['Unité de données (PDU)', 'Bits reçus'],
      ['Synchronisation', 'Préambule 10101010 + SFD 10101011'],
      ['Action PHY', 'Reconstitution des 59 octets bruts'],
    ],
    titleEn: 'Receiver Physical Layer: Signal Detection',
    descEn: 'Receiver network interface detects pulses and reconstructs bytes',
    detailEn:
      'The PHY transceiver of the server NIC detects incoming physical pulses and demodulates the signal wave into ordered digital bytes for the upper layer.',
    factsEn: [
      ['Active Layer', '1 · Physical (Server)'],
      ['Data Unit (PDU)', 'Received Bits'],
      ['Synchronization', 'Preamble 10101010 + SFD 10101011'],
      ['PHY Action', 'Reconstruction of 59 raw bytes'],
    ],
    osiMeta: {
      layer: 1,
      action: 'receive-bits',
      direction: 'decapsulation',
      node: 'server',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        transportHeader: {
          protocol: 'TCP',
          sourcePort: 49152,
          destinationPort: 80,
          seq: 1000,
          flags: 'PSH, ACK',
        },
        networkHeader: {
          version: 4,
          sourceIP: CLIENT_IP,
          destinationIP: SERVER_IP,
          ttl: 64,
          protocol: 'TCP (6)',
        },
        dataLinkHeader: {
          sourceMAC: CLIENT_MAC,
          destinationMAC: ROUTER_MAC,
          etherType: '0x0800',
        },
        currentLayer: 1,
        direction: 'decapsulation',
        rawBytesLength: 59,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'web',
        to: 'web',
        color: 'amber',
        label: 'PHY DECODE: 59 BYTES',
        payload: 'Reconstructed Frame',
        row: {
          time: '0.020 s',
          src: 'L1 Physique',
          dst: 'L2 Liaison',
          proto: 'PHY',
          info: 'Bits converted back to frame bytes',
          len: '59 B',
        },
        wire: frames.fullFrame,
      },
    ],
  },

  // 9. Couche 2 Liaison de données (Récepteur) : Décapsulation Ethernet
  {
    title: 'Décapsulation Liaison : Validation Ethernet',
    desc: 'Vérification de la somme FCS et suppression de l’en-tête MAC',
    detail:
      'La carte réseau vérifie le code de redondance cyclique (CRC/FCS) pour s’assurer qu’aucun bit n’a été corrompu en transit. Elle valide que la destination lui est bien adressée, retire l’en-tête Ethernet de 14 octets et passe le paquet IPv4 à la couche Réseau.',
    facts: [
      ['Couche active', '2 · Liaison de données (Serveur)'],
      ['Unité de données (PDU)', 'Trame validée'],
      ['Contrôle CRC/FCS', 'OK (Aucune erreur détectée)'],
      ['En-tête retiré', 'Ethernet II (-14 octets)'],
    ],
    titleEn: 'Data Link Decapsulation: Ethernet Validation',
    descEn: 'FCS checksum check and MAC header stripping',
    detailEn:
      'The network card verifies the cyclic redundancy check (CRC/FCS) to ensure no bits were corrupted in transit. It validates that the destination MAC matches its interface, strips the 14-byte Ethernet header, and forwards the IPv4 packet to the Network layer.',
    factsEn: [
      ['Active Layer', '2 · Data Link (Server)'],
      ['Data Unit (PDU)', 'Validated Frame'],
      ['CRC/FCS Check', 'OK (No errors detected)'],
      ['Stripped Header', 'Ethernet II (-14 bytes)'],
    ],
    osiMeta: {
      layer: 2,
      action: 'strip-ethernet',
      direction: 'decapsulation',
      node: 'server',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        transportHeader: {
          protocol: 'TCP',
          sourcePort: 49152,
          destinationPort: 80,
          seq: 1000,
          flags: 'PSH, ACK',
        },
        networkHeader: {
          version: 4,
          sourceIP: CLIENT_IP,
          destinationIP: SERVER_IP,
          ttl: 64,
          protocol: 'TCP (6)',
        },
        currentLayer: 2,
        direction: 'decapsulation',
        rawBytesLength: 45,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'web',
        to: 'web',
        color: 'green',
        label: '- ETHERNET HEADER',
        payload: ['IPv4 Header', 'TCP Header', 'Hello'],
        row: {
          time: '0.022 s',
          src: 'L2 Liaison',
          dst: 'L3 Réseau',
          proto: 'ETH',
          info: 'Ethernet header verified and stripped (-14 B)',
          len: '45 B',
        },
        wire: frames.networkFrame,
      },
    ],
  },

  // 10. Couche 3 Réseau (Récepteur) : Décapsulation IPv4
  {
    title: 'Décapsulation Réseau : Validation IPv4',
    desc: 'Vérification de l’IP destination et suppression de l’en-tête IP',
    detail:
      'La pile IP du serveur vérifie que l’adresse IP de destination (203.0.113.10) correspond bien à son interface réseau et décrémente/contrôle le TTL. Elle retire l’en-tête IPv4 de 20 octets et transmet le segment restant au protocole de transport désigné (TCP).',
    facts: [
      ['Couche active', '3 · Réseau (Serveur)'],
      ['Unité de données (PDU)', 'Paquet vérifié'],
      ['Validation IP', '203.0.113.10 correspond à l’hôte local'],
      ['En-tête retiré', 'IPv4 (-20 octets, protocole cible: TCP)'],
    ],
    titleEn: 'Network Decapsulation: IPv4 Validation',
    descEn: 'Destination IP check and IPv4 header stripping',
    detailEn:
      'The server IP stack verifies that the destination IP address (203.0.113.10) matches its network interface and checks the TTL. It strips the 20-byte IPv4 header and passes the remaining segment to the designated transport protocol (TCP).',
    factsEn: [
      ['Active Layer', '3 · Network (Server)'],
      ['Data Unit (PDU)', 'Verified Packet'],
      ['IP Validation', '203.0.113.10 matches local host'],
      ['Stripped Header', 'IPv4 (-20 bytes, target protocol: TCP)'],
    ],
    osiMeta: {
      layer: 3,
      action: 'strip-ip',
      direction: 'decapsulation',
      node: 'server',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        transportHeader: {
          protocol: 'TCP',
          sourcePort: 49152,
          destinationPort: 80,
          seq: 1000,
          flags: 'PSH, ACK',
        },
        currentLayer: 3,
        direction: 'decapsulation',
        rawBytesLength: 25,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'web',
        to: 'web',
        color: 'blue',
        label: '- IPv4 HEADER',
        payload: ['TCP Header', 'Hello'],
        row: {
          time: '0.024 s',
          src: 'L3 Réseau',
          dst: 'L4 Transport',
          proto: 'IPv4',
          info: 'IPv4 header verified and stripped (-20 B)',
          len: '25 B',
        },
        wire: frames.transportFrame,
      },
    ],
  },

  // 11. Couche 4 Transport (Récepteur) : Décapsulation TCP
  {
    title: 'Décapsulation Transport : Traitement TCP',
    desc: 'Vérification du port 80 et réassemblage du flux',
    detail:
      'Le module TCP vérifie le numéro de port 80, ordonne les numéros de séquence et valide l’intégrité du segment. Il supprime l’en-tête TCP de 20 octets et prépare la charge utile pour l’application à l’écoute.',
    facts: [
      ['Couche active', '4 · Transport (Serveur)'],
      ['Unité de données (PDU)', 'Segment traité'],
      ['Port d’écoute cible', 'Port 80 (Serveur Web HTTP)'],
      ['En-tête retiré', 'TCP (-20 octets)'],
    ],
    titleEn: 'Transport Decapsulation: TCP Processing',
    descEn: 'Port 80 verification and stream reassembly',
    detailEn:
      'The TCP module checks destination port 80, validates sequence numbers and verifies segment integrity. It strips the 20-byte TCP header and prepares the payload for the listening application.',
    factsEn: [
      ['Active Layer', '4 · Transport (Server)'],
      ['Data Unit (PDU)', 'Processed Segment'],
      ['Listening Port', 'Port 80 (HTTP Web Server)'],
      ['Stripped Header', 'TCP (-20 bytes)'],
    ],
    osiMeta: {
      layer: 4,
      action: 'strip-tcp',
      direction: 'decapsulation',
      node: 'server',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        currentLayer: 4,
        direction: 'decapsulation',
        rawBytesLength: 5,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'web',
        to: 'web',
        color: 'blue',
        label: '- TCP HEADER',
        payload: 'Payload "Hello"',
        row: {
          time: '0.026 s',
          src: 'L4 Transport',
          dst: 'L7 Application',
          proto: 'TCP',
          info: 'TCP segment processed, payload extracted',
          len: '5 B',
        },
        wire: frames.appFrame,
      },
    ],
  },

  // 12. Couche 7 Application (Récepteur) : Données délivrées
  {
    title: 'Données délivrées à l’application',
    desc: 'Le message "Hello" est reçu intact par le serveur',
    detail:
      'Les couches Session et Présentation ayant validé le flux, le message original "Hello" de 5 octets est enfin délivré au logiciel serveur. Le cycle complet d’encapsulation puis décapsulation à travers le modèle OSI en 7 couches est achevé avec succès.',
    facts: [
      ['Couche active', '7 · Application (Serveur)'],
      ['Unité de données (PDU)', 'Donnée applicative reçue'],
      ['Message décodé', '"Hello" (Intact et authentique)'],
      ['Statut final', 'Transmission et décapsulation réussies'],
    ],
    titleEn: 'Data Delivered to Application',
    descEn: 'The "Hello" message is received intact by the server',
    detailEn:
      'With the Session and Presentation layers validating dialogue and formatting, the original 5-byte message "Hello" is finally delivered to the server application. The complete encapsulation and decapsulation cycle across the 7 OSI layers is successfully finished.',
    factsEn: [
      ['Active Layer', '7 · Application (Server)'],
      ['Data Unit (PDU)', 'Received Application Data'],
      ['Decoded Message', '"Hello" (Intact and authentic)'],
      ['Final Status', 'Transmission & decapsulation successful'],
    ],
    osiMeta: {
      layer: 7,
      action: 'data-delivered',
      direction: 'decapsulation',
      node: 'server',
      packetState: {
        applicationData: RAW_PAYLOAD_TEXT,
        currentLayer: 7,
        direction: 'decapsulation',
        rawBytesLength: 5,
      },
    },
    events: [
      {
        type: 'packet',
        from: 'web',
        to: 'web',
        color: 'green',
        label: 'DELIVERED: "Hello"',
        payload: 'Delivered',
        row: {
          time: '0.028 s',
          src: 'L7 Application',
          dst: 'Processus Serveur Web',
          proto: 'DATA',
          info: 'Application payload delivered intact: "Hello"',
          len: '5 B',
        },
        wire: frames.appFrame,
      },
    ],
  },
];

/**
 * Retourne les 12 étapes de la simulation OSI selon la langue demandée
 */
export function getOsiSteps(locale?: string): OSISimulationStep[] {
  if (locale === 'fr') {
    return OSI_SIMULATION_STEPS;
  }
  return OSI_SIMULATION_STEPS.map((step) => ({
    ...step,
    title: step.titleEn || step.title,
    desc: step.descEn || step.desc,
    detail: step.detailEn || step.detail,
    facts: step.factsEn || step.facts,
  }));
}
