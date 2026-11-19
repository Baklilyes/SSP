import { SimulationStep } from '../../types';
import {
  TCPIPEncapsulationState,
  buildTcpipDissectedFrames,
  TCPIP_CLIENT_IP,
  TCPIP_SERVER_IP,
  TCPIP_CLIENT_MAC,
  TCPIP_ROUTER1_IN_MAC,
  TCPIP_PAYLOAD_TEXT,
  TCPIP_PAYLOAD_BITS,
} from './tcpipPacket';
import { TCPIPLayerNumber } from './tcpipLayers';
import { ROUTER_HOPS, RouterHopInfo } from './tcpipRouting';

export type TCPIPAction =
  | 'application-data-created'
  | 'transport-processing'
  | 'transport-header-added'
  | 'internet-processing'
  | 'ip-header-added'
  | 'network-access-processing'
  | 'frame-created'
  | 'transmission-start'
  | 'router-hop'
  | 'transmission-complete'
  | 'frame-processed'
  | 'ip-header-processed'
  | 'transport-header-processed'
  | 'application-data-delivered';

export interface TCPIPStepMeta {
  layer: TCPIPLayerNumber;
  action: TCPIPAction;
  direction: 'encapsulation' | 'transmission' | 'routing' | 'decapsulation';
  node: 'client' | 'router1' | 'router2' | 'server';
  packetState: TCPIPEncapsulationState;
  routerInfo?: RouterHopInfo;
}

export type TCPIPSimulationStep = SimulationStep & {
  tcpipMeta: TCPIPStepMeta;
  titleEn?: string;
  descEn?: string;
  detailEn?: string;
  factsEn?: [string, string][];
};

export function createTcpipSteps(
  transport: 'TCP' | 'UDP' = 'TCP',
  networkAccess: 'Ethernet' | 'Wi-Fi' = 'Ethernet'
): TCPIPSimulationStep[] {
  const frames = buildTcpipDissectedFrames(transport, networkAccess);
  const isTcp = transport === 'TCP';
  const transportHeaderLen = isTcp ? 20 : 8;
  const segmentLen = 5 + transportHeaderLen;
  const ipDatagramLen = segmentLen + 20;
  const frameLen = ipDatagramLen + 14;

  return [
    // Étape 1 : Couche 4 Application (Émetteur)
    {
      title: 'Création du message applicatif (L4)',
      desc: 'L’application génère la charge utile brute',
      detail:
        'Le processus utilisateur (navigateur Web ou client applicatif) crée le message "Hello" (5 octets). La couche Application du modèle TCP/IP prépare cette donnée sans lui ajouter d’en-tête de transport ou de réseau.',
      facts: [
        ['Couche active', '4 · Application'],
        ['Unité PDU', 'Message applicatif (Données)'],
        ['Contenu brut', `"${TCPIP_PAYLOAD_TEXT}" (5 octets)`],
        ['Protocoles typiques', 'HTTP, HTTPS, DNS, DHCP, SSH'],
      ],
      titleEn: 'Application Message Creation (L4)',
      descEn: 'Application generates raw payload',
      detailEn:
        'The user process (Web browser or app client) generates the message "Hello" (5 bytes). The Application layer in the TCP/IP model prepares this payload without adding transport or network headers.',
      factsEn: [
        ['Active Layer', '4 · Application'],
        ['Data Unit (PDU)', 'Application Message (Data)'],
        ['Raw Payload', `"${TCPIP_PAYLOAD_TEXT}" (5 bytes)`],
        ['Typical Protocols', 'HTTP, HTTPS, DNS, DHCP, SSH'],
      ],
      tcpipMeta: {
        layer: 4,
        action: 'application-data-created',
        direction: 'encapsulation',
        node: 'client',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          currentLayer: 4,
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
          payload: TCPIP_PAYLOAD_TEXT,
          row: {
            time: '0.000 s',
            src: 'Client (App)',
            dst: 'L3 Transport',
            proto: 'DATA',
            info: 'Application message created: "Hello"',
            len: '5 B',
          },
          wire: frames.appFrame,
        },
      ],
    },

    // Étape 2 : Couche 3 Transport (Émetteur)
    {
      title: `Encapsulation Transport : En-tête ${transport} (L3)`,
      desc: isTcp ? 'Ajout des ports TCP & numéros de séquence' : 'Ajout des ports UDP sans connexion',
      detail: isTcp
        ? 'La couche Transport reçoit la donnée et l’encapsule dans un segment TCP en ajoutant un en-tête de 20 octets : port source 49152, port destination 80 (HTTP), numéro de séquence 1000 et drapeaux PSH/ACK.'
        : 'La couche Transport reçoit la donnée et l’encapsule dans un datagramme UDP en ajoutant un en-tête léger de 8 octets : port source 49152, port destination 80, longueur et somme de contrôle.',
      facts: [
        ['Couche active', '3 · Transport'],
        ['Unité PDU', isTcp ? 'Segment TCP' : 'Datagramme UDP'],
        ['En-tête ajouté', `${transport} (${transportHeaderLen} octets)`],
        ['Ports', 'Src: 49152 → Dst: 80'],
        ['Taille cumulée', `${segmentLen} octets`],
      ],
      titleEn: `Transport Encapsulation: ${transport} Header (L3)`,
      descEn: isTcp ? 'Adding TCP ports & sequence tracking' : 'Adding lightweight UDP header',
      detailEn: isTcp
        ? 'The Transport layer wraps payload into a TCP segment with a 20-byte header: source port 49152, destination port 80 (HTTP), sequence number 1000, and PSH/ACK flags.'
        : 'The Transport layer wraps payload into a UDP datagram with a concise 8-byte header: source port 49152, destination port 80, length, and checksum.',
      factsEn: [
        ['Active Layer', '3 · Transport'],
        ['Data Unit (PDU)', isTcp ? 'TCP Segment' : 'UDP Datagram'],
        ['Added Header', `${transport} (${transportHeaderLen} bytes)`],
        ['Ports', 'Src: 49152 → Dst: 80'],
        ['Cumulative Size', `${segmentLen} bytes`],
      ],
      tcpipMeta: {
        layer: 3,
        action: 'transport-header-added',
        direction: 'encapsulation',
        node: 'client',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          currentLayer: 3,
          direction: 'encapsulation',
          rawBytesLength: segmentLen,
        },
      },
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'client',
          color: 'blue',
          label: isTcp ? 'TCP: [49152 → 80]' : 'UDP: [49152 → 80]',
          payload: isTcp ? 'TCP Segment' : 'UDP Datagram',
          row: {
            time: '0.002 s',
            src: 'Client (L3)',
            dst: 'L2 Internet',
            proto: transport,
            info: `${transport} header added (Src: 49152, Dst: 80)`,
            len: `${segmentLen} B`,
          },
          wire: frames.transportFrame,
        },
      ],
    },

    // Étape 3 : Couche 2 Internet (Émetteur)
    {
      title: 'Encapsulation Internet : Datagramme IPv4 (L2)',
      desc: 'Ajout des adresses IP source et destination',
      detail:
        'La couche Internet (clé de voûte de TCP/IP) encapsule le segment dans un datagramme IP en ajoutant un en-tête IPv4 de 20 octets. Les adresses IP logiques 192.168.1.10 (Client) et 10.0.0.20 (Serveur) sont inscrites avec un TTL initial de 64.',
      facts: [
        ['Couche active', '2 · Internet'],
        ['Unité PDU', 'Datagramme IP'],
        ['En-tête ajouté', 'IPv4 (20 octets)'],
        ['Adresses IP', `${TCPIP_CLIENT_IP} → ${TCPIP_SERVER_IP}`],
        ['TTL initial', '64 sauts max'],
        ['Taille cumulée', `${ipDatagramLen} octets`],
      ],
      titleEn: 'Internet Encapsulation: IPv4 Datagram (L2)',
      descEn: 'Adding source and destination IP addresses',
      detailEn:
        'The Internet layer (cornerstone of TCP/IP) encapsulates the segment into an IP datagram with a 20-byte IPv4 header. Logical IPs 192.168.1.10 and 10.0.0.20 are assigned with TTL 64.',
      factsEn: [
        ['Active Layer', '2 · Internet'],
        ['Data Unit (PDU)', 'IP Datagram'],
        ['Added Header', 'IPv4 (20 bytes)'],
        ['IP Addresses', `${TCPIP_CLIENT_IP} → ${TCPIP_SERVER_IP}`],
        ['Initial TTL', '64 max hops'],
        ['Cumulative Size', `${ipDatagramLen} bytes`],
      ],
      tcpipMeta: {
        layer: 2,
        action: 'ip-header-added',
        direction: 'encapsulation',
        node: 'client',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          networkHeader: {
            version: 4,
            sourceIP: TCPIP_CLIENT_IP,
            destinationIP: TCPIP_SERVER_IP,
            ttl: 64,
            protocol: transport,
            lengthBytes: 20,
          },
          currentLayer: 2,
          direction: 'encapsulation',
          rawBytesLength: ipDatagramLen,
        },
      },
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'client',
          color: 'blue',
          label: `IPv4: ${TCPIP_CLIENT_IP} → ${TCPIP_SERVER_IP}`,
          payload: 'IP Datagram',
          row: {
            time: '0.005 s',
            src: TCPIP_CLIENT_IP,
            dst: TCPIP_SERVER_IP,
            proto: 'IPv4',
            info: `IP datagram built, TTL=64, Proto=${transport}`,
            len: `${ipDatagramLen} B`,
          },
          wire: frames.networkFrame,
        },
      ],
    },

    // Étape 4 : Couche 1 Hôte-Réseau (Émetteur)
    {
      title: 'Encapsulation Hôte-Réseau : Trame Ethernet (L1)',
      desc: 'Ajout de l’en-tête matériel et adresse MAC passerelle',
      detail:
        'La couche Hôte-Réseau prépare le datagramme pour le lien local en ajoutant un en-tête Ethernet de 14 octets avec les adresses MAC physiques (source : carte réseau du client, destination : passerelle par défaut). EtherType 0x0800 indique le protocole IPv4.',
      facts: [
        ['Couche active', '1 · Hôte-Réseau (Accès Réseau)'],
        ['Unité PDU', 'Trame Ethernet II'],
        ['En-tête ajouté', `${networkAccess} (14 octets)`],
        ['MAC Source', TCPIP_CLIENT_MAC],
        ['MAC Destination', TCPIP_ROUTER1_IN_MAC],
        ['Taille totale trame', `${frameLen} octets`],
      ],
      titleEn: 'Host-to-Network Encapsulation: Ethernet Frame (L1)',
      descEn: 'Adding hardware header & gateway MAC address',
      detailEn:
        'The Host-to-Network layer packages the datagram into a local link frame by appending a 14-byte Ethernet header: source MAC (Client NIC), destination MAC (Default Gateway), EtherType 0x0800 (IPv4).',
      factsEn: [
        ['Active Layer', '1 · Host-to-Network (Network Access)'],
        ['Data Unit (PDU)', 'Ethernet II Frame'],
        ['Added Header', `${networkAccess} (14 bytes)`],
        ['Source MAC', TCPIP_CLIENT_MAC],
        ['Destination MAC', TCPIP_ROUTER1_IN_MAC],
        ['Total Frame Size', `${frameLen} bytes`],
      ],
      tcpipMeta: {
        layer: 1,
        action: 'frame-created',
        direction: 'encapsulation',
        node: 'client',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          networkHeader: {
            version: 4,
            sourceIP: TCPIP_CLIENT_IP,
            destinationIP: TCPIP_SERVER_IP,
            ttl: 64,
            protocol: transport,
            lengthBytes: 20,
          },
          networkAccessHeader: {
            sourceMAC: TCPIP_CLIENT_MAC,
            destinationMAC: TCPIP_ROUTER1_IN_MAC,
            etherType: '0x0800 (IPv4)',
            technology: networkAccess,
            lengthBytes: 14,
          },
          currentLayer: 1,
          direction: 'encapsulation',
          rawBytesLength: frameLen,
        },
      },
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'client',
          color: 'green',
          label: `ETH: ${TCPIP_CLIENT_MAC} → ${TCPIP_ROUTER1_IN_MAC}`,
          payload: 'Ethernet Frame',
          row: {
            time: '0.008 s',
            src: TCPIP_CLIENT_MAC,
            dst: TCPIP_ROUTER1_IN_MAC,
            proto: 'ETH',
            info: `Frame encapsulated for local link (${frameLen} octets)`,
            len: `${frameLen} B`,
          },
          wire: frames.fullFrame,
        },
      ],
    },

    // Étape 5 : Émission Physique sur le Média (L1)
    {
      title: 'Émission Physique : Sérialisation binaire sur le câble',
      desc: 'Conversion de la trame en signal physique',
      detail:
        'La trame complète de 59 octets est convertie en impulsions binaires (bits) et transmise sur le média physique (câble Ethernet cuivre 1000BASE-T ou ondes radio Wi-Fi) en direction du premier équipement d’interconnexion.',
      facts: [
        ['Couche active', '1 · Hôte-Réseau (Support Physique)'],
        ['Signal', 'Impulsions électriques / optiques'],
        ['Débit binaire', `${frameLen * 8} bits transmis`],
        ['Support de liaison', '1000BASE-T Full-Duplex'],
      ],
      titleEn: 'Physical Transmission: Bitstream on the wire',
      descEn: 'Frame serialization into physical pulses',
      detailEn:
        'The complete 59-byte frame is converted into electrical/optical bitstream signals and propagated over the physical medium toward the first routing hop.',
      factsEn: [
        ['Active Layer', '1 · Host-to-Network (Physical Media)'],
        ['Signal Format', 'Electrical / optical pulses'],
        ['Bitstream', `${frameLen * 8} bits transmitted`],
        ['Physical Link', '1000BASE-T Full-Duplex'],
      ],
      tcpipMeta: {
        layer: 1,
        action: 'transmission-start',
        direction: 'transmission',
        node: 'client',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          networkHeader: {
            version: 4,
            sourceIP: TCPIP_CLIENT_IP,
            destinationIP: TCPIP_SERVER_IP,
            ttl: 64,
            protocol: transport,
            lengthBytes: 20,
          },
          networkAccessHeader: {
            sourceMAC: TCPIP_CLIENT_MAC,
            destinationMAC: TCPIP_ROUTER1_IN_MAC,
            etherType: '0x0800',
            technology: networkAccess,
            lengthBytes: 14,
          },
          physicalBits: TCPIP_PAYLOAD_BITS,
          currentLayer: 1,
          direction: 'transmission',
          rawBytesLength: frameLen,
        },
      },
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'green',
          label: 'Bits [01001000 01100101...]',
          payload: TCPIP_PAYLOAD_BITS,
          row: {
            time: '0.012 s',
            src: 'Client (PHY)',
            dst: 'Routeur 1 (eth0)',
            proto: 'PHY',
            info: `Bitstream propagation across link (${frameLen * 8} bits)`,
            len: `${frameLen} B`,
          },
          wire: frames.fullFrame,
        },
      ],
    },

    // Étape 6 : Routeur 1 — Réception Trame L1 (Host-to-Network)
    {
      title: 'Routeur 1 : Réception de la trame et décapsulation L1',
      desc: 'Validation de l’adresse MAC et extraction du datagramme IP',
      detail:
        'Le routeur reçoit la trame sur son interface eth0. La couche Hôte-Réseau valide que l’adresse MAC de destination correspond bien à la sienne, vérifie le CRC/FCS, retire l’en-tête Ethernet (14 octets) et transmet le datagramme IP à sa couche Internet.',
      facts: [
        ['Équipement', 'Routeur Passerelle (R1)'],
        ['Interface d’entrée', 'eth0 (192.168.1.1)'],
        ['Validation MAC', 'Conforme à l’interface du routeur'],
        ['Action effectuée', 'Décapsulation L1 (Retrait Ethernet 14 B)'],
      ],
      titleEn: 'Router 1: Frame Reception & L1 Decapsulation',
      descEn: 'MAC address validation and IP datagram extraction',
      detailEn:
        'Router 1 receives the frame on interface eth0. Its Host-to-Network layer confirms the destination MAC matches its interface, validates CRC, strips the 14-byte Ethernet header, and passes the IP datagram to Layer 2 Internet.',
      factsEn: [
        ['Device', 'Gateway Router (R1)'],
        ['Inbound Interface', 'eth0 (192.168.1.1)'],
        ['MAC Validation', 'Matches router interface MAC'],
        ['Action Taken', 'L1 Decapsulation (14 B Ethernet removed)'],
      ],
      tcpipMeta: {
        layer: 1,
        action: 'frame-processed',
        direction: 'routing',
        node: 'router1',
        routerInfo: ROUTER_HOPS[0],
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          networkHeader: {
            version: 4,
            sourceIP: TCPIP_CLIENT_IP,
            destinationIP: TCPIP_SERVER_IP,
            ttl: 64,
            protocol: transport,
            lengthBytes: 20,
          },
          currentLayer: 1,
          direction: 'routing',
          rawBytesLength: ipDatagramLen,
        },
      },
      events: [
        {
          type: 'show',
          nodes: ['router'],
          frame: 'local',
        },
        {
          type: 'packet',
          from: 'router',
          to: 'router',
          color: 'blue',
          label: 'R1: Frame Inbound',
          payload: 'Decapsulated IP',
          row: {
            time: '0.015 s',
            src: TCPIP_CLIENT_MAC,
            dst: TCPIP_ROUTER1_IN_MAC,
            proto: 'ETH',
            info: 'L1 Ethernet header stripped at Router 1',
            len: `${ipDatagramLen} B`,
          },
          wire: frames.fullFrame,
        },
      ],
    },

    // Étape 7 : Routeur 1 — Décision de Routage L2 Internet (IP Routing)
    {
      title: 'Routeur 1 : Décision de routage Internet & Décrémentation TTL (L2)',
      desc: 'Consultation table de routage et sélection du prochain saut',
      detail:
        'La couche Internet de R1 examine l’IP destination 10.0.0.20. Elle consulte sa table de routage, sélectionne l’interface de sortie eth1 et le prochain saut (172.16.0.2). Le champ TTL est décrémenté de 64 à 63 pour prévenir les boucles de routage.',
      facts: [
        ['Couche active', '2 · Internet (Routage IP)'],
        ['IP Destination inspectée', TCPIP_SERVER_IP],
        ['Prochain saut (Next-Hop)', '172.16.0.2 (Routeur 2)'],
        ['TTL décrémenté', '64 → 63 (Empêche les boucles infinies)'],
        ['Interface de sortie', 'eth1 (172.16.0.1)'],
      ],
      titleEn: 'Router 1: Internet Routing Decision & TTL Decrement (L2)',
      descEn: 'Routing table lookup & next-hop selection',
      detailEn:
        'R1 Internet layer evaluates destination IP 10.0.0.20, consults its routing table, selects outbound interface eth1 and next hop (172.16.0.2). TTL is decremented from 64 to 63 to prevent routing loops.',
      factsEn: [
        ['Active Layer', '2 · Internet (IP Routing)'],
        ['Inspected Dst IP', TCPIP_SERVER_IP],
        ['Next Hop IP', '172.16.0.2 (Router 2)'],
        ['TTL Decrement', '64 → 63 (Loop prevention)'],
        ['Outbound Interface', 'eth1 (172.16.0.1)'],
      ],
      tcpipMeta: {
        layer: 2,
        action: 'router-hop',
        direction: 'routing',
        node: 'router1',
        routerInfo: ROUTER_HOPS[0],
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          networkHeader: {
            version: 4,
            sourceIP: TCPIP_CLIENT_IP,
            destinationIP: TCPIP_SERVER_IP,
            ttl: 63,
            protocol: transport,
            lengthBytes: 20,
          },
          routerHopCount: 1,
          currentLayer: 2,
          direction: 'routing',
          rawBytesLength: ipDatagramLen,
        },
      },
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'router',
          color: 'blue',
          label: `TTL 64 → 63 | Hop: 172.16.0.2`,
          payload: 'Routed IP',
          row: {
            time: '0.020 s',
            src: 'R1 (L2 Internet)',
            dst: 'Table Routage',
            proto: 'IP-ROUTE',
            info: `Route matched: 10.0.0.0/24 via 172.16.0.2, TTL=63`,
            len: `${ipDatagramLen} B`,
          },
          wire: frames.networkFrame,
        },
      ],
    },

    // Étape 8 : Transit Réseau — Ré-encapsulation L1 & Acheminement vers R2/Serveur
    {
      title: 'Transit Réseau : Ré-encapsulation L1 & Acheminement vers le serveur',
      desc: 'Nouvelle trame locale avec MAC du prochain saut',
      detail:
        'Le routeur ré-encapsule le datagramme IP dans une NOUVELLE trame Ethernet adaptée au lien suivant (MAC source : R1, MAC destination : équipement suivant). Les adresses IP d’origine restent inchangées de bout en bout !',
      facts: [
        ['Principe clé', 'Les adresses MAC changent à chaque saut, les IP restent intactes'],
        ['Nouvelle MAC Source', '00:22:33:44:55:77 (R1 eth1)'],
        ['Nouvelle MAC Dest.', '00:BB:CC:DD:EE:FF (Serveur)'],
        ['IP Source / Dest.', `${TCPIP_CLIENT_IP} → ${TCPIP_SERVER_IP} (Inchangées)`],
      ],
      titleEn: 'Network Transit: L1 Re-encapsulation & Delivery to Server',
      descEn: 'New local frame with next-hop MAC address',
      detailEn:
        'The router re-encapsulates the IP datagram into a NEW Ethernet frame tailored to the next physical link (source MAC: R1, destination MAC: Server). End-to-end IP addresses remain strictly identical!',
      factsEn: [
        ['Core Principle', 'MAC addresses change at every hop; IP addresses remain immutable'],
        ['New Source MAC', '00:22:33:44:55:77 (R1 eth1)'],
        ['New Destination MAC', '00:BB:CC:DD:EE:FF (Server)'],
        ['Source / Dst IP', `${TCPIP_CLIENT_IP} → ${TCPIP_SERVER_IP} (Unchanged)`],
      ],
      tcpipMeta: {
        layer: 1,
        action: 'transmission-complete',
        direction: 'transmission',
        node: 'router1',
        routerInfo: ROUTER_HOPS[1],
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          networkHeader: {
            version: 4,
            sourceIP: TCPIP_CLIENT_IP,
            destinationIP: TCPIP_SERVER_IP,
            ttl: 62,
            protocol: transport,
            lengthBytes: 20,
          },
          networkAccessHeader: {
            sourceMAC: '00:22:33:44:55:77',
            destinationMAC: '00:BB:CC:DD:EE:FF',
            etherType: '0x0800',
            technology: networkAccess,
            lengthBytes: 14,
          },
          routerHopCount: 2,
          currentLayer: 1,
          direction: 'transmission',
          rawBytesLength: frameLen,
        },
      },
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'web',
          color: 'green',
          label: `Transit → Serveur (TTL=62)`,
          payload: 'Next-hop Frame',
          row: {
            time: '0.028 s',
            src: 'R1 (eth1)',
            dst: 'Serveur (10.0.0.20)',
            proto: 'ETH-IP',
            info: `Forwarded to destination network across link`,
            len: `${frameLen} B`,
          },
          wire: frames.fullFrame,
        },
      ],
    },

    // Étape 9 : Récepteur — Couche 1 Hôte-Réseau (Décapsulation L1)
    {
      title: 'Serveur : Réception trame et décapsulation Hôte-Réseau (L1)',
      desc: 'Validation matérielle et retrait de l’en-tête Ethernet',
      detail:
        'La carte réseau du serveur reçoit les impulsions physiques, reconstitue la trame Ethernet, vérifie son intégrité et confirme que l’adresse MAC correspond. L’en-tête Ethernet de 14 octets est retiré ; le datagramme IP est passé à la couche Internet.',
      facts: [
        ['Couche active', '1 · Hôte-Réseau (Accès Réseau)'],
        ['Vérification', 'Contrôle FCS/CRC valide'],
        ['En-tête retiré', 'Ethernet (14 octets)'],
        ['Reste à traiter', `Datagramme IP (${ipDatagramLen} octets)`],
      ],
      titleEn: 'Server: Frame Reception & Host-to-Network Decapsulation (L1)',
      descEn: 'Hardware validation & Ethernet header stripping',
      detailEn:
        'The server NIC receives the signal, reconstructs the Ethernet frame, verifies checksum/CRC, and validates destination MAC. The 14-byte Ethernet header is stripped, delivering the IP datagram to Layer 2.',
      factsEn: [
        ['Active Layer', '1 · Host-to-Network (Network Access)'],
        ['Verification', 'Valid FCS/CRC checksum'],
        ['Stripped Header', 'Ethernet (14 bytes)'],
        ['Payload Passed Up', `IP Datagram (${ipDatagramLen} bytes)`],
      ],
      tcpipMeta: {
        layer: 1,
        action: 'frame-processed',
        direction: 'decapsulation',
        node: 'server',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          networkHeader: {
            version: 4,
            sourceIP: TCPIP_CLIENT_IP,
            destinationIP: TCPIP_SERVER_IP,
            ttl: 62,
            protocol: transport,
            lengthBytes: 20,
          },
          currentLayer: 1,
          direction: 'decapsulation',
          rawBytesLength: ipDatagramLen,
        },
      },
      events: [
        {
          type: 'show',
          nodes: ['web'],
          frame: 'local',
        },
        {
          type: 'packet',
          from: 'web',
          to: 'web',
          color: 'blue',
          label: '- ETH Header (14 B)',
          payload: 'L1 Decapsulated',
          row: {
            time: '0.035 s',
            src: 'Serveur (NIC L1)',
            dst: 'Serveur (L2 Internet)',
            proto: 'ETH',
            info: 'Ethernet header verified and stripped',
            len: `${ipDatagramLen} B`,
          },
          wire: frames.fullFrame,
        },
      ],
    },

    // Étape 10 : Récepteur — Couche 2 Internet (Décapsulation L2)
    {
      title: 'Serveur : Traitement Internet & Décapsulation IPv4 (L2)',
      desc: 'Validation adresse IP destination et extraction du segment',
      detail:
        'La couche Internet du serveur confirme que l’adresse IP de destination (10.0.0.20) lui appartient bien. Elle inspecte le protocole transport (TCP = 6 ou UDP = 17), retire l’en-tête IP de 20 octets et remet le segment à la couche Transport.',
      facts: [
        ['Couche active', '2 · Internet'],
        ['Validation IP', 'Destination 10.0.0.20 = IP locale du serveur'],
        ['Protocole supérieur', isTcp ? 'TCP (Valeur 0x06)' : 'UDP (Valeur 0x11)'],
        ['En-tête retiré', 'IPv4 (20 octets)'],
        ['Reste à traiter', `Segment ${transport} (${segmentLen} octets)`],
      ],
      titleEn: 'Server: Internet Processing & IPv4 Decapsulation (L2)',
      descEn: 'Destination IP validation & segment extraction',
      detailEn:
        'The server Internet layer confirms destination IP 10.0.0.20 matches its local address. It identifies protocol type (TCP=6 or UDP=17), strips the 20-byte IP header, and passes the segment up to Layer 3.',
      factsEn: [
        ['Active Layer', '2 · Internet'],
        ['IP Check', 'Destination 10.0.0.20 matches local server IP'],
        ['Next Protocol', isTcp ? 'TCP (Code 0x06)' : 'UDP (Code 0x11)'],
        ['Stripped Header', 'IPv4 (20 bytes)'],
        ['Payload Passed Up', `${transport} Segment (${segmentLen} bytes)`],
      ],
      tcpipMeta: {
        layer: 2,
        action: 'ip-header-processed',
        direction: 'decapsulation',
        node: 'server',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          transportHeader: {
            protocol: transport,
            sourcePort: 49152,
            destinationPort: 80,
            seq: 1000,
            flags: isTcp ? 'PSH, ACK' : undefined,
            lengthBytes: transportHeaderLen,
          },
          currentLayer: 2,
          direction: 'decapsulation',
          rawBytesLength: segmentLen,
        },
      },
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'web',
          color: 'blue',
          label: '- IPv4 Header (20 B)',
          payload: 'L2 Decapsulated',
          row: {
            time: '0.038 s',
            src: 'Serveur (L2 Internet)',
            dst: 'Serveur (L3 Transport)',
            proto: 'IPv4',
            info: `IP header stripped, payload dispatched to ${transport}`,
            len: `${segmentLen} B`,
          },
          wire: frames.networkFrame,
        },
      ],
    },

    // Étape 11 : Récepteur — Couche 3 Transport (Décapsulation L3)
    {
      title: `Serveur : Traitement Transport & Décapsulation ${transport} (L3)`,
      desc: isTcp ? 'Vérification du port 80 & acquittement TCP' : 'Validation port 80 et checksum UDP',
      detail: isTcp
        ? 'La couche Transport analyse le segment TCP. Elle identifie le port de destination 80 (serveur Web HTTP), valide les numéros de séquence, gère l’acquittement, retire l’en-tête TCP (20 octets) et extrait la charge utile applicative.'
        : 'La couche Transport analyse le datagramme UDP. Elle valide la somme de contrôle et le port 80, retire l’en-tête UDP (8 octets) et extrait les données brutes.',
      facts: [
        ['Couche active', '3 · Transport'],
        ['Port d’écoute cible', 'Port 80 (Service Web / Serveur)'],
        ['En-tête retiré', `${transport} (${transportHeaderLen} octets)`],
        ['Donnée extraite', `Message applicatif (${TCPIP_PAYLOAD_TEXT.length} octets)`],
      ],
      titleEn: `Server: Transport Processing & ${transport} Decapsulation (L3)`,
      descEn: isTcp ? 'Port 80 verification & TCP acknowledgement' : 'Port 80 verification & UDP checksum check',
      detailEn: isTcp
        ? 'The Transport layer analyzes the TCP segment: verifies target port 80 (HTTP Web server), validates sequence numbers, acknowledges data, strips the 20-byte TCP header, and extracts application payload.'
        : 'The Transport layer analyzes the UDP datagram: verifies target port 80 and checksum, strips the 8-byte UDP header, and extracts raw application payload.',
      factsEn: [
        ['Active Layer', '3 · Transport'],
        ['Target Port', 'Port 80 (Web Service / Server)'],
        ['Stripped Header', `${transport} (${transportHeaderLen} bytes)`],
        ['Extracted Data', `Application payload (${TCPIP_PAYLOAD_TEXT.length} bytes)`],
      ],
      tcpipMeta: {
        layer: 3,
        action: 'transport-header-processed',
        direction: 'decapsulation',
        node: 'server',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
          currentLayer: 3,
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
          label: `- ${transport} Header (${transportHeaderLen} B)`,
          payload: 'L3 Decapsulated',
          row: {
            time: '0.042 s',
            src: 'Serveur (L3 Transport)',
            dst: 'Serveur (L4 App)',
            proto: transport,
            info: `${transport} header stripped, delivered to port 80`,
            len: '5 B',
          },
          wire: frames.transportFrame,
        },
      ],
    },

    // Étape 12 : Récepteur — Couche 4 Application (Remise finale)
    {
      title: 'Serveur : Réception et livraison applicative (L4)',
      desc: 'Le message "Hello" est remis intact au serveur Web',
      detail:
        'La couche Application du serveur reçoit la donnée utilisateur "Hello" parfaitement intacte et décodée. Le cycle complet d’encapsulation descendante, de routage à travers le réseau Internet et de décapsulation ascendante est terminé avec succès !',
      facts: [
        ['Couche active', '4 · Application (Destination finale)'],
        ['Message délivré', `"${TCPIP_PAYLOAD_TEXT}" (5 octets)`],
        ['Intégrité des données', '100% conforme à l’émission originale'],
        ['Cycle TCP/IP', 'Complet avec succès'],
      ],
      titleEn: 'Server: Application Reception & Delivery (L4)',
      descEn: 'The message "Hello" is delivered intact to the web server',
      detailEn:
        'The server Application layer receives the intact user payload "Hello". The full cycle of top-down encapsulation, Internet routing, and bottom-up decapsulation has successfully completed!',
      factsEn: [
        ['Active Layer', '4 · Application (Final Destination)'],
        ['Delivered Message', `"${TCPIP_PAYLOAD_TEXT}" (5 bytes)`],
        ['Data Integrity', '100% matches original transmission'],
        ['TCP/IP Cycle', 'Successfully completed'],
      ],
      tcpipMeta: {
        layer: 4,
        action: 'application-data-delivered',
        direction: 'decapsulation',
        node: 'server',
        packetState: {
          applicationData: TCPIP_PAYLOAD_TEXT,
          transportType: transport,
          networkAccessType: networkAccess,
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
          color: 'amber',
          label: 'DATA DELIVERED: "Hello"',
          payload: TCPIP_PAYLOAD_TEXT,
          row: {
            time: '0.045 s',
            src: 'Serveur (L4 App)',
            dst: 'Processus Web (HTTP)',
            proto: 'DATA',
            info: 'Application message delivered successfully: "Hello"',
            len: '5 B',
          },
          wire: frames.appFrame,
        },
      ],
    },
  ];
}

export const TCPIP_SIMULATION_STEPS = createTcpipSteps('TCP', 'Ethernet');

export function getTcpipSteps(
  locale?: string,
  transport: 'TCP' | 'UDP' = 'TCP',
  networkAccess: 'Ethernet' | 'Wi-Fi' = 'Ethernet'
): TCPIPSimulationStep[] {
  const steps = createTcpipSteps(transport, networkAccess);
  if (locale === 'fr') {
    return steps;
  }
  return steps.map((s) => ({
    ...s,
    title: s.titleEn || s.title,
    desc: s.descEn || s.desc,
    detail: s.detailEn || s.detail,
    facts: s.factsEn || s.facts,
  }));
}
