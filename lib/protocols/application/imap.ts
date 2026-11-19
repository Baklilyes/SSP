import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const CLIENT_IP = '192.168.1.100';
const IMAP_IP = '198.51.100.25'; // mail.example.com

// 1. IMAP4rev1 Server Greeting
const banner = new PacketBuilder('imap', 'IMAP * OK Greeting');
banner.field('Untagged Greeting', '* OK IMAP4rev1 Server Ready', () =>
  banner.ascii('* OK [CAPABILITY IMAP4rev1 SASL-IR LITERAL+ ID ENABLE] Dovecot ready.\r\n')
);
const tcpBanner = buildTcpSegment({
  srcPort: 143,
  dstPort: 54300,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: banner.length,
});
const ipBanner = buildIpv4Packet({ srcIp: IMAP_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpBanner.length + banner.length });
const ethBanner = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameBanner = assembleLayers([ethBanner, ipBanner, tcpBanner, banner]);

// 2. Tagged LOGIN Command (Client)
const login = new PacketBuilder('imap', 'IMAP A01 LOGIN Command');
login.field('Tagged Command', 'A01 LOGIN mohamed *******', () => login.ascii('A01 LOGIN mohamed s3cr3tPass\r\n'));
const tcpLogin = buildTcpSegment({
  srcPort: 54300,
  dstPort: 143,
  seq: 1,
  ack: 1 + banner.length,
  flags: { psh: true, ack: true },
  payloadLength: login.length,
});
const ipLogin = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: IMAP_IP, protocol: 6, payloadLength: tcpLogin.length + login.length });
const ethLogin = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameLogin = assembleLayers([ethLogin, ipLogin, tcpLogin, login]);

// 3. Tagged LOGIN Response OK (Server)
const loginOk = new PacketBuilder('imap', 'IMAP A01 OK Logged in');
loginOk.field('Tagged Response', 'A01 OK Logged in', () =>
  loginOk.ascii('A01 OK [CAPABILITY IMAP4rev1 SORT SEARCH] Logged in successfully\r\n')
);
const tcpLoginOk = buildTcpSegment({
  srcPort: 143,
  dstPort: 54300,
  seq: 100,
  ack: 1 + login.length,
  flags: { psh: true, ack: true },
  payloadLength: loginOk.length,
});
const ipLoginOk = buildIpv4Packet({ srcIp: IMAP_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpLoginOk.length + loginOk.length });
const frameLoginOk = assembleLayers([ethBanner, ipLoginOk, tcpLoginOk, loginOk]);

// 4. Tagged SELECT INBOX (Client)
const select = new PacketBuilder('imap', 'IMAP A02 SELECT INBOX');
select.field('Tagged Command', 'A02 SELECT INBOX', () => select.ascii('A02 SELECT INBOX\r\n'));
const tcpSelect = buildTcpSegment({
  srcPort: 54300,
  dstPort: 143,
  seq: 1 + login.length,
  ack: 100 + loginOk.length,
  flags: { psh: true, ack: true },
  payloadLength: select.length,
});
const ipSelect = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: IMAP_IP, protocol: 6, payloadLength: tcpSelect.length + select.length });
const frameSelect = assembleLayers([ethLogin, ipSelect, tcpSelect, select]);

// 5. SELECT Response with Mailbox Metadata (Server)
const selectResp = new PacketBuilder('imap', 'IMAP A02 OK Mailbox Details');
selectResp.field('Untagged Count', '* 142 EXISTS, * 3 RECENT', () =>
  selectResp.ascii('* 142 EXISTS\r\n* 3 RECENT\r\n* OK [UNSEEN 12] Message 131 is first unseen\r\n')
);
selectResp.field('Folder Capabilities', 'FLAGS (\\Answered \\Flagged \\Seen)', () =>
  selectResp.ascii('* FLAGS (\\Answered \\Flagged \\Deleted \\Seen \\Draft)\r\n')
);
selectResp.field('Tagged Completion', 'A02 OK [READ-WRITE] SELECT completed', () =>
  selectResp.ascii('A02 OK [READ-WRITE] SELECT completed\r\n')
);
const tcpSelectResp = buildTcpSegment({
  srcPort: 143,
  dstPort: 54300,
  seq: 200,
  ack: 1 + login.length + select.length,
  flags: { psh: true, ack: true },
  payloadLength: selectResp.length,
});
const ipSelectResp = buildIpv4Packet({ srcIp: IMAP_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpSelectResp.length + selectResp.length });
const frameSelectResp = assembleLayers([ethBanner, ipSelectResp, tcpSelectResp, selectResp]);

// 6. Selective Header FETCH (Client)
const fetch = new PacketBuilder('imap', 'IMAP A03 FETCH Header Request');
fetch.field('Command', 'A03 FETCH 142 (FLAGS BODY[HEADER.FIELDS ...])', () =>
  fetch.ascii('A03 FETCH 142 (FLAGS BODY.PEEK[HEADER.FIELDS (SUBJECT FROM DATE)])\r\n')
);
const tcpFetch = buildTcpSegment({
  srcPort: 54300,
  dstPort: 143,
  seq: 1 + login.length + select.length,
  ack: 200 + selectResp.length,
  flags: { psh: true, ack: true },
  payloadLength: fetch.length,
});
const ipFetch = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: IMAP_IP, protocol: 6, payloadLength: tcpFetch.length + fetch.length });
const frameFetch = assembleLayers([ethLogin, ipFetch, tcpFetch, fetch]);

// 7. FETCH Response with Partial Metadata (Server)
const fetchResp = new PacketBuilder('imap', 'IMAP A03 OK Partial Headers');
fetchResp.field('Untagged Fetch Data', '* 142 FETCH Data', () =>
  fetchResp.ascii(
    '* 142 FETCH (FLAGS (\\Seen) BODY[HEADER.FIELDS (SUBJECT FROM DATE)] {95}\r\n' +
    'Subject: Déploiement v2.0 Réussi\r\n' +
    'From: DevOps <devops@cloud.com>\r\n' +
    'Date: Mon, 17 Nov 2026 10:15:00 +0100\r\n\r\n' +
    ')\r\n' +
    'A03 OK FETCH completed\r\n'
  )
);
const tcpFetchResp = buildTcpSegment({
  srcPort: 143,
  dstPort: 54300,
  seq: 300,
  ack: 1 + login.length + select.length + fetch.length,
  flags: { psh: true, ack: true },
  payloadLength: fetchResp.length,
});
const ipFetchResp = buildIpv4Packet({ srcIp: IMAP_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpFetchResp.length + fetchResp.length });
const frameFetchResp = assembleLayers([ethBanner, ipFetchResp, tcpFetchResp, fetchResp]);

export const imapProtocol: ProtocolDefinition = {
  id: 'imap',
  name: 'IMAP',
  title: 'Internet Message Access Protocol (Synchronisation Multi-Appareils)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet', 'mx'],
  legend: [
    ['blue', 'Commandes Étiquetées (A01 LOGIN, A02 SELECT)'],
    ['green', 'Réponses Non Étiquetées (*) & Statuts (Axx OK)'],
  ],
  overview: {
    full: 'Internet Message Access Protocol version 4rev1 (RFC 3501)',
    description:
      'IMAP permet aux utilisateurs de gérer leurs boîtes courriels directement sur le serveur. Les dossiers, drapeaux de lecture (\\Seen), brouillons et messages restent synchronisés en temps réel entre tous les ordinateurs et smartphones connectés.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'TCP (Port 143 en clair avec STARTTLS, Port 993 IMAPS)'],
      ['Architecture', 'Commandes étiquetées par un préfixe unique (A01, A02...)'],
      ['Synchronisation', 'Dossiers multiples, drapeaux d’état, téléchargement partiel des en-têtes sans le corps'],
    ],
  },
  steps: [
    {
      title: 'Bannière Initiale Non Étiquetée (* OK)',
      desc: 'Le serveur IMAP annonce ses extensions et sa disponibilité',
      detail:
        'Le serveur envoie une ligne préfixée par une étoile "*" (untagged) énumérant les capacités du démon IMAP (LITERAL+, SASL, IDLE).',
      facts: [
        ['Préfixe', '* OK (Non étiqueté)'],
        ['Capacités', 'IMAP4rev1, LITERAL+, ENABLE'],
      ],
      events: [
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'blue',
          label: '* OK Dovecot',
          row: {
            time: '15.000 ms',
            src: IMAP_IP,
            dst: CLIENT_IP,
            proto: 'IMAP',
            info: 'S: * OK [CAPABILITY IMAP4rev1 ...] Dovecot ready.',
            len: `${frameBanner.bytes.length} o`,
            wire: frameBanner,
          },
          wire: frameBanner,
        },
      ],
    },
    {
      title: 'Authentification Étiquetée (A01 LOGIN)',
      desc: 'Le client envoie un identifiant de commande et les accès',
      detail:
        'Toutes les commandes IMAP du client débutent par une étiquette alphanumérique (ex: A01). Le serveur répondra avec la même étiquette une fois l’opération achevée.',
      facts: [
        ['Étiquette', 'A01'],
        ['Commande', 'LOGIN mohamed *******'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'blue',
          label: 'A01 LOGIN',
          row: {
            time: '22.400 ms',
            src: CLIENT_IP,
            dst: IMAP_IP,
            proto: 'IMAP',
            info: 'C: A01 LOGIN mohamed *******',
            len: `${frameLogin.bytes.length} o`,
            wire: frameLogin,
          },
          wire: frameLogin,
        },
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'green',
          label: 'A01 OK Logged in',
          row: {
            time: '34.100 ms',
            src: IMAP_IP,
            dst: CLIENT_IP,
            proto: 'IMAP',
            info: 'S: A01 OK Logged in successfully',
            len: `${frameLoginOk.bytes.length} o`,
            wire: frameLoginOk,
          },
          wire: frameLoginOk,
        },
      ],
    },
    {
      title: 'Sélection du Dossier INBOX (A02 SELECT)',
      desc: 'Ouverture du dossier et inspection des statistiques',
      detail:
        'Le client sélectionne le dossier principal INBOX. Le serveur retourne en temps réel le nombre total d’emails (142 EXISTS) et les messages non lus ([UNSEEN 12]).',
      facts: [
        ['Dossier', 'INBOX'],
        ['Total messages', '142 EXISTS'],
        ['Nouveaux non lus', '12 UNSEEN'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'blue',
          label: 'A02 SELECT INBOX',
          row: {
            time: '42.000 ms',
            src: CLIENT_IP,
            dst: IMAP_IP,
            proto: 'IMAP',
            info: 'C: A02 SELECT INBOX',
            len: `${frameSelect.bytes.length} o`,
            wire: frameSelect,
          },
          wire: frameSelect,
        },
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'green',
          label: 'A02 OK Metadata',
          row: {
            time: '56.300 ms',
            src: IMAP_IP,
            dst: CLIENT_IP,
            proto: 'IMAP',
            info: 'S: * 142 EXISTS | * OK [UNSEEN 12] | A02 OK SELECT completed',
            len: `${frameSelectResp.bytes.length} o`,
            wire: frameSelectResp,
          },
          wire: frameSelectResp,
        },
      ],
    },
    {
      title: 'Extraction Sélective des Métadonnées (A03 FETCH)',
      desc: 'Récupération économe sans télécharger les pièces jointes lourdes',
      detail:
        'Contrairement à POP3, IMAP permet d’extraire uniquement les en-têtes choisis (Objet, Expéditeur, Date) sans charger le corps du mail ni les pièces jointes volumineuses.',
      facts: [
        ['Message #', '142'],
        ['Champs demandés', 'SUBJECT, FROM, DATE'],
        ['Économie bande passante', '> 98% par rapport au téléchargement intégral'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'blue',
          label: 'A03 FETCH Header',
          row: {
            time: '64.500 ms',
            src: CLIENT_IP,
            dst: IMAP_IP,
            proto: 'IMAP',
            info: 'C: A03 FETCH 142 (FLAGS BODY.PEEK[HEADER.FIELDS ...])',
            len: `${frameFetch.bytes.length} o`,
            wire: frameFetch,
          },
          wire: frameFetch,
        },
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'green',
          label: 'A03 OK Headers',
          row: {
            time: '78.200 ms',
            src: IMAP_IP,
            dst: CLIENT_IP,
            proto: 'IMAP',
            info: 'S: * 142 FETCH (FLAGS (\\Seen) ...) | A03 OK FETCH completed',
            len: `${frameFetchResp.bytes.length} o`,
            wire: frameFetchResp,
          },
          wire: frameFetchResp,
        },
      ],
    },
  ],
};
