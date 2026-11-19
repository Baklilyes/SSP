import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const AP_MAC = '00:aa:bb:cc:dd:ee';

function buildWpa3SaePacket(type: 'commit' | 'confirm', src: string, dst: string): PacketBuilder {
  const dot11 = new PacketBuilder('dot11', '802.11 Authentication (SAE)');
  dot11.field('Auth Algorithm', '3 (SAE - Simultaneous Authentication of Equals)', () => dot11.u16(3), { heading: true });
  dot11.field('Auth Sequence', type === 'commit' ? '1 (Commit)' : '2 (Confirm)', () => dot11.u16(type === 'commit' ? 1 : 2));
  dot11.field('Status Code', '0 (Successful)', () => dot11.u16(0));

  if (type === 'commit') {
    dot11.field('Group ID', '19 (ECC NIST P-256)', () => dot11.u16(19));
    dot11.field('Scalar', '32 bytes (Scalar modulo r)', () => dot11.unknown(32));
    dot11.field('Element', '64 bytes (Point on Elliptic Curve)', () => dot11.unknown(64), {
      note: 'Élément dérivé du mot de passe avec PWE (Password Element) empêchant toute écoute par dictionnaire',
    });
  } else {
    dot11.field('Send-Confirm Counter', '1', () => dot11.u16(1));
    dot11.field('Confirm Verifier', '32 bytes (HMAC-SHA256)', () => dot11.unknown(32), {
      note: 'Preuve que le secret partagé est identique des deux côtés',
    });
  }
  return dot11;
}

// 1. SAE Commit (Client -> AP)
const saeCommitC = buildWpa3SaePacket('commit', CLIENT_MAC, AP_MAC);
const frame1 = assembleLayers([saeCommitC]);

// 2. SAE Commit (AP -> Client)
const saeCommitAP = buildWpa3SaePacket('commit', AP_MAC, CLIENT_MAC);
const frame2 = assembleLayers([saeCommitAP]);

// 3. SAE Confirm
const saeConfirm = buildWpa3SaePacket('confirm', CLIENT_MAC, AP_MAC);
const frame3 = assembleLayers([saeConfirm]);

export const wpa3Protocol: ProtocolDefinition = {
  id: 'wpa3',
  name: 'WPA3',
  title: 'Safer Wi-Fi (Dragonfly SAE Handshake)',
  layer: 2,
  group: 'security',
  nodes: ['client', 'ap'],
  legend: [
    ['amber', 'SAE Commit (Échange Diffie-Hellman)'],
    ['blue', 'SAE Confirm (Vérification Cryptographique)'],
    ['green', 'Association Chiffrée WPA3'],
  ],
  overview: {
    full: 'Wi-Fi Protected Access 3 (SAE)',
    description:
      'WPA3 remplace la négociation WPA2 vulnérable aux attaques par dictionnaire hors-ligne par le protocole Dragonfly SAE (Simultaneous Authentication of Equals). Même avec un mot de passe faible, aucune capture ne permet de retrouver la clé.',
    facts: [
      ['Couche OSI', 'Liaison sans fil (Couche 2)'],
      ['Protocole clé', 'Dragonfly SAE (RFC 7664)'],
      ['Courbe elliptique', 'NIST P-256 (Groupe 19) ou Brainpool'],
      ['Protection', 'Immunité contre les dictionnaires hors-ligne et PFS immédiate'],
      ['Standard', 'IEEE 802.11az / WPA3-Personal'],
    ],
  },
  steps: [
    {
      title: 'SAE Commit (Échange Symétrique)',
      desc: 'Envoi des éléments scalaires et de courbe elliptique',
      detail:
        'Le client et le point d’accès dérivent un élément de mot de passe (PWE) à partir du mot de passe Wi-Fi et s’échangent simultanément un scalaire et un point de courbe aléatoires.',
      facts: [
        ['Algorithme', '3 (SAE Dragonfly)'],
        ['Groupe', '19 (NIST P-256)'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'ap'], frame: 'local' },
        {
          type: 'packet',
          from: 'client',
          to: 'ap',
          color: 'amber',
          label: 'SAE COMMIT (C➔AP)',
          row: { time: '0.000 s', src: CLIENT_MAC, dst: AP_MAC, proto: 'WPA3', info: 'Authentication: SAE Commit (Group 19, Scalar, Element)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
        {
          type: 'packet',
          from: 'ap',
          to: 'client',
          color: 'amber',
          label: 'SAE COMMIT (AP➔C)',
          row: { time: '0.005 s', src: AP_MAC, dst: CLIENT_MAC, proto: 'WPA3', info: 'Authentication: SAE Commit Reply', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'SAE Confirm (Preuve de Possession)',
      desc: 'Validation cryptographique mutuelle du secret partagé',
      detail:
        'Les deux appareils calculent le secret partagé et s’envoient un jeton de confirmation HMAC. Contrairement à WPA2, un espion qui enregistre cet échange ne peut tester aucun mot de passe hors-ligne.',
      facts: [
        ['Vérification', 'HMAC-SHA256'],
        ['Confidentialité persistante', 'Garantie même en cas de fuite ultérieure du mot de passe'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'ap',
          color: 'blue',
          label: 'SAE CONFIRM',
          row: { time: '0.010 s', src: CLIENT_MAC, dst: AP_MAC, proto: 'WPA3', info: 'Authentication: SAE Confirm (Verification successful)', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
