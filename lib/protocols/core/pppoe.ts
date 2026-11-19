import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';

const ROUTER_MAC = '00:22:33:44:55:66';
const BNG_MAC = '00:99:88:77:66:55';
const BROADCAST_MAC = 'ff:ff:ff:ff:ff:ff';

function buildPppoeHeader(code: number, name: string, sessionId = 0): PacketBuilder {
  const ppp = new PacketBuilder('pppoe', `PPPoE ${name}`);
  ppp.summary = `PPPoE ${name}`;
  ppp.field('Version / Type', '0x11 (Ver: 1, Type: 1)', () => ppp.u8(0x11));
  ppp.field('Code', `0x${code.toString(16).padStart(2, '0')} (${name})`, () => ppp.u8(code), { heading: true });
  ppp.field('Session ID', `0x${sessionId.toString(16).padStart(4, '0')}`, () => ppp.u16(sessionId));
  ppp.field('Payload Length', '16 bytes', () => ppp.u16(16));
  ppp.field('Tag: Service Name', 'Any Service (Length: 0)', () => ppp.u16(0x0101).u16(0));
  ppp.field('Tag: Host Uniq', '0x12345678', () => ppp.u16(0x0103).u16(4).u32(0x12345678));
  return ppp;
}

// 1. PADI (Initiation) Broadcast
const padi = buildPppoeHeader(0x09, 'PADI (Active Discovery Initiation)');
const ethPadi = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: BROADCAST_MAC, etherType: 0x8863 });
const frame1 = assembleLayers([ethPadi, padi]);

// 2. PADO (Offer) Unicast from BNG
const pado = buildPppoeHeader(0x07, 'PADO (Active Discovery Offer)');
const ethPado = buildEthernetFrame({ srcMac: BNG_MAC, dstMac: ROUTER_MAC, etherType: 0x8863 });
const frame2 = assembleLayers([ethPado, pado]);

// 3. PADS (Session Confirmation) Session ID 0x1a4f
const pads = buildPppoeHeader(0x65, 'PADS (Active Discovery Session-confirmation)', 0x1a4f);
const frame3 = assembleLayers([ethPado, pads]);

export const pppoeProtocol: ProtocolDefinition = {
  id: 'pppoe',
  name: 'PPPoE',
  title: 'Broadband Access & Authentication',
  layer: 2,
  group: 'core',
  nodes: ['router', 'bng', 'isp'],
  legend: [
    ['amber', 'PADI (Diffusion Broadcast)'],
    ['blue', 'PADO (Offre Serveur BNG)'],
    ['green', 'PADS (Session ID Attribué)'],
  ],
  overview: {
    full: 'Point-to-Point Protocol over Ethernet',
    description:
      'PPPoE encapsule des trames PPP dans des trames Ethernet, permettant aux fournisseurs d’accès Internet (FAI) d’authentifier chaque abonné (login/mot de passe), d’attribuer des IP fixes ou dynamiques et de gérer la facturation sur lignes fibre et DSL.',
    facts: [
      ['Couche OSI', 'Liaison (Couche 2/3)'],
      ['EtherType', '0x8863 (Découverte), 0x8864 (Session)'],
      ['Surcharge MTU', '8 octets (impose un MTU de 1492 au lieu de 1500)'],
      ['Équipement FAI', 'BNG (Broadband Network Gateway) / BRAS'],
      ['Standard', 'RFC 2516'],
    ],
  },
  steps: [
    {
      title: 'PADI (Active Discovery Initiation)',
      desc: 'Le routeur cherche un concentrateur d’accès BNG',
      detail:
        'Le routeur domestique émet une trame de découverte PADI en diffusion broadcast (EtherType 0x8863) sur la ligne d’accès pour localiser le serveur BNG du FAI.',
      facts: [
        ['Message', 'PADI (Code 0x09)'],
        ['Adresse destination', 'FF:FF:FF:FF:FF:FF (Broadcast)'],
      ],
      events: [
        { type: 'show', nodes: ['router', 'bng', 'isp'], frame: 'full' },
        {
          type: 'packet',
          from: 'router',
          to: 'bng',
          color: 'amber',
          label: 'PPPoE PADI',
          row: { time: '0.000 s', src: ROUTER_MAC, dst: BROADCAST_MAC, proto: 'PPPoE', info: 'Active Discovery Initiation (PADI)', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'PADO (Active Discovery Offer)',
      desc: 'Le serveur BNG répond en unicast',
      detail:
        'Le serveur d’accès BNG répond avec son nom de concentrateur (AC-Name: Orange-BNG-01) et confirme qu’il est prêt à ouvrir la session PPP.',
      facts: [
        ['Message', 'PADO (Code 0x07)'],
        ['Serveur BNG', BNG_MAC],
      ],
      events: [
        {
          type: 'packet',
          from: 'bng',
          to: 'router',
          color: 'blue',
          label: 'PPPoE PADO',
          row: { time: '0.010 s', src: BNG_MAC, dst: ROUTER_MAC, proto: 'PPPoE', info: 'Active Discovery Offer (PADO)', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'PADS (Session-Confirmation)',
      desc: 'Attribution d’un Session ID unique',
      detail:
        'Après confirmation (PADR), le serveur BNG transmet le paquet PADS attribuant l’identifiant de session (Session ID: 0x1a4f). La phase de découverte est terminée : la liaison bascule en EtherType 0x8864 pour le transport des paquets IP.',
      facts: [
        ['Session ID', '0x1a4f'],
        ['Statut', 'Session PPPoE ouverte'],
      ],
      events: [
        {
          type: 'packet',
          from: 'bng',
          to: 'router',
          color: 'green',
          label: 'PPPoE PADS',
          row: { time: '0.020 s', src: BNG_MAC, dst: ROUTER_MAC, proto: 'PPPoE', info: 'Active Discovery Session-confirmation (ID: 0x1a4f)', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
