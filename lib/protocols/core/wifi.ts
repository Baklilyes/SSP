import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const AP_MAC = '00:aa:bb:cc:dd:ee';

function buildDot11Header(type: string, src: string, dst: string, bssid: string): PacketBuilder {
  const dot11 = new PacketBuilder('dot11', `IEEE 802.11 ${type}`);
  dot11.summary = `802.11 ${type}`;
  dot11.field('Frame Control', `0x0080 (${type})`, () => dot11.u16(0x0080));
  dot11.field('Duration', '314 microseconds', () => dot11.u16(314));
  dot11.field('Receiver Address (BSSID)', bssid, () => dot11.raw([0x00, 0xaa, 0xbb, 0xcc, 0xdd, 0xee]));
  dot11.field('Transmitter Address', src, () => dot11.raw([0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]));
  dot11.field('Destination Address', dst, () => dot11.raw([0x00, 0xaa, 0xbb, 0xcc, 0xdd, 0xee]));
  dot11.field('Sequence Control', '0x1020', () => dot11.u16(0x1020));
  return dot11;
}

// 1. Association
const dot11Assoc = buildDot11Header('Association Request', CLIENT_MAC, AP_MAC, AP_MAC);
const assocPayload = new PacketBuilder('mgmt', 'Management: SSID "HomeNet"').ascii('SSID: HomeNet');
const frame1 = assembleLayers([dot11Assoc, assocPayload]);

// 2. WPA2 EAPOL 4-Way Handshake Message 1 (AP -> Client : ANonce)
const eapol1 = new PacketBuilder('eapol', 'EAPOL-Key (Message 1/4 : ANonce)');
eapol1.field('Key Descriptor', '1 (RC4/AES WPA2)', () => eapol1.u8(1));
eapol1.field('Key Information', '0x008a (Key Mic=0, Install=0)', () => eapol1.u16(0x008a));
eapol1.field('Key Length', '16 bytes (AES-128)', () => eapol1.u16(16));
eapol1.field('ANonce', '32 random bytes from AP', () => eapol1.unknown(32), {
  note: 'Valeur aléatoire générée par le point d’accès pour dériver la clé PTK',
});
const dot11Eapol1 = buildDot11Header('Data', AP_MAC, CLIENT_MAC, AP_MAC);
const frame2 = assembleLayers([dot11Eapol1, eapol1]);

// 3. WPA2 EAPOL 4-Way Handshake Message 2 (Client -> AP : SNonce + MIC)
const eapol2 = new PacketBuilder('eapol', 'EAPOL-Key (Message 2/4 : SNonce + MIC)');
eapol2.field('Key Information', '0x010a (Key Mic=1)', () => eapol2.u16(0x010a));
eapol2.field('SNonce', '32 random bytes from Client', () => eapol2.unknown(32));
eapol2.field('Key MIC', '16 bytes (HMAC-SHA1)', () => eapol2.unknown(16), {
  note: 'Code d’intégrité prouvant que le client possède le mot de passe Wi-Fi sans jamais le transmettre',
});
const dot11Eapol2 = buildDot11Header('Data', CLIENT_MAC, AP_MAC, AP_MAC);
const frame3 = assembleLayers([dot11Eapol2, eapol2]);

export const wifiProtocol: ProtocolDefinition = {
  id: 'wifi',
  name: 'Wi-Fi',
  title: 'Joining a Network (WPA2 4-Way Handshake)',
  layer: 2,
  group: 'core',
  nodes: ['client', 'ap'],
  legend: [
    ['blue', 'Association 802.11'],
    ['amber', 'Handshake 4-Way (EAPOL)'],
    ['green', 'Chiffrement WPA2 Actif'],
  ],
  overview: {
    full: 'Wi-Fi Protected Access 2 (IEEE 802.11i)',
    description:
      'WPA2 sécurise les communications sans fil Wi-Fi grâce au chiffrement CCMP/AES et au 4-Way Handshake qui dérive des clés de chiffrement de session uniques par appareil à partir de la clé prépartagée (PSK).',
    facts: [
      ['Couche OSI', 'Liaison sans fil (Couche 2)'],
      ['Chiffrement', 'CCMP (AES-128 en mode Counter avec CBC-MAC)'],
      ['Poignée de main', '4-Way Handshake EAPOL-Key'],
      ['Clés calculées', 'PMK (Master), PTK (Pairwise Transient), GTK (Group)'],
      ['Standard', 'IEEE 802.11i'],
    ],
  },
  steps: [
    {
      title: 'Association 802.11',
      desc: 'Négociation des capacités radio et association au SSID',
      detail:
        'Le client sélectionne le réseau sans fil et envoie une requête d’association contenant la liste de ses taux de transfert supportés.',
      facts: [
        ['SSID ciblé', 'HomeNet'],
        ['BSSID (Point d’accès)', AP_MAC],
      ],
      events: [
        { type: 'show', nodes: ['client', 'ap'], frame: 'local' },
        {
          type: 'packet',
          from: 'client',
          to: 'ap',
          color: 'blue',
          label: '802.11 ASSOC',
          row: { time: '0.000 s', src: CLIENT_MAC, dst: AP_MAC, proto: '802.11', info: 'Association Request (SSID: HomeNet)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'WPA2 4-Way Handshake : Émission de l’ANonce',
      desc: 'Message 1/4 transmis par le point d’accès',
      detail:
        'Le point d’accès génère un nombre aléatoire de 256 bits (ANonce) et le transmet au client. Le client combine l’ANonce, son propre SNonce et le mot de passe Wi-Fi (PMK) pour dériver la clé de session PTK.',
      facts: [
        ['Message', 'EAPOL-Key 1/4'],
        ['Contenu clé', 'ANonce (32 octets aléatoires)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'ap',
          to: 'client',
          color: 'amber',
          label: 'EAPOL M1 (ANonce)',
          row: { time: '0.005 s', src: AP_MAC, dst: CLIENT_MAC, proto: 'EAPOL', info: 'WPA2 Handshake Message 1: ANonce', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Preuve Cryptographique (SNonce & MIC)',
      desc: 'Message 2/4 prouvant la possession du mot de passe',
      detail:
        'Le client renvoie son SNonce accompagné d’un code de contrôle d’intégrité (MIC). Le point d’accès valide le MIC et confirme que le client détient le bon mot de passe.',
      facts: [
        ['Message', 'EAPOL-Key 2/4'],
        ['Sécurité', 'Le mot de passe en clair ne transite jamais dans les airs'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'ap',
          color: 'green',
          label: 'EAPOL M2 (SNonce+MIC)',
          row: { time: '0.010 s', src: CLIENT_MAC, dst: AP_MAC, proto: 'EAPOL', info: 'WPA2 Handshake Message 2: SNonce + MIC', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
