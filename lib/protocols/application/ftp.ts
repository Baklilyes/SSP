import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const CLIENT_IP = '192.168.1.100';
const FTP_IP = '198.51.100.10'; // ftp.example.com

// 1. FTP Server 220 Banner (Control Channel, Port 21)
const banner = new PacketBuilder('ftp', 'FTP 220 Control Banner');
banner.field('Greeting', '220 ProFTPD 1.3.6 Server Ready', () =>
  banner.ascii('220 ProFTPD 1.3.6 Server (Public Archive) ready.\r\n')
);
const tcpBanner = buildTcpSegment({
  srcPort: 21,
  dstPort: 51200,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: banner.length,
});
const ipBanner = buildIpv4Packet({ srcIp: FTP_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpBanner.length + banner.length });
const ethBanner = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameBanner = assembleLayers([ethBanner, ipBanner, tcpBanner, banner]);

// 2. Client PASV Request (Passive Mode)
const pasvReq = new PacketBuilder('ftp', 'FTP PASV Mode Request');
pasvReq.field('Command', 'PASV', () => pasvReq.ascii('PASV\r\n'));
const tcpPasvReq = buildTcpSegment({
  srcPort: 51200,
  dstPort: 21,
  seq: 50,
  ack: 1 + banner.length,
  flags: { psh: true, ack: true },
  payloadLength: pasvReq.length,
});
const ipPasvReq = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: FTP_IP, protocol: 6, payloadLength: tcpPasvReq.length + pasvReq.length });
const ethClient = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const framePasvReq = assembleLayers([ethClient, ipPasvReq, tcpPasvReq, pasvReq]);

// 3. Server 227 Entering Passive Mode (IP + Port 50000)
const pasvResp = new PacketBuilder('ftp', 'FTP 227 Passive Mode Ephemeral Port');
pasvResp.field('Passive Port IP', '227 Entering Passive Mode (198,51,100,10,195,80)', () =>
  pasvResp.ascii('227 Entering Passive Mode (198,51,100,10,195,80).\r\n')
);
const tcpPasvResp = buildTcpSegment({
  srcPort: 21,
  dstPort: 51200,
  seq: 1 + banner.length,
  ack: 50 + pasvReq.length,
  flags: { psh: true, ack: true },
  payloadLength: pasvResp.length,
});
const ipPasvResp = buildIpv4Packet({ srcIp: FTP_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpPasvResp.length + pasvResp.length });
const framePasvResp = assembleLayers([ethBanner, ipPasvResp, tcpPasvResp, pasvResp]);

// 4. Client RETR file.pdf (Control Channel)
const retrReq = new PacketBuilder('ftp', 'FTP RETR Command');
retrReq.field('File Request', 'RETR document.pdf', () => retrReq.ascii('RETR document.pdf\r\n'));
const tcpRetr = buildTcpSegment({
  srcPort: 51200,
  dstPort: 21,
  seq: 50 + pasvReq.length,
  ack: 1 + banner.length + pasvResp.length,
  flags: { psh: true, ack: true },
  payloadLength: retrReq.length,
});
const ipRetr = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: FTP_IP, protocol: 6, payloadLength: tcpRetr.length + retrReq.length });
const frameRetr = assembleLayers([ethClient, ipRetr, tcpRetr, retrReq]);

// 5. Data Channel Stream (Port 50000 Data Transfer)
const dataPayload = new PacketBuilder('ftp-data', 'FTP-DATA Binary Payload');
dataPayload.field('Magic Bytes', '%PDF-1.7 Header', () => dataPayload.ascii('%PDF-1.7\r\n%âãÏÓ\r\n'));
dataPayload.field('Binary Chunk', '256 bytes stream data', () => dataPayload.unknown(256), {
  note: 'Canal de données dédié distinct du canal de commandes',
});
const tcpData = buildTcpSegment({
  srcPort: 50000,
  dstPort: 51202,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: dataPayload.length,
});
const ipData = buildIpv4Packet({ srcIp: FTP_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpData.length + dataPayload.length });
const frameData = assembleLayers([ethBanner, ipData, tcpData, dataPayload]);

export const ftpProtocol: ProtocolDefinition = {
  id: 'ftp',
  name: 'FTP',
  title: 'File Transfer Protocol (Canal Contrôle & Données Séparés)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet', 'web'],
  legend: [
    ['blue', 'Canal de Contrôle (Commandes TCP 21)'],
    ['amber', 'Négociation Mode Passif (PASV)'],
    ['green', 'Canal de Données Dédié (TCP 50000)'],
  ],
  overview: {
    full: 'File Transfer Protocol (RFC 959)',
    description:
      'FTP est l’un des plus anciens protocoles de transfert de fichiers d’Internet. Sa caractéristique architecturale majeure est l’utilisation de deux connexions TCP indépendantes : une connexion permanente de contrôle (port 21) et une connexion éphémère de données (port 20 ou port négocié en mode PASV).',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Canal de Contrôle', 'TCP Port 21 (Commandes ASCII : USER, PASS, PASV, RETR)'],
      ['Canal de Données', 'TCP Port éphémère (Mode Passif PASV) ou TCP 20 (Mode Actif PORT)'],
      ['Problématique NAT', 'Le mode Passif a été inventé pour permettre aux clients derrière un routeur NAT d’initier eux-mêmes la connexion de données sortante.'],
    ],
  },
  steps: [
    {
      title: 'Ouverture du Canal de Contrôle (TCP Port 21)',
      desc: 'Établissement de la session de pilotage et réception de la bannière',
      detail:
        'Le client ouvre une socket TCP vers le port 21 du serveur. Le serveur FTP renvoie le code 220 avec sa version.',
      facts: [
        ['Port de Contrôle', 'TCP 21'],
        ['Bannière', '220 ProFTPD ready'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'blue',
          label: 'FTP 220 Banner',
          row: {
            time: '14.000 ms',
            src: FTP_IP,
            dst: CLIENT_IP,
            proto: 'FTP',
            info: 'S: 220 ProFTPD 1.3.6 Server ready',
            len: `${frameBanner.bytes.length} o`,
            wire: frameBanner,
          },
          wire: frameBanner,
        },
      ],
    },
    {
      title: 'Négociation du Mode Passif (PASV)',
      desc: 'Le client demande au serveur d’ouvrir un port d’écoute éphémère',
      detail:
        'Pour éviter que le pare-feu ou le NAT du client ne bloque la connexion de données entrante (mode Actif historique), le client émet la commande PASV. Le serveur répond par le code 227 contenant une adresse IP et un port (ici (198,51,100,10,195,80) => Port = 195 * 256 + 80 = 50000).',
      facts: [
        ['Commande', 'PASV'],
        ['Réponse 227', 'Port calculé : 195 * 256 + 80 = 50000'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'PASV Request',
          row: {
            time: '25.000 ms',
            src: CLIENT_IP,
            dst: FTP_IP,
            proto: 'FTP',
            info: 'C: PASV',
            len: `${framePasvReq.bytes.length} o`,
            wire: framePasvReq,
          },
          wire: framePasvReq,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'amber',
          label: '227 Entering Passive',
          row: {
            time: '38.200 ms',
            src: FTP_IP,
            dst: CLIENT_IP,
            proto: 'FTP',
            info: 'S: 227 Entering Passive Mode (198,51,100,10,195,80)',
            len: `${framePasvResp.bytes.length} o`,
            wire: framePasvResp,
          },
          wire: framePasvResp,
        },
      ],
    },
    {
      title: 'Ordre de Transfert (RETR) sur le Canal de Contrôle',
      desc: 'Demande de téléchargement du fichier cible',
      detail:
        'Le client demande le fichier "document.pdf". Dès réception, le serveur commence l’émission sur la seconde socket TCP (port 50000).',
      facts: [
        ['Commande', 'RETR document.pdf'],
        ['Socket de données', 'Port 50000'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'blue',
          label: 'RETR document.pdf',
          row: {
            time: '48.100 ms',
            src: CLIENT_IP,
            dst: FTP_IP,
            proto: 'FTP',
            info: 'C: RETR document.pdf',
            len: `${frameRetr.bytes.length} o`,
            wire: frameRetr,
          },
          wire: frameRetr,
        },
      ],
    },
    {
      title: 'Flux Binaire sur le Canal de Données (FTP-DATA Port 50000)',
      desc: 'Transmission pure du contenu sans pollution d’en-têtes de contrôle',
      detail:
        'Le flux du fichier transite de manière brute et efficace sur la seconde connexion TCP dédiée. Une fois le transfert terminé, le canal de données est fermé et le serveur confirme la fin sur le port 21 (226 Transfer complete).',
      facts: [
        ['Protocole', 'FTP-DATA'],
        ['Format', 'Flux binaire pur (PDF Header %PDF-1.7)'],
        ['Séparation', 'Aucune interférence avec le canal de commande'],
      ],
      events: [
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'FTP-DATA (PDF)',
          row: {
            time: '62.000 ms',
            src: FTP_IP,
            dst: CLIENT_IP,
            proto: 'FTP-DATA',
            info: 'S -> C: Flux données binaire (%PDF-1.7 ...)',
            len: `${frameData.bytes.length} o`,
            wire: frameData,
          },
          wire: frameData,
        },
      ],
    },
  ],
};
