import { ProtocolDefinition } from '../../types';
import { TCPIP_SIMULATION_STEPS, getTcpipSteps } from './tcpipEvents';

export const tcpipBasicScenarioFr: ProtocolDefinition = {
  id: 'tcpip',
  name: 'Modèle TCP/IP',
  title: 'Modèle TCP/IP en 4 Couches (Architecture Internet)',
  layer: 4,
  group: 'core',
  nodes: ['client', 'router', 'web'],
  labels: {
    client: ['Hôte Émetteur (Client)', '192.168.1.10'],
    router: ['Routeur d’Interconnexion (IP)', 'Passerelle & Transit'],
    web: ['Hôte Récepteur (Serveur Web)', '10.0.0.20'],
  },
  legend: [
    ['amber', 'Couche 4 · Application (HTTP, DNS, DHCP)'],
    ['blue', 'Couche 3 · Transport (TCP / UDP)'],
    ['cyan', 'Couche 2 · Internet (IPv4 / IPv6, Routage)'],
    ['green', 'Couche 1 · Hôte-Réseau (Ethernet, Wi-Fi)'],
  ],
  overview: {
    full: 'Modèle d’Architecture Réseau TCP/IP (DoD / IETF RFC 1122)',
    description:
      'Le modèle TCP/IP structure la communication de l’Internet moderne en 4 couches pratiques et orientées interconnexion. Contrairement au modèle théorique OSI en 7 couches, TCP/IP intègre les couches hautes dans l’Application et les couches basses dans l’Accès Réseau, tout en plaçant la couche Internet au cœur du routage universel.',
    facts: [
      ['Standardisation', 'IETF RFC 1122 & DARPA / DoD'],
      ['Nombre de couches', '4 couches opérationnelles'],
      ['Cœur du modèle', 'IP (Internet Protocol) & Adressage universel'],
      ['Choix de transport', 'TCP (Fiable avec connexion) ou UDP (Rapide sans connexion)'],
      ['Trame de test', 'Ethernet II + IPv4 + TCP + Message "Hello" (59 octets)'],
    ],
  },
  outro: {
    title: 'CYCLE TCP/IP TERMINÉ AVEC SUCCÈS',
    desc: 'Encapsulation, routage à travers le réseau et décapsulation parfaits',
    text:
      'Le message applicatif a traversé les 4 couches TCP/IP : enrichi d’en-têtes Transport (TCP/UDP) et Internet (IPv4), puis encapsulé dans une trame locale Hôte-Réseau (Ethernet). Routé efficacement à travers l’infrastructure réseau jusqu’au serveur, il a été validé et délivré intact au processus récepteur.',
    facts: [
      ['CHARGE UTILE', '"Hello" (5 octets)'],
      ['DATAGRAMME IP', '45 octets'],
      ['TRAME FINALE', '59 octets (472 bits)'],
      ['NOMBRE D’ÉTAPES', '12 étapes synchronisées'],
      ['COUCHE CLÉ', 'Couche 2 Internet (Routage universel)'],
    ],
  },
  start: {
    nodes: ['client'],
    frame: 'client',
  },
  steps: TCPIP_SIMULATION_STEPS,
};

export const tcpipBasicScenarioEn: ProtocolDefinition = {
  id: 'tcpip',
  name: 'TCP/IP Model',
  title: 'TCP/IP 4-Layer Model (Internet Architecture)',
  layer: 4,
  group: 'core',
  nodes: ['client', 'router', 'web'],
  labels: {
    client: ['Sender Host (Client)', '192.168.1.10'],
    router: ['Interconnection Router (IP)', 'Gateway & Transit'],
    web: ['Receiver Host (Web Server)', '10.0.0.20'],
  },
  legend: [
    ['amber', 'Layer 4 · Application (HTTP, DNS, DHCP)'],
    ['blue', 'Layer 3 · Transport (TCP / UDP)'],
    ['cyan', 'Layer 2 · Internet (IPv4 / IPv6, Routing)'],
    ['green', 'Layer 1 · Host-to-Network (Ethernet, Wi-Fi)'],
  ],
  overview: {
    full: 'TCP/IP Network Architecture Model (DoD / IETF RFC 1122)',
    description:
      'The TCP/IP model powers modern global Internet communication across 4 pragmatic, interconnection-oriented layers. Unlike the 7-layer OSI theoretical stack, TCP/IP consolidates upper layers into Application and lower layers into Host-to-Network, positioning the Internet layer as the universal routing core.',
    facts: [
      ['Standardization', 'IETF RFC 1122 & DARPA / DoD'],
      ['Layer Count', '4 operational layers'],
      ['Model Core', 'IP (Internet Protocol) & Universal Addressing'],
      ['Transport Choice', 'TCP (Reliable, connected) or UDP (Fast, connectionless)'],
      ['Test Frame', 'Ethernet II + IPv4 + TCP + Message "Hello" (59 bytes)'],
    ],
  },
  outro: {
    title: 'TCP/IP CYCLE COMPLETED SUCCESSFULLY',
    desc: 'Flawless encapsulation, multi-hop routing, and destination decapsulation',
    text:
      'The application message traversed all 4 TCP/IP layers: enriched with Transport (TCP/UDP) and Internet (IPv4) headers, encapsulated into a local Host-to-Network frame (Ethernet). Routed efficiently across network infrastructure to the server, it was validated and delivered intact to the receiving process.',
    facts: [
      ['PAYLOAD', '"Hello" (5 bytes)'],
      ['IP DATAGRAM', '45 bytes'],
      ['FINAL FRAME', '59 bytes (472 bits)'],
      ['TOTAL STEPS', '12 synchronized steps'],
      ['CORE LAYER', 'Layer 2 Internet (Universal Routing)'],
    ],
  },
  start: {
    nodes: ['client'],
    frame: 'client',
  },
  steps: getTcpipSteps('en'),
};

export const tcpipBasicScenario = tcpipBasicScenarioFr;

export function getTcpipScenario(
  locale?: string,
  transport: 'TCP' | 'UDP' = 'TCP'
): ProtocolDefinition {
  const isFrench = locale === 'fr';
  const base = isFrench ? tcpipBasicScenarioFr : tcpipBasicScenarioEn;
  const steps = getTcpipSteps(locale, transport);
  return {
    ...base,
    steps,
  };
}
