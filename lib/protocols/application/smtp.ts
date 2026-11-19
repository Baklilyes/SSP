import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const CLIENT_IP = '192.168.1.100';
const MX_IP = '198.51.100.25'; // mail.example.com

// 1. SMTP 220 Server Banner
const banner = new PacketBuilder('smtp', 'SMTP 220 Service Ready');
banner.field('Server Greeting', '220 mx.example.com ESMTP Postfix', () =>
  banner.ascii('220 mx.example.com ESMTP Postfix (Ubuntu)\r\n')
);
const tcpBanner = buildTcpSegment({
  srcPort: 25,
  dstPort: 53100,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: banner.length,
});
const ipBanner = buildIpv4Packet({ srcIp: MX_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpBanner.length + banner.length });
const ethBanner = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameBanner = assembleLayers([ethBanner, ipBanner, tcpBanner, banner]);

// 2. SMTP EHLO & Response
const ehlo = new PacketBuilder('smtp', 'SMTP EHLO Command');
ehlo.field('Command', 'EHLO client.lan', () => ehlo.ascii('EHLO client.lan\r\n'));
const tcpEhlo = buildTcpSegment({
  srcPort: 53100,
  dstPort: 25,
  seq: 1,
  ack: 1 + banner.length,
  flags: { psh: true, ack: true },
  payloadLength: ehlo.length,
});
const ipEhlo = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: MX_IP, protocol: 6, payloadLength: tcpEhlo.length + ehlo.length });
const ethEhlo = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameEhlo = assembleLayers([ethEhlo, ipEhlo, tcpEhlo, ehlo]);

// 3. SMTP Envelope: MAIL FROM & RCPT TO
const mailFrom = new PacketBuilder('smtp', 'SMTP MAIL FROM & RCPT TO');
mailFrom.field('Sender (Reverse-Path)', 'MAIL FROM:<mohamed@company.com>', () =>
  mailFrom.ascii('MAIL FROM:<mohamed@company.com>\r\n')
);
mailFrom.field('Recipient (Forward-Path)', 'RCPT TO:<bob@example.com>', () =>
  mailFrom.ascii('RCPT TO:<bob@example.com>\r\n')
);
const tcpMail = buildTcpSegment({
  srcPort: 53100,
  dstPort: 25,
  seq: 1 + ehlo.length,
  ack: 200,
  flags: { psh: true, ack: true },
  payloadLength: mailFrom.length,
});
const ipMail = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: MX_IP, protocol: 6, payloadLength: tcpMail.length + mailFrom.length });
const frameMail = assembleLayers([ethEhlo, ipMail, tcpMail, mailFrom]);

// 4. SMTP DATA Payload (Headers + Body)
const dataBody = new PacketBuilder('smtp', 'SMTP DATA (Message Body)');
dataBody.field('DATA Command Header', 'DATA', () => dataBody.ascii('DATA\r\n'));
dataBody.field('RFC 5322 Headers', 'From / To / Subject / Date', () =>
  dataBody.ascii(
    'From: Mohamed Martin <mohamed@company.com>\r\n' +
    'To: Bob Dupont <bob@example.com>\r\n' +
    'Date: Mon, 17 Nov 2026 10:00:00 +0100\r\n' +
    'Subject: Compte-rendu Réunion Protocole\r\n' +
    'Message-ID: <202611171000@company.com>\r\n\r\n'
  )
);
dataBody.field('Message Text', 'Corps du courriel...', () =>
  dataBody.ascii('Bonjour Bob,\r\nVoici le rapport d’analyse des paquets réseau.\r\nCordialement.\r\n')
);
dataBody.field('End of Data Indicator', '<CR><LF>.<CR><LF>', () => dataBody.ascii('.\r\n'));
const tcpData = buildTcpSegment({
  srcPort: 53100,
  dstPort: 25,
  seq: 100,
  ack: 300,
  flags: { psh: true, ack: true },
  payloadLength: dataBody.length,
});
const ipData = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: MX_IP, protocol: 6, payloadLength: tcpData.length + dataBody.length });
const frameData = assembleLayers([ethEhlo, ipData, tcpData, dataBody]);

// 5. SMTP Queued Acknowledgement 250 OK
const ackOk = new PacketBuilder('smtp', 'SMTP 250 Message Queued');
ackOk.field('Queued Reply', '250 2.0.0 Ok: queued as 4X8qLk4', () =>
  ackOk.ascii('250 2.0.0 Ok: queued as 4X8qLk49Bzz\r\n')
);
const tcpAck = buildTcpSegment({
  srcPort: 25,
  dstPort: 53100,
  seq: 300,
  ack: 100 + dataBody.length,
  flags: { psh: true, ack: true },
  payloadLength: ackOk.length,
});
const ipAck = buildIpv4Packet({ srcIp: MX_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpAck.length + ackOk.length });
const frameAck = assembleLayers([ethBanner, ipAck, tcpAck, ackOk]);

export const smtpProtocol: ProtocolDefinition = {
  id: 'smtp',
  name: 'SMTP',
  title: 'Simple Mail Transfer Protocol (Envoi de Courriels)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet', 'mx'],
  legend: [
    ['blue', 'Commandes Enveloppe SMTP (EHLO / MAIL / RCPT)'],
    ['green', 'Transfert du Corps du Message (DATA)'],
    ['amber', 'Acquittement & Mise en File (250 OK)'],
  ],
  overview: {
    full: 'Simple Mail Transfer Protocol (RFC 5321 / RFC 5322)',
    description:
      'SMTP est le protocole standard d’acheminement du courrier électronique sur Internet. Il définit l’échange textuel entre le client émetteur (MUA) et le serveur de messagerie (MTA), ainsi que le routage de relais entre serveurs MX.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'TCP (Port 25 en inter-serveurs, Port 587 pour la soumission sécurisée)'],
      ['Format', 'Enveloppe SMTP (RFC 5321) + En-têtes MIME (RFC 5322)'],
      ['Fin de données', 'Marqueur unique séquence <CR><LF>.<CR><LF>'],
    ],
  },
  steps: [
    {
      title: 'Connexion TCP & Bannière d’Accueil 220 (Serveur MX -> Client)',
      desc: 'Le serveur de messagerie annonce sa disponibilité',
      detail:
        'Dès la poignée de main TCP à trois voies complétée, le serveur de courriels envoie sa ligne de bannière SMTP 220 indiquant son nom d’hôte FQDN.',
      facts: [
        ['Code réponse', '220'],
        ['Serveur', 'mx.example.com Postfix'],
      ],
      events: [
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'blue',
          label: '220 mx.example.com',
          row: {
            time: '18.200 ms',
            src: MX_IP,
            dst: CLIENT_IP,
            proto: 'SMTP',
            info: 'S: 220 mx.example.com ESMTP Postfix',
            len: `${frameBanner.bytes.length} o`,
            wire: frameBanner,
          },
          wire: frameBanner,
        },
      ],
    },
    {
      title: 'Négociation EHLO (Client -> Serveur MX)',
      desc: 'Annonce des capacités ESMTP du client',
      detail:
        'Le client salue le serveur avec la commande EHLO (Extended HELO) pour découvrir les extensions prises en charge (STARTTLS, PIPELINING, SIZE max).',
      facts: [
        ['Commande', 'EHLO client.lan'],
        ['Objectif', 'Découverte des extensions ESMTP'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'blue',
          label: 'EHLO client.lan',
          row: {
            time: '20.100 ms',
            src: CLIENT_IP,
            dst: MX_IP,
            proto: 'SMTP',
            info: 'C: EHLO client.lan',
            len: `${frameEhlo.bytes.length} o`,
            wire: frameEhlo,
          },
          wire: frameEhlo,
        },
      ],
    },
    {
      title: 'Enveloppe de Routage : MAIL FROM & RCPT TO',
      desc: 'Définition de l’expéditeur et du destinataire réel',
      detail:
        'Le client spécifie l’enveloppe de routage : MAIL FROM pour le retour d’erreur (bounce address) et RCPT TO pour l’adresse du destinataire visé.',
      facts: [
        ['MAIL FROM', '<mohamed@company.com>'],
        ['RCPT TO', '<bob@example.com>'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'blue',
          label: 'MAIL FROM / RCPT TO',
          row: {
            time: '35.400 ms',
            src: CLIENT_IP,
            dst: MX_IP,
            proto: 'SMTP',
            info: 'C: MAIL FROM:<mohamed@company.com> | RCPT TO:<bob@example.com>',
            len: `${frameMail.bytes.length} o`,
            wire: frameMail,
          },
          wire: frameMail,
        },
      ],
    },
    {
      title: 'Transmission du Contenu (Commande DATA)',
      desc: 'En-têtes RFC 5322, Sujet et Corps du message',
      detail:
        'Le client envoie DATA suivi de tous les en-têtes (Subject, From, To, Date) et du corps textuel, puis termine impérativement par une ligne contenant uniquement un point ".".',
      facts: [
        ['Commande', 'DATA'],
        ['Sujet', 'Compte-rendu Réunion Protocole'],
        ['Délimiteur fin', '<CR><LF>.<CR><LF>'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'mx',
          color: 'green',
          label: 'DATA (Corps de mail)',
          row: {
            time: '52.000 ms',
            src: CLIENT_IP,
            dst: MX_IP,
            proto: 'SMTP',
            info: 'C: DATA (248 octets de message terminés par .)',
            len: `${frameData.bytes.length} o`,
            wire: frameData,
          },
          wire: frameData,
        },
      ],
    },
    {
      title: 'Confirmation de Prise en Charge (250 Queued)',
      desc: 'Le serveur stocke le courriel dans sa file d’attente',
      detail:
        'Le serveur valide la réception intégrale du message, lui attribue un identifiant de file (Queue ID) et envoie le code 250 OK.',
      facts: [
        ['Code', '250 2.0.0 Ok'],
        ['Queue ID', '4X8qLk49Bzz'],
      ],
      events: [
        {
          type: 'packet',
          from: 'mx',
          to: 'client',
          color: 'amber',
          label: '250 Queued OK',
          row: {
            time: '68.900 ms',
            src: MX_IP,
            dst: CLIENT_IP,
            proto: 'SMTP',
            info: 'S: 250 2.0.0 Ok: queued as 4X8qLk49Bzz',
            len: `${frameAck.bytes.length} o`,
            wire: frameAck,
          },
          wire: frameAck,
        },
      ],
    },
  ],
};
