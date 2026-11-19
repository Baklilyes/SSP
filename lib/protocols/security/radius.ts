import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const AP_MAC = '00:aa:bb:cc:dd:ee';
const RADIUS_IP = '192.168.1.250';
const AP_IP = '192.168.1.2';
const RADIUS_PORT = 1812;

// 1. EAP Response Identity (Client -> AP)
const eapId = new PacketBuilder('eap', 'EAP-Response (Identity: mohamed@corp.local)');
eapId.field('Code', '2 (Response)', () => eapId.u8(2));
eapId.field('Id', '1', () => eapId.u8(1));
eapId.field('Length', '21 bytes', () => eapId.u16(21));
eapId.field('Type', '1 (Identity)', () => eapId.u8(1), { heading: true });
eapId.field('Identity', 'mohamed@corp.local', () => eapId.ascii('mohamed@corp.local'));
const eth1 = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: AP_MAC, etherType: 0x888e }); // 802.1X EAPOL
const frame1 = assembleLayers([eth1, eapId]);

// 2. RADIUS Access-Request (AP -> RADIUS Server)
const radReq = new PacketBuilder('radius', 'RADIUS Access-Request');
radReq.field('Code', '1 (Access-Request)', () => radReq.u8(1), { heading: true });
radReq.field('Identifier', '1', () => radReq.u8(1));
radReq.field('Length', '76 bytes', () => radReq.u16(76));
radReq.field('Authenticator', '16 random bytes', () => radReq.unknown(16));
radReq.field('Attribute: User-Name', 'mohamed@corp.local', () => {
  radReq.u8(1); // User-Name
  radReq.u8(18);
  radReq.ascii('mohamed@corp.local');
});
radReq.field('Attribute: NAS-IP-Address', AP_IP, () => {
  radReq.u8(4);
  radReq.u8(6);
  radReq.raw([192, 168, 1, 2]);
});
const radUdp1 = buildUdpDatagram({ srcPort: 49100, dstPort: RADIUS_PORT, payloadLength: radReq.length });
const radIp1 = buildIpv4Packet({ srcIp: AP_IP, dstIp: RADIUS_IP, protocol: 17, payloadLength: radUdp1.length + radReq.length });
const ethAp = buildEthernetFrame({ srcMac: AP_MAC, dstMac: '00:99:88:77:66:55' });
const frame2 = assembleLayers([ethAp, radIp1, radUdp1, radReq]);

// 3. RADIUS Access-Accept (RADIUS Server -> AP)
const radAcc = new PacketBuilder('radius', 'RADIUS Access-Accept (PMK Key Granted)');
radAcc.field('Code', '2 (Access-Accept)', () => radAcc.u8(2), { heading: true });
radAcc.field('Identifier', '1', () => radAcc.u8(1));
radAcc.field('Length', '64 bytes', () => radAcc.u16(64));
radAcc.field('Attribute: MS-MPPE-Recv-Key', 'Pairwise Master Key (PMK 32 bytes)', () => radAcc.unknown(34), {
  note: 'Clé maîtresse transmise de manière confidentielle au point d’accès pour ouvrir le port réseau de l’utilisateur',
});
const radUdp2 = buildUdpDatagram({ srcPort: RADIUS_PORT, dstPort: 49100, payloadLength: radAcc.length });
const radIp2 = buildIpv4Packet({ srcIp: RADIUS_IP, dstIp: AP_IP, protocol: 17, payloadLength: radUdp2.length + radAcc.length });
const frame3 = assembleLayers([ethAp, radIp2, radUdp2, radAcc]);

export const radiusProtocol: ProtocolDefinition = {
  id: 'radius',
  name: 'RADIUS',
  title: '802.1X Enterprise Wi-Fi Authentication',
  layer: 2,
  group: 'security',
  nodes: ['client', 'ap', 'auth'],
  legend: [
    ['blue', 'Identité EAPOL (Client ➔ AP)'],
    ['amber', 'RADIUS Access-Request (AP ➔ Serveur)'],
    ['green', 'RADIUS Access-Accept (Accès Autorisé)'],
  ],
  overview: {
    full: 'Remote Authentication Dial-In User Service (RFC 2865)',
    description:
      'RADIUS centralise l’authentification (AAA) dans les réseaux d’entreprise (WPA-Enterprise / 802.1X). Chaque collaborateur se connecte avec son compte individuel ou son certificat, sans mot de passe Wi-Fi partagé.',
    facts: [
      ['Couche OSI', 'Application / Sécurité Réseau'],
      ['Transport', 'UDP (Ports standard 1812 Auth / 1813 Acct)'],
      ['Modèle AAA', 'Authentification, Autorisation, Traçabilité (Accounting)'],
      ['Intégration', 'EAP-TLS, PEAP, Active Directory, LDAP'],
      ['Standard', 'RFC 2865, RFC 3579'],
    ],
  },
  steps: [
    {
      title: 'Envoi de l’Identité (EAP-Response Identity)',
      desc: 'Le client présente ses identifiants 802.1X au point d’accès',
      detail:
        'Le client sans fil transmet son identité réseau (mohamed@corp.local) au point d’accès dans une trame EAPOL sur la couche 2.',
      facts: [
        ['Identifiant', 'mohamed@corp.local'],
        ['Protocole', 'IEEE 802.1X EAPOL'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'ap', 'auth'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'ap',
          color: 'blue',
          label: 'EAP IDENTITY',
          row: { time: '0.000 s', src: CLIENT_MAC, dst: AP_MAC, proto: 'EAPOL', info: 'EAP Response, Identity: mohamed@corp.local', len: `${frame1.bytes.length} B` },
          wire: frame1,
        },
      ],
    },
    {
      title: 'Transmission RADIUS Access-Request',
      desc: 'Le point d’accès relaie la demande au serveur central',
      detail:
        'Le point d’accès encapsule la requête dans un datagramme UDP vers le serveur RADIUS d’entreprise sur le port 1812.',
      facts: [
        ['Code', '1 (Access-Request)'],
        ['Port', 'UDP 1812'],
      ],
      events: [
        {
          type: 'packet',
          from: 'ap',
          to: 'auth',
          color: 'amber',
          label: 'RADIUS REQUEST',
          row: { time: '0.005 s', src: AP_IP, dst: RADIUS_IP, proto: 'RADIUS', info: 'Access-Request (User: mohamed@corp.local)', len: `${frame2.bytes.length} B` },
          wire: frame2,
        },
      ],
    },
    {
      title: 'Validation & Clé de Session (Access-Accept)',
      desc: 'Le serveur autorise la connexion et fournit la clé PMK',
      detail:
        'Après vérification des droits dans l’annuaire, le serveur RADIUS transmet un Access-Accept contenant la clé maîtresse PMK. Le point d’accès débloque le port et active le chiffrement individuel de l’utilisateur.',
      facts: [
        ['Code', '2 (Access-Accept)'],
        ['Résultat', 'Connexion réseau d’entreprise autorisée'],
      ],
      events: [
        {
          type: 'packet',
          from: 'auth',
          to: 'ap',
          color: 'green',
          label: 'RADIUS ACCEPT',
          row: { time: '0.012 s', src: RADIUS_IP, dst: AP_IP, proto: 'RADIUS', info: 'Access-Accept: User authenticated, PMK granted', len: `${frame3.bytes.length} B` },
          wire: frame3,
        },
      ],
    },
  ],
};
