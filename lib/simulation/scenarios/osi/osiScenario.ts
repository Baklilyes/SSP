import { ProtocolDefinition } from '../../types';
import { OSI_SIMULATION_STEPS, getOsiSteps } from './osiEvents';

export const osiBasicScenarioFr: ProtocolDefinition = {
  id: 'osi',
  name: 'Modèle OSI',
  title: 'Modèle OSI en 7 Couches (Encapsulation)',
  layer: 7,
  group: 'core',
  nodes: ['client', 'internet', 'web'],
  labels: {
    client: ['Hôte Émetteur (Client)', '192.168.1.100'],
    internet: ['Réseau de Transmission', 'Média & Câble Physique (L1)'],
    web: ['Hôte Récepteur (Serveur)', '203.0.113.10'],
  },
  legend: [
    ['amber', 'Données & Application (L7 - L5)'],
    ['blue', 'Transport & Réseau (L4 - L3)'],
    ['green', 'Liaison & Physique (L2 - L1)'],
  ],
  overview: {
    full: 'Modèle d’Interconnexion des Systèmes Ouverts (OSI · ISO/IEC 7498-1)',
    description:
      'Le modèle OSI décompose la communication réseau en 7 couches standardisées. Du message utilisateur à l’impulsion électrique sur le câble, chaque couche enrichit la donnée d’un en-tête dédié (encapsulation) avant que le récepteur ne valide et retire ces couches une à une (décapsulation).',
    facts: [
      ['Standardisation', 'ISO / CEI 7498-1 (1984)'],
      ['Nombre de couches', '7 couches hiérarchiques'],
      ['Processus clé', 'Encapsulation descendante & Décapsulation montante'],
      ['Donnée de test', 'Message "Hello" (5 octets)'],
      ['Trame finale', 'Ethernet II + IPv4 + TCP + Données (59 octets)'],
    ],
  },
  outro: {
    title: 'CYCLE OSI TERMINÉ AVEC SUCCÈS',
    desc: 'Encapsulation, émission binaire et décapsulation parfaites',
    text:
      'Le message "Hello" a parcouru les 7 couches de l’émetteur en recevant successivement ses en-têtes TCP, IP et Ethernet. Converti en signaux physiques sur le média de transmission, il a ensuite été reçu, validé et décapsulé couche par couche jusqu’à être remis intact au processus destinataire.',
    facts: [
      ['CHARGE UTILE', '"Hello" (5 octets)'],
      ['TAILLE TRAME', '59 octets (472 bits)'],
      ['ÉTAPES TOTALES', '12 étapes synchronisées'],
      ['PROTOCOLES CLÉS', 'TCP (L4), IPv4 (L3), Ethernet (L2)'],
    ],
  },
  start: {
    nodes: ['client'],
    frame: 'client',
  },
  steps: OSI_SIMULATION_STEPS,
};

export const osiBasicScenarioEn: ProtocolDefinition = {
  id: 'osi',
  name: 'OSI Model',
  title: 'OSI 7-Layer Model (Encapsulation)',
  layer: 7,
  group: 'core',
  nodes: ['client', 'internet', 'web'],
  labels: {
    client: ['Sender Host (Client)', '192.168.1.100'],
    internet: ['Transmission Network', 'Physical Media & Cable (L1)'],
    web: ['Receiver Host (Server)', '203.0.113.10'],
  },
  legend: [
    ['amber', 'Data & Application (L7 - L5)'],
    ['blue', 'Transport & Network (L4 - L3)'],
    ['green', 'Data Link & Physical (L2 - L1)'],
  ],
  overview: {
    full: 'Open Systems Interconnection Model (OSI · ISO/IEC 7498-1)',
    description:
      'The OSI model divides network communications into 7 standardized layers. From user data to electrical or optical pulses on the wire, each layer enriches data with a dedicated header (encapsulation) before the receiver validates and strips them layer by layer (decapsulation).',
    facts: [
      ['Standardization', 'ISO / IEC 7498-1 (1984)'],
      ['Layer Count', '7 hierarchical layers'],
      ['Key Process', 'Top-down encapsulation & bottom-up decapsulation'],
      ['Test Payload', 'Message "Hello" (5 bytes)'],
      ['Final Frame', 'Ethernet II + IPv4 + TCP + Data (59 bytes)'],
    ],
  },
  outro: {
    title: 'OSI CYCLE SUCCESSFULLY COMPLETED',
    desc: 'Flawless encapsulation, bitstream transmission, and decapsulation',
    text:
      'The "Hello" message traversed the 7 sender layers, acquiring TCP, IPv4, and Ethernet headers. Converted into physical bit pulses across the transmission medium, it was subsequently detected, checked, and stripped layer by layer until delivered intact to the destination process.',
    facts: [
      ['PAYLOAD', '"Hello" (5 bytes)'],
      ['FRAME SIZE', '59 bytes (472 bits)'],
      ['TOTAL STEPS', '12 synchronized steps'],
      ['CORE PROTOCOLS', 'TCP (L4), IPv4 (L3), Ethernet (L2)'],
    ],
  },
  start: {
    nodes: ['client'],
    frame: 'client',
  },
  steps: getOsiSteps('en'),
};

export const osiBasicScenario = osiBasicScenarioFr;

export function getOsiScenario(locale?: string): ProtocolDefinition {
  if (locale === 'fr') {
    return osiBasicScenarioFr;
  }
  return osiBasicScenarioEn;
}
