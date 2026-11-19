import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const SERVER_MAC = '00:aa:bb:cc:dd:ee';
const CLIENT_IP = '192.168.1.100';
const SMB_SERVER_IP = '192.168.1.150'; // Local NAS / File Server

// Helper: NetBIOS framing (4 bytes: 0x00 + 3-byte payload length)
function addNetBiosHeader(builder: PacketBuilder, length: number) {
  builder.field('NetBIOS Session Service', `Length: ${length} bytes`, () => {
    builder.u8(0x00).u24(length);
  });
}

// 1. SMB2 Negotiate Request
const smbNegReq = new PacketBuilder('smb2', 'SMB2 Negotiate Protocol Request');
addNetBiosHeader(smbNegReq, 64 + 36);
smbNegReq.field('Protocol ID', '0xFE 53 4D 42 (SMB2)', () => smbNegReq.raw([0xfe, 0x53, 0x4d, 0x42]), { heading: true });
smbNegReq.field('Header Length', '64 bytes', () => smbNegReq.u16(64));
smbNegReq.field('Credit Charge', '1', () => smbNegReq.u16(1));
smbNegReq.field('NT Status', '0x00000000 (STATUS_SUCCESS)', () => smbNegReq.u32(0));
smbNegReq.field('Command', '0x0000 (NEGOTIATE)', () => smbNegReq.u16(0x0000));
smbNegReq.field('Credits Requested', '32', () => smbNegReq.u16(32));
smbNegReq.field('Flags', '0x00000000 (Client Request)', () => smbNegReq.u32(0));
smbNegReq.field('Message ID', '0', () => smbNegReq.u32(0).u32(0));
smbNegReq.field('Process ID / Tree ID', '0 / 0', () => smbNegReq.u32(0).u32(0));
smbNegReq.field('Session ID', '0x0000000000000000', () => smbNegReq.u32(0).u32(0));
smbNegReq.field('Signature', '16 zeros (unauthenticated)', () => smbNegReq.unknown(16));
smbNegReq.field('Dialects Count', '4 (SMB 2.0.2, 2.1, 3.0, 3.1.1)', () => smbNegReq.u16(4));
smbNegReq.field('Security Mode', '0x01 (Signing Enabled)', () => smbNegReq.u16(0x0001));
smbNegReq.field('Capabilities', '0x00000044 (DFS, Multi-Channel, Leasing)', () => smbNegReq.u32(0x00000044));
smbNegReq.field('Client GUID', '16 bytes unique ID', () => smbNegReq.unknown(16));
smbNegReq.field('Supported Dialects', '0x0202, 0x0210, 0x0300, 0x0311', () =>
  smbNegReq.u16(0x0202).u16(0x0210).u16(0x0300).u16(0x0311)
);

const tcpNegReq = buildTcpSegment({
  srcPort: 54400,
  dstPort: 445,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: smbNegReq.length,
});
const ipNegReq = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: SMB_SERVER_IP, protocol: 6, payloadLength: tcpNegReq.length + smbNegReq.length });
const ethNegReq = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: SERVER_MAC });
const frameNegReq = assembleLayers([ethNegReq, ipNegReq, tcpNegReq, smbNegReq]);

// 2. SMB2 Negotiate Response (Dialect 0x0311 Chosen)
const smbNegResp = new PacketBuilder('smb2', 'SMB2 Negotiate Protocol Response');
addNetBiosHeader(smbNegResp, 64 + 48);
smbNegResp.field('Protocol ID', '0xFE 53 4D 42 (SMB2)', () => smbNegResp.raw([0xfe, 0x53, 0x4d, 0x42]), { heading: true });
smbNegResp.field('Header Length', '64 bytes', () => smbNegResp.u16(64));
smbNegResp.field('Credit Charge', '1', () => smbNegResp.u16(1));
smbNegResp.field('NT Status', '0x00000000 (STATUS_SUCCESS)', () => smbNegResp.u32(0));
smbNegResp.field('Command', '0x0000 (NEGOTIATE)', () => smbNegResp.u16(0x0000));
smbNegResp.field('Credits Granted', '64', () => smbNegResp.u16(64));
smbNegResp.field('Flags', '0x00000001 (Server Response)', () => smbNegResp.u32(1));
smbNegResp.field('Message ID', '0', () => smbNegResp.u32(0).u32(0));
smbNegResp.field('Process ID / Tree ID', '0 / 0', () => smbNegResp.u32(0).u32(0));
smbNegResp.field('Session ID', '0x0000000000000000', () => smbNegResp.u32(0).u32(0));
smbNegResp.field('Signature', '16 zeros', () => smbNegResp.unknown(16));
smbNegResp.field('Selected Dialect', '0x0311 (SMB 3.1.1 avec chiffrement AES-128-GCM)', () => smbNegResp.u16(0x0311));
smbNegResp.field('Server GUID', '16 bytes GUID', () => smbNegResp.unknown(16));
smbNegResp.field('System Time', '64-bit Windows FileTime', () => smbNegResp.u32(0x1a2b3c4d).u32(0x5e6f7a8b));

const tcpNegResp = buildTcpSegment({
  srcPort: 445,
  dstPort: 54400,
  seq: 1,
  ack: 1 + smbNegReq.length,
  flags: { psh: true, ack: true },
  payloadLength: smbNegResp.length,
});
const ipNegResp = buildIpv4Packet({ srcIp: SMB_SERVER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpNegResp.length + smbNegResp.length });
const ethNegResp = buildEthernetFrame({ srcMac: SERVER_MAC, dstMac: CLIENT_MAC });
const frameNegResp = assembleLayers([ethNegResp, ipNegResp, tcpNegResp, smbNegResp]);

// 3. SMB2 Tree Connect Request (\\FILESERVER\Projects)
const smbTreeReq = new PacketBuilder('smb2', 'SMB2 Tree Connect Request');
const sharePath = '\\\\FILESERVER\\Projects';
addNetBiosHeader(smbTreeReq, 64 + 8 + sharePath.length * 2);
smbTreeReq.field('Protocol ID', '0xFE 53 4D 42 (SMB2)', () => smbTreeReq.raw([0xfe, 0x53, 0x4d, 0x42]), { heading: true });
smbTreeReq.field('Command', '0x0003 (TREE_CONNECT)', () => smbTreeReq.u16(0x0003));
smbTreeReq.field('Credits Requested', '1', () => smbTreeReq.u16(1));
smbTreeReq.field('Flags', '0x00000000 (Client Request)', () => smbTreeReq.u32(0));
smbTreeReq.field('Message ID', '2', () => smbTreeReq.u32(0).u32(2));
smbTreeReq.field('Session ID', '0x0000004100000009 (Session active)', () => smbTreeReq.u32(0x00000041).u32(0x00000009));
smbTreeReq.field('Structure Size', '9', () => smbTreeReq.u16(9));
smbTreeReq.field('Path Length', `${sharePath.length * 2} bytes (UTF-16LE)`, () => smbTreeReq.u16(sharePath.length * 2));
smbTreeReq.field('Share Path', sharePath, () => {
  for (let i = 0; i < sharePath.length; i++) {
    smbTreeReq.u16le(sharePath.charCodeAt(i));
  }
});

const tcpTreeReq = buildTcpSegment({
  srcPort: 54400,
  dstPort: 445,
  seq: 150,
  ack: 150,
  flags: { psh: true, ack: true },
  payloadLength: smbTreeReq.length,
});
const ipTreeReq = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: SMB_SERVER_IP, protocol: 6, payloadLength: tcpTreeReq.length + smbTreeReq.length });
const frameTreeReq = assembleLayers([ethNegReq, ipTreeReq, tcpTreeReq, smbTreeReq]);

// 4. SMB2 Tree Connect Response (Tree ID: 1)
const smbTreeResp = new PacketBuilder('smb2', 'SMB2 Tree Connect Response');
addNetBiosHeader(smbTreeResp, 64 + 16);
smbTreeResp.field('Protocol ID', '0xFE 53 4D 42 (SMB2)', () => smbTreeResp.raw([0xfe, 0x53, 0x4d, 0x42]), { heading: true });
smbTreeResp.field('NT Status', '0x00000000 (STATUS_SUCCESS)', () => smbTreeResp.u32(0));
smbTreeResp.field('Command', '0x0003 (TREE_CONNECT)', () => smbTreeResp.u16(0x0003));
smbTreeResp.field('Flags', '0x00000001 (Server Response)', () => smbTreeResp.u32(1));
smbTreeResp.field('Message ID', '2', () => smbTreeResp.u32(0).u32(2));
smbTreeResp.field('Tree ID', '0x00000001 (Share \\Projects monté)', () => smbTreeResp.u32(1));
smbTreeResp.field('Session ID', '0x0000004100000009', () => smbTreeResp.u32(0x00000041).u32(0x00000009));
smbTreeResp.field('Share Type', '0x01 (Physical Disk File System)', () => smbTreeResp.u8(1));
smbTreeResp.field('Maximal Access', '0x001F01FF (Lecture / Écriture / Suppression)', () => smbTreeResp.u32(0x001f01ff));

const tcpTreeResp = buildTcpSegment({
  srcPort: 445,
  dstPort: 54400,
  seq: 200,
  ack: 150 + smbTreeReq.length,
  flags: { psh: true, ack: true },
  payloadLength: smbTreeResp.length,
});
const ipTreeResp = buildIpv4Packet({ srcIp: SMB_SERVER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpTreeResp.length + smbTreeResp.length });
const frameTreeResp = assembleLayers([ethNegResp, ipTreeResp, tcpTreeResp, smbTreeResp]);

export const smbProtocol: ProtocolDefinition = {
  id: 'smb',
  name: 'SMB',
  title: 'Server Message Block v3 (Partage de Fichiers Windows)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'lan'],
  legend: [
    ['blue', 'Négociation Dialecte SMB 3.1.1'],
    ['amber', 'Montage Partage Réseau (Tree Connect)'],
    ['green', 'Accès Fichier & Opérations (Read / Write)'],
  ],
  overview: {
    full: 'Server Message Block version 3 (SMB 3.1.1 / CIFS)',
    description:
      'SMB est le protocole standard de partage de fichiers, imprimantes et canaux de communication sous Windows et dans les environnements professionnels (Samba sous Linux, serveurs NAS).',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'TCP (Port 445 direct, sans couche NetBIOS NetBT historique)'],
      ['Versions Modernes', 'SMB 2.1 (Windows 7), SMB 3.0 (Windows 8 / Chiffrement AES-CCM), SMB 3.1.1 (Windows 10/11 / Intégrité SHA-512)'],
      ['Sécurité', 'Signature obligatoire des paquets, chiffrement transparent de bout en bout et détection des attaques MITM.'],
    ],
  },
  steps: [
    {
      title: 'Négociation du Protocole (SMB2 NEGOTIATE Request)',
      desc: 'Le client propose sa liste de dialectes compatibles',
      detail:
        'Le poste de travail se connecte sur le port TCP 445 du serveur de fichiers et émet un paquet SMB2 NEGOTIATE listant les versions qu’il supporte (de SMB 2.0.2 jusqu’au moderne SMB 3.1.1).',
      facts: [
        ['Port', 'TCP 445 (Microsoft-DS)'],
        ['Dialectes proposés', 'SMB 2.0.2, 2.1, 3.0, 3.1.1'],
        ['En-tête NetBIOS', 'Longueur de trame 100 octets'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'lan',
          color: 'blue',
          label: 'SMB2 NEGOTIATE Req',
          row: {
            time: '0.000 ms',
            src: CLIENT_IP,
            dst: SMB_SERVER_IP,
            proto: 'SMB2',
            info: 'Negotiate Protocol Request (Dialects: 2.0.2, 2.1, 3.0, 3.1.1)',
            len: `${frameNegReq.bytes.length} o`,
            wire: frameNegReq,
          },
          wire: frameNegReq,
        },
      ],
    },
    {
      title: 'Sélection du Dialecte SMB 3.1.1 par le Serveur',
      desc: 'Le serveur accepte la version la plus sûre et la plus rapide',
      detail:
        'Le serveur répond en sélectionnant le dialecte SMB 3.1.1. Il attribue 64 crédits de flux au client et annonce ses capacités de chiffrement AES-128-GCM.',
      facts: [
        ['Dialecte choisi', '0x0311 (SMB 3.1.1)'],
        ['Crédits accordés', '64'],
        ['Sécurité', 'Intégrité SHA-512 et chiffrement AES-GCM'],
      ],
      events: [
        {
          type: 'packet',
          from: 'lan',
          to: 'client',
          color: 'blue',
          label: 'SMB2 NEGOTIATE Resp',
          row: {
            time: '3.400 ms',
            src: SMB_SERVER_IP,
            dst: CLIENT_IP,
            proto: 'SMB2',
            info: 'Negotiate Protocol Response (Selected Dialect: 0x0311, Credits: 64)',
            len: `${frameNegResp.bytes.length} o`,
            wire: frameNegResp,
          },
          wire: frameNegResp,
        },
      ],
    },
    {
      title: 'Connexion à l’Arborescence Réseau (TREE_CONNECT Request)',
      desc: 'Demande d’accès au partage partagé \\\\FILESERVER\\Projects',
      detail:
        'Une fois la session authentifiée (via Kerberos ou NTLMSSP), le client monte le répertoire partagé distant en envoyant son chemin réseau UNC codé en UTF-16LE.',
      facts: [
        ['Commande', 'TREE_CONNECT'],
        ['Chemin UNC', '\\\\FILESERVER\\Projects'],
        ['Encodage', 'Unicode UTF-16LE'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'lan',
          color: 'amber',
          label: 'TREE_CONNECT Req',
          row: {
            time: '8.200 ms',
            src: CLIENT_IP,
            dst: SMB_SERVER_IP,
            proto: 'SMB2',
            info: 'Tree Connect Request: \\\\FILESERVER\\Projects',
            len: `${frameTreeReq.bytes.length} o`,
            wire: frameTreeReq,
          },
          wire: frameTreeReq,
        },
      ],
    },
    {
      title: 'Validation de l’Arborescence (Tree ID: 1)',
      desc: 'Le serveur alloue le Tree ID et confirme les droits d’accès',
      detail:
        'Le serveur valide les permissions ACL du compte utilisateur et attribue le Tree ID 0x00000001 avec droits de lecture et écriture complets. Le lecteur réseau apparaît alors dans l’Explorateur de fichiers.',
      facts: [
        ['Tree ID alloué', '0x00000001'],
        ['Droits d’accès', 'Maximal Access: Full Read / Write'],
        ['Statut', 'STATUS_SUCCESS (0x00000000)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'lan',
          to: 'client',
          color: 'green',
          label: 'TREE_CONNECT OK',
          row: {
            time: '11.500 ms',
            src: SMB_SERVER_IP,
            dst: CLIENT_IP,
            proto: 'SMB2',
            info: 'Tree Connect Response (Tree ID: 1, Rights: Full Access)',
            len: `${frameTreeResp.bytes.length} o`,
            wire: frameTreeResp,
          },
          wire: frameTreeResp,
        },
      ],
    },
  ],
};
