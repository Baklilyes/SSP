import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const CLIENT_IP = '192.168.1.100';
const POP3_IP = '198.51.100.25'; // mail.example.com

// 1. POP3 Server Banner
const popBanner = new PacketBuilder('pop3', 'POP3 +OK Banner');
popBanner.field('Status Indicator', '+OK', () => popBanner.ascii('+OK POP3 server ready <1942.9982@mail.example.com>\r\n'));
const tcpBanner = buildTcpSegment({
  srcPort: 110,
  dstPort: 54200,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: popBanner.length,
});
const ipBanner = buildIpv4Packet({ srcIp: POP3_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpBanner.length + popBanner.length });
const ethBanner = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameBanner = assembleLayers([ethBanner, ipBanner, tcpBanner, popBanner]);

// 2. Client USER & PASS
const auth = new PacketBuilder('pop3', 'POP3 USER & PASS Authentication');
auth.field('Command USER', 'USER mohamed', () => auth.ascii('USER mohamed\r\n'));
auth.field('Command PASS', 'PASS *******', () => auth.ascii('PASS s3cr3tKey\r\n'));
const tcpAuth = buildTcpSegment({
  srcPort: 54200,
  dstPort: 110,
  seq: 1,
  ack: 1 + popBanner.length,
  flags: { psh: true, ack: true },
  payloadLength: auth.length,
});
const ipAuth = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: POP3_IP, protocol: 6, payloadLength: tcpAuth.length + auth.length });
const ethAuth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameAuth = assembleLayers([ethAuth, ipAuth, tcpAuth, auth]);

// 3. Server +OK Auth Granted & STAT Response
const statResp = new PacketBuilder('pop3', 'POP3 +OK Mailbox Status');
statResp.field('Auth Response', '+OK Mailbox open', () => statResp.ascii('+OK Mailbox open, 2 messages (3200 octets)\r\n'));
const tcpStat = buildTcpSegment({
  srcPort: 110,
  dstPort: 54200,
  seq: 100,
  ack: 1 + auth.length,
  flags: { psh: true, ack: true },
  payloadLength: statResp.length,
});
const ipStat = buildIpv4Packet({ srcIp: POP3_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpStat.length + statResp.length });
const frameStat = assembleLayers([ethBanner, ipStat, tcpStat, statResp]);

// 4. Client RETR 1 (Retrieve Message)
const retr = new PacketBuilder('pop3', 'POP3 RETR 1 (Download Mail)');
retr.field('Command', 'RETR 1', () => retr.ascii('RETR 1\r\n'));
const tcpRetr = buildTcpSegment({
  srcPort: 54200,
  dstPort: 110,
  seq: 1 + auth.length,
  ack: 100 + statResp.length,
  flags: { psh: true, ack: true },
  payloadLength: retr.length,
});
const ipRetr = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: POP3_IP, protocol: 6, payloadLength: tcpRetr.length + retr.length });
const frameRetr = assembleLayers([ethAuth, ipRetr, tcpRetr, retr]);

// 5. Server Message Payload
const mailMsg = new PacketBuilder('pop3', 'POP3 +OK Message Content');
mailMsg.field('Status Line', '+OK 1540 octets', () =>
  mailMsg.ascii(
    '+OK 1540 octets\r\n' +
    'From: Direction <direction@example.com>\r\n' +
    'To: Mohamed <mohamed@company.com>\r\n' +
    'Subject: Validation de livraison\r\n' +
    'Date: Mon, 17 Nov 2026 09:30:00 +0100\r\n\r\n' +
    'Bonjour Mohamed,\r\n' +
    'Tous les livrables réseau ont été approuvés.\r\n' +
    '.\r\n'
  )
);
const tcpMail = buildTcpSegment({
  srcPort: 110,
  dstPort: 54200,
  seq: 200,
  ack: 1 + auth.length + retr.length,
  flags: { psh: true, ack: true },
  payloadLength: mailMsg.length,
});
const ipMail = buildIpv4Packet({ srcIp: POP3_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpMail.length + mailMsg.length });
const frameMail = assembleLayers([ethBanner, ipMail, tcpMail, mailMsg]);

export const pop3Protocol: ProtocolDefinition = {
  id: 'pop3',
  name: 'POP3',
  title: 'Post Office Protocol v3 (Relève Simple de Courriel)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet', 'mx'],
  legend: [
    ['blue', 'Authentification & Commandes (USER, PASS, RETR)'],
    ['green', 'Téléchargement du Courriel (+OK Content)'],
  ],
  overview: {
    full: 'Post Office Protocol version 3 (RFC 1939)',
    description:
      'POP3 est un protocole historique de relève de courriel conçu pour rapatrier les messages depuis un serveur distant vers le disque local de l’ordinateur client.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'TCP (Port 110 en clair, Port 995 POP3S avec TLS)'],
      ['Modèle', 'Téléchargement direct (Download and Delete ou Keep)'],
      ['Réponses', 'Préfixe explicite +OK ou -ERR'],
    ],
  },
  steps: [
    {
      title: 'Bannière d’Accueil Serveur (+OK)',
      desc: 'Le serveur POP3 signale qu’il est prêt à recevoir des commandes',
      detail:
        'Après établissement de la connexion TCP port 110, le serveur envoie la bannière initiale de salutation avec un identifiant de session unique.',
      facts: [
        ['Statut', '+OK POP3 server ready'],
        ['Port', 'TCP 110'],
      ],
      events: [
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'blue',
          label: '+OK Banner',
          row: {
            time: '12.000 ms',
            src: POP3_IP,
            dst: CLIENT_IP,
            proto: 'POP3',
            info: 'S: +OK POP3 server ready <1942.9982@mail.example.com>',
            len: `${frameBanner.bytes.length} o`,
            wire: frameBanner,
          },
          wire: frameBanner,
        },
      ],
    },
    {
      title: 'Authentification Client (USER / PASS)',
      desc: 'Envoi des identifiants de la boîte aux lettres',
      detail:
        'Le client transmet le nom d’utilisateur (USER mohamed) suivi du mot de passe (PASS s3cr3tKey). En POP3 non chiffré, ces données transitent en texte clair.',
      facts: [
        ['Utilisateur', 'mohamed'],
        ['État', 'AUTHORIZATION'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'blue',
          label: 'USER / PASS',
          row: {
            time: '18.400 ms',
            src: CLIENT_IP,
            dst: POP3_IP,
            proto: 'POP3',
            info: 'C: USER mohamed | PASS ********',
            len: `${frameAuth.bytes.length} o`,
            wire: frameAuth,
          },
          wire: frameAuth,
        },
      ],
    },
    {
      title: 'Ouverture de Boîte & Statut (+OK Mailbox)',
      desc: 'Le serveur valide les identifiants et verrouille la boîte (Lock)',
      detail:
        'Le serveur passe à l’état TRANSACTION. Il retourne le nombre total de messages en attente et leur taille cumulée.',
      facts: [
        ['Messages', '2 messages en attente'],
        ['Taille totale', '3200 octets'],
      ],
      events: [
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'green',
          label: '+OK Mailbox',
          row: {
            time: '24.100 ms',
            src: POP3_IP,
            dst: CLIENT_IP,
            proto: 'POP3',
            info: 'S: +OK Mailbox open, 2 messages (3200 octets)',
            len: `${frameStat.bytes.length} o`,
            wire: frameStat,
          },
          wire: frameStat,
        },
      ],
    },
    {
      title: 'Demande de Téléchargement du Message 1 (RETR 1)',
      desc: 'Le client ordonne l’extraction du premier courriel',
      detail: 'La commande RETR 1 demande au serveur de renvoyer l’intégralité du message indexé par le numéro 1.',
      facts: [
        ['Commande', 'RETR 1'],
        ['Action', 'Extraction message #1'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'blue',
          label: 'RETR 1',
          row: {
            time: '32.000 ms',
            src: CLIENT_IP,
            dst: POP3_IP,
            proto: 'POP3',
            info: 'C: RETR 1',
            len: `${frameRetr.bytes.length} o`,
            wire: frameRetr,
          },
          wire: frameRetr,
        },
      ],
    },
    {
      title: 'Réception du Contenu Intégral du Message',
      desc: 'Flux du message terminé par le délimiteur point "."',
      detail:
        'Le serveur transmet les en-têtes RFC 5322, le sujet, le corps du message et conclut par un point final isolé.',
      facts: [
        ['Sujet', 'Validation de livraison'],
        ['Statut', 'Message stocké localement sur le client'],
      ],
      events: [
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'green',
          label: '+OK Message Content',
          row: {
            time: '45.800 ms',
            src: POP3_IP,
            dst: CLIENT_IP,
            proto: 'POP3',
            info: 'S: +OK 1540 octets (Contenu reçu terminé par .)',
            len: `${frameMail.bytes.length} o`,
            wire: frameMail,
          },
          wire: frameMail,
        },
      ],
    },
  ],
};
