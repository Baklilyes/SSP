import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const GATEWAY_MAC = '00:11:22:33:44:55';
const NTP_MAC = '00:aa:bb:cc:dd:ee';

const CLIENT_IP = '192.168.1.100';
const NTP_SERVER_IP = '216.239.35.0'; // time.google.com

// 1. NTP Client Request (Stratum 0, Mode 3 Client)
const ntpReq = new PacketBuilder('ntp', 'NTP Client Request (v4)');
ntpReq.field('LI, VN, Mode', 'LI=0 (No Warning), VN=4 (NTPv4), Mode=3 (Client)', () => ntpReq.u8(0x23), { heading: true });
ntpReq.field('Stratum', '0 (Unspecified / Query)', () => ntpReq.u8(0));
ntpReq.field('Poll Interval', '6 (64 seconds)', () => ntpReq.u8(6));
ntpReq.field('Precision', '-20 (~1 microsecond)', () => ntpReq.u8(0xec));
ntpReq.field('Root Delay', '0.000000 s', () => ntpReq.u32(0));
ntpReq.field('Root Dispersion', '0.000000 s', () => ntpReq.u32(0));
ntpReq.field('Reference ID', '0x00000000 (NULL)', () => ntpReq.u32(0));
ntpReq.field('Reference Timestamp', '0 (Jan 1, 1900)', () => ntpReq.u32(0).u32(0));
ntpReq.field('Origin Timestamp (T0)', '0 (Not set)', () => ntpReq.u32(0).u32(0));
ntpReq.field('Receive Timestamp (T0)', '0 (Not set)', () => ntpReq.u32(0).u32(0));
ntpReq.field('Transmit Timestamp (T1)', '3943507200.128456s (Client departure)', () =>
  ntpReq.u32(0xeb2b8000).u32(0x20e21a00)
);

const udpReq = buildUdpDatagram({ srcPort: 54123, dstPort: 123, payloadLength: ntpReq.length });
const ipReq = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: NTP_SERVER_IP, protocol: 17, payloadLength: udpReq.length + ntpReq.length });
const ethReq = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: GATEWAY_MAC });
const frameReq = assembleLayers([ethReq, ipReq, udpReq, ntpReq]);

// 2. NTP Server Response (Stratum 1 Atomic/GPS Clock, Mode 4 Server)
const ntpResp = new PacketBuilder('ntp', 'NTP Server Reply (v4)');
ntpResp.field('LI, VN, Mode', 'LI=0 (No Warning), VN=4 (NTPv4), Mode=4 (Server)', () => ntpResp.u8(0x24), { heading: true });
ntpResp.field('Stratum', '1 (Primary Reference Clock)', () => ntpResp.u8(1));
ntpResp.field('Poll Interval', '6 (64 seconds)', () => ntpResp.u8(6));
ntpResp.field('Precision', '-29 (~1.8 nanoseconds)', () => ntpResp.u8(0xe3));
ntpResp.field('Root Delay', '0.000000 s', () => ntpResp.u32(0));
ntpResp.field('Root Dispersion', '0.000015 s', () => ntpResp.u32(0x00000001));
ntpResp.field('Reference ID', "'GOOG' (Google TrueTime GNSS Reference)", () => ntpResp.ascii('GOOG'));
ntpResp.field('Reference Timestamp', '3943507198.991200s (Last sync)', () => ntpResp.u32(0xeb2b7ffe).u32(0xfdc41000));
ntpResp.field('Origin Timestamp (T1)', '3943507200.128456s (Copied from client T1)', () =>
  ntpResp.u32(0xeb2b8000).u32(0x20e21a00)
);
ntpResp.field('Receive Timestamp (T2)', '3943507200.141200s (Server arrival)', () =>
  ntpResp.u32(0xeb2b8000).u32(0x2424b800)
);
ntpResp.field('Transmit Timestamp (T3)', '3943507200.141350s (Server departure)', () =>
  ntpResp.u32(0xeb2b8000).u32(0x242e8a00)
);

const udpResp = buildUdpDatagram({ srcPort: 123, dstPort: 54123, payloadLength: ntpResp.length });
const ipResp = buildIpv4Packet({ srcIp: NTP_SERVER_IP, dstIp: CLIENT_IP, protocol: 17, payloadLength: udpResp.length + ntpResp.length });
const ethResp = buildEthernetFrame({ srcMac: GATEWAY_MAC, dstMac: CLIENT_MAC });
const frameResp = assembleLayers([ethResp, ipResp, udpResp, ntpResp]);

export const ntpProtocol: ProtocolDefinition = {
  id: 'ntp',
  name: 'NTP',
  title: 'Network Time Protocol (Horloges Réseau)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet', 'lan'],
  legend: [
    ['blue', 'Requête Horloge NTP (Port 123)'],
    ['green', 'Réponse Horloge Atomique / GNSS'],
  ],
  overview: {
    full: 'Network Time Protocol version 4 (RFC 5905)',
    description:
      'NTP synchronise les horloges locales des ordinateurs et routeurs avec une précision de quelques millisecondes sur Internet, et inférieure à la microseconde en réseau local via des horloges de référence atomiques (Stratum 1).',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'UDP (Port 123)'],
      ['Structure Horloge', 'Strate 1 (GNSS/Césium), Strate 2 (Serveurs publics), Strate 3+ (Clients)'],
      ['Algorithme', 'Calcul du délai d’aller-retour et décalage d’horloge (Offset / Jitter)'],
      ['Format Timestamp', '64 bits (32 bits secondes entières depuis 1900, 32 bits fractions de seconde)'],
    ],
  },
  steps: [
    {
      title: 'Émission de la Requête NTP (Client -> Serveur)',
      desc: 'Enregistrement de l’horodatage de départ T1',
      detail:
        'Le client génère un paquet NTPv4 en Mode 3 (Client), estampille son horodatage local de départ T1 et l’envoie vers le serveur public Stratum 1.',
      facts: [
        ['Mode', 'Mode 3 (Client)'],
        ['Stratum', '0 (Non synchronisé au départ)'],
        ['Horodatage T1', '3943507200.128456s'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'blue',
          label: 'NTP Client T1',
          row: {
            time: '0.000 ms',
            src: CLIENT_IP,
            dst: NTP_SERVER_IP,
            proto: 'NTP',
            info: 'NTPv4 Client Request, Transmit: 3943507200.128456',
            len: `${frameReq.bytes.length} o`,
            wire: frameReq,
          },
          wire: frameReq,
        },
        {
          type: 'packet',
          from: 'router',
          to: 'internet',
          color: 'blue',
          label: 'NTP Client T1',
          row: {
            time: '1.200 ms',
            src: CLIENT_IP,
            dst: NTP_SERVER_IP,
            proto: 'NTP',
            info: 'NTPv4 Client Request (Transit WAN)',
            len: `${frameReq.bytes.length} o`,
            wire: frameReq,
          },
          wire: frameReq,
        },
      ],
    },
    {
      title: 'Réponse NTP avec Horodatages T2 et T3 (Serveur -> Client)',
      desc: 'Réception serveur à T2 et réémission à T3',
      detail:
        'Le serveur NTP Stratum 1 reçoit la requête à T2, prépare la réponse et l’envoie à T3. La réponse inclut l’identifiant de source atomique "GOOG" et la copie de T1.',
      facts: [
        ['Mode', 'Mode 4 (Server)'],
        ['Stratum', '1 (Horloge GNSS / Rubidium)'],
        ['Horodatage T2 (Arrivée serveur)', '3943507200.141200s'],
        ['Horodatage T3 (Départ serveur)', '3943507200.141350s'],
      ],
      events: [
        {
          type: 'packet',
          from: 'internet',
          to: 'router',
          color: 'green',
          label: 'NTP Server T2/T3',
          row: {
            time: '13.800 ms',
            src: NTP_SERVER_IP,
            dst: CLIENT_IP,
            proto: 'NTP',
            info: 'NTPv4 Server Reply, Stratum 1 (GOOG), Ref: 3943507198.99',
            len: `${frameResp.bytes.length} o`,
            wire: frameResp,
          },
          wire: frameResp,
        },
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'green',
          label: 'NTP Server T2/T3',
          row: {
            time: '14.950 ms',
            src: NTP_SERVER_IP,
            dst: CLIENT_IP,
            proto: 'NTP',
            info: 'NTPv4 Server Reply reçu par le client',
            len: `${frameResp.bytes.length} o`,
            wire: frameResp,
          },
          wire: frameResp,
        },
      ],
    },
    {
      title: 'Calcul de l’Offset et Ajustement de l’Horloge (Client)',
      desc: 'Application de l’algorithme de Marzullo et ajustement par dérive (Slew)',
      detail:
        'Le client note l’instant d’arrivée T4. Il applique les équations NTP : Délai RTT = (T4 - T1) - (T3 - T2) = 2.4 ms. Décalage (Offset) = ((T2 - T1) + (T3 - T4)) / 2 = +0.12 ms. Le noyau compense progressivement la dérive sans saut temporel brusque (clock slewing).',
      facts: [
        ['Délai RTT', '2.40 ms'],
        ['Décalage (Offset)', '+0.12 ms'],
        ['Mode d’ajustement', 'Slewing (adjtime graduel)'],
      ],
      events: [],
    },
  ],
};
