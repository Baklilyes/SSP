import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:11:22:33:44:55';
const CLIENT_IP = '192.168.1.100';
const SOCKS_SERVER_IP = '198.51.100.80'; // SOCKS5 Proxy Server
const TARGET_IP = '93.184.216.34'; // example.com

// 1. SOCKS5 Method Negotiation (Client -> Proxy)
const sockMethodReq = new PacketBuilder('socks5', 'SOCKS5 Method Negotiation Request');
sockMethodReq.field('Version', '0x05 (SOCKS5)', () => sockMethodReq.u8(0x05), { heading: true });
sockMethodReq.field('Number of Methods', '1 method', () => sockMethodReq.u8(1));
sockMethodReq.field('Methods', '0x00 (NO AUTHENTICATION REQUIRED)', () => sockMethodReq.u8(0x00));

const tcpMethodReq = buildTcpSegment({
  srcPort: 54600,
  dstPort: 1080,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: sockMethodReq.length,
});
const ipMethodReq = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: SOCKS_SERVER_IP, protocol: 6, payloadLength: tcpMethodReq.length + sockMethodReq.length });
const ethClient = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const frameMethodReq = assembleLayers([ethClient, ipMethodReq, tcpMethodReq, sockMethodReq]);

// 2. SOCKS5 Method Negotiation (Proxy -> Client)
const sockMethodResp = new PacketBuilder('socks5', 'SOCKS5 Method Negotiation Response');
sockMethodResp.field('Version', '0x05 (SOCKS5)', () => sockMethodResp.u8(0x05), { heading: true });
sockMethodResp.field('Chosen Method', '0x00 (NO AUTHENTICATION ACCEPTED)', () => sockMethodResp.u8(0x00));

const tcpMethodResp = buildTcpSegment({
  srcPort: 1080,
  dstPort: 54600,
  seq: 1,
  ack: 1 + sockMethodReq.length,
  flags: { psh: true, ack: true },
  payloadLength: sockMethodResp.length,
});
const ipMethodResp = buildIpv4Packet({ srcIp: SOCKS_SERVER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpMethodResp.length + sockMethodResp.length });
const ethServer = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frameMethodResp = assembleLayers([ethServer, ipMethodResp, tcpMethodResp, sockMethodResp]);

// 3. SOCKS5 CONNECT Request (Client -> Proxy)
const sockConnectReq = new PacketBuilder('socks5', 'SOCKS5 CONNECT Request');
const targetHost = 'example.com';
sockConnectReq.field('Version', '0x05 (SOCKS5)', () => sockConnectReq.u8(0x05), { heading: true });
sockConnectReq.field('Command', '0x01 (CONNECT TCP Stream)', () => sockConnectReq.u8(0x01));
sockConnectReq.field('Reserved', '0x00', () => sockConnectReq.u8(0x00));
sockConnectReq.field('Address Type', '0x03 (Domain Name / FQDN)', () => sockConnectReq.u8(0x03));
sockConnectReq.field('Domain Length', `${targetHost.length} bytes`, () => sockConnectReq.u8(targetHost.length));
sockConnectReq.field('Destination Domain', targetHost, () => sockConnectReq.ascii(targetHost));
sockConnectReq.field('Destination Port', '80 (0x0050)', () => sockConnectReq.u16(80));

const tcpConnectReq = buildTcpSegment({
  srcPort: 54600,
  dstPort: 1080,
  seq: 1 + sockMethodReq.length,
  ack: 1 + sockMethodResp.length,
  flags: { psh: true, ack: true },
  payloadLength: sockConnectReq.length,
});
const ipConnectReq = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: SOCKS_SERVER_IP, protocol: 6, payloadLength: tcpConnectReq.length + sockConnectReq.length });
const frameConnectReq = assembleLayers([ethClient, ipConnectReq, tcpConnectReq, sockConnectReq]);

// 4. SOCKS5 CONNECT Response (Proxy -> Client)
const sockConnectResp = new PacketBuilder('socks5', 'SOCKS5 CONNECT Reply');
sockConnectResp.field('Version', '0x05 (SOCKS5)', () => sockConnectResp.u8(0x05), { heading: true });
sockConnectResp.field('Reply Field', '0x00 (Succeeded / Connexion établie)', () => sockConnectResp.u8(0x00));
sockConnectResp.field('Reserved', '0x00', () => sockConnectResp.u8(0x00));
sockConnectResp.field('Address Type', '0x01 (IPv4)', () => sockConnectResp.u8(0x01));
sockConnectResp.field('Bound IP', '198.51.100.80', () => sockConnectResp.raw([198, 51, 100, 80]));
sockConnectResp.field('Bound Port', '49882 (0xC2DA)', () => sockConnectResp.u16(49882));

const tcpConnectResp = buildTcpSegment({
  srcPort: 1080,
  dstPort: 54600,
  seq: 1 + sockMethodResp.length,
  ack: 1 + sockMethodReq.length + sockConnectReq.length,
  flags: { psh: true, ack: true },
  payloadLength: sockConnectResp.length,
});
const ipConnectResp = buildIpv4Packet({ srcIp: SOCKS_SERVER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: tcpConnectResp.length + sockConnectResp.length });
const frameConnectResp = assembleLayers([ethServer, ipConnectResp, tcpConnectResp, sockConnectResp]);

export const socksProtocol: ProtocolDefinition = {
  id: 'socks',
  name: 'SOCKS5',
  title: 'SOCKS Protocol Version 5 (Proxy de Session Couche 5)',
  layer: 5,
  group: 'application',
  nodes: ['client', 'router', 'relay', 'web'],
  legend: [
    ['blue', 'Négociation Méthode Authentification (VER 5)'],
    ['amber', 'Requête CONNECT (Résolution FQDN par le Proxy)'],
    ['green', 'Réponse 0x00 Success & Tunnel Ouvert'],
  ],
  overview: {
    full: 'SOCKS Protocol Version 5 (RFC 1928)',
    description:
      'SOCKS5 est un protocole de proxy universel fonctionnant au niveau de la couche session (Couche 5). Indépendant des protocoles applicatifs (il peut relayer du HTTP, SSH, FTP, Tor ou des jeux en ligne), il permet au client de déléguer la résolution de noms de domaine directement au serveur proxy.',
    facts: [
      ['Couche OSI', 'Session (Couche 5)'],
      ['Transport', 'TCP (Port 1080) + prise en charge UDP (UDP ASSOCIATE)'],
      ['Résolution DNS', 'Le client transmet le nom FQDN (ex: example.com) pour éviter toute fuite DNS locale (DNS Leak Protection)'],
      ['Commandes', '0x01 CONNECT (TCP), 0x02 BIND (Port entrant), 0x03 UDP ASSOCIATE (Datagrammes)'],
    ],
  },
  steps: [
    {
      title: 'Négociation de la Méthode d’Authentification (Client -> SOCKS5)',
      desc: 'Proposition des modes de sécurité acceptés par le client',
      detail:
        'Le client contacte le serveur SOCKS5 sur le port 1080. Il annonce supporter la version 5 et propose la méthode 0x00 (Aucune authentification requise). D’autres options possibles incluent 0x02 (Username/Password) ou 0x03 (GSSAPI).',
      facts: [
        ['Version', '0x05'],
        ['Méthode proposée', '0x00 (No Auth)'],
        ['Port Proxy', 'TCP 1080'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'blue',
          label: 'SOCKS5 Method Req',
          row: {
            time: '0.000 ms',
            src: CLIENT_IP,
            dst: SOCKS_SERVER_IP,
            proto: 'SOCKS5',
            info: 'Version: 5, Methods: [0x00 (No Auth)]',
            len: `${frameMethodReq.bytes.length} o`,
            wire: frameMethodReq,
          },
          wire: frameMethodReq,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'blue',
          label: 'SOCKS5 Method Resp',
          row: {
            time: '12.400 ms',
            src: SOCKS_SERVER_IP,
            dst: CLIENT_IP,
            proto: 'SOCKS5',
            info: 'Version: 5, Selected Method: 0x00',
            len: `${frameMethodResp.bytes.length} o`,
            wire: frameMethodResp,
          },
          wire: frameMethodResp,
        },
      ],
    },
    {
      title: 'Commande de Connexion CONNECT avec Nom FQDN (Client -> Proxy)',
      desc: 'Le client demande au proxy de contacter "example.com:80"',
      detail:
        'Le client émet une commande 0x01 (CONNECT) avec le type d’adresse 0x03 (Nom de domaine FQDN). Cela garantit que c’est le serveur proxy distant qui résout le nom DNS, protégeant l’anonymat de l’utilisateur.',
      facts: [
        ['Commande', '0x01 (CONNECT)'],
        ['Type d’adresse', '0x03 (Domain Name)'],
        ['Cible', 'example.com : 80'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'amber',
          label: 'SOCKS5 CONNECT Req',
          row: {
            time: '20.100 ms',
            src: CLIENT_IP,
            dst: SOCKS_SERVER_IP,
            proto: 'SOCKS5',
            info: 'CONNECT example.com:80 (ATYP: Domain)',
            len: `${frameConnectReq.bytes.length} o`,
            wire: frameConnectReq,
          },
          wire: frameConnectReq,
        },
      ],
    },
    {
      title: 'Acquittement Succès 0x00 & Prise de Relais (Proxy -> Client)',
      desc: 'Le proxy a ouvert la socket distante et retourne l’adresse liée (BND.ADDR)',
      detail:
        'Le serveur SOCKS5 ouvre la session TCP vers example.com, assigne un port local lié (49882) et renvoie la réponse REP=0x00 (Succeeded). Le tunnel est désormais pleinement opérationnel.',
      facts: [
        ['Statut réponse', '0x00 (Success)'],
        ['Port lié (BND.PORT)', '49882'],
        ['Canal', 'Flux TCP bidirectionnel transparent'],
      ],
      events: [
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'green',
          label: 'SOCKS5 0x00 Success',
          row: {
            time: '35.800 ms',
            src: SOCKS_SERVER_IP,
            dst: CLIENT_IP,
            proto: 'SOCKS5',
            info: 'Reply: Succeeded (0x00), BND: 198.51.100.80:49882',
            len: `${frameConnectResp.bytes.length} o`,
            wire: frameConnectResp,
          },
          wire: frameConnectResp,
        },
      ],
    },
  ],
};
