import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const WEB_IP = '203.0.113.10';

// 1. Handshake SYN
const synTcp = buildTcpSegment({ srcPort: 54321, dstPort: 443, seq: 10000, flags: { syn: true }, windowSize: 64240 });
const synIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: synTcp.length });
const synEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const synFrame = assembleLayers([synEth, synIp, synTcp]);

// 2. Handshake SYN-ACK
const synAckTcp = buildTcpSegment({ srcPort: 443, dstPort: 54321, seq: 80000, ack: 10001, flags: { syn: true, ack: true }, windowSize: 65535 });
const synAckIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: synAckTcp.length });
const synAckEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const synAckFrame = assembleLayers([synAckEth, synAckIp, synAckTcp]);

// 3. Handshake ACK
const ackTcp = buildTcpSegment({ srcPort: 54321, dstPort: 443, seq: 10001, ack: 80001, flags: { ack: true }, windowSize: 64240 });
const ackIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: ackTcp.length });
const ackEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const ackFrame = assembleLayers([ackEth, ackIp, ackTcp]);

// 4. Data Transfer (Client -> Server)
const dataTcp = buildTcpSegment({ srcPort: 54321, dstPort: 443, seq: 10001, ack: 80001, flags: { psh: true, ack: true }, payloadLength: 1460 });
dataTcp.ascii('DATA_PAYLOAD_OF_1460_BYTES');
const dataIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: dataTcp.length });
const dataEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const dataFrame = assembleLayers([dataEth, dataIp, dataTcp]);

// 5. Data ACK (Server -> Client)
const dataAckTcp = buildTcpSegment({ srcPort: 443, dstPort: 54321, seq: 80001, ack: 11461, flags: { ack: true }, windowSize: 65535 });
const dataAckIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: dataAckTcp.length });
const dataAckEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const dataAckFrame = assembleLayers([dataAckEth, dataAckIp, dataAckTcp]);

// 6. Lost Packet (Simulation of loss)
const lostTcp = buildTcpSegment({ srcPort: 54321, dstPort: 443, seq: 11461, ack: 80001, flags: { psh: true, ack: true }, payloadLength: 1460 });
const lostIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: lostTcp.length });
const lostEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const lostFrame = assembleLayers([lostEth, lostIp, lostTcp]);

// 7. Retransmission
const retransTcp = buildTcpSegment({ srcPort: 54321, dstPort: 443, seq: 11461, ack: 80001, flags: { psh: true, ack: true }, payloadLength: 1460 });
const retransIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: retransTcp.length });
const retransEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const retransFrame = assembleLayers([retransEth, retransIp, retransTcp]);

// 8. Teardown FIN
const finTcp = buildTcpSegment({ srcPort: 54321, dstPort: 443, seq: 12921, ack: 80001, flags: { fin: true, ack: true } });
const finIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: WEB_IP, protocol: 6, payloadLength: finTcp.length });
const finEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const finFrame = assembleLayers([finEth, finIp, finTcp]);

// 9. Teardown FIN-ACK
const finAckTcp = buildTcpSegment({ srcPort: 443, dstPort: 54321, seq: 80001, ack: 12922, flags: { fin: true, ack: true } });
const finAckIp = buildIpv4Packet({ srcIp: WEB_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: finAckTcp.length });
const finAckEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const finAckFrame = assembleLayers([finAckEth, finAckIp, finAckTcp]);

export const tcpProtocol: ProtocolDefinition = {
  id: 'tcp',
  name: 'TCP',
  title: 'Transmission Control Protocol',
  layer: 4,
  group: 'core',
  nodes: ['client', 'router', 'web'],
  legend: [
    ['green', 'Handshake & Contrôle'],
    ['amber', 'Données utiles'],
    ['violet', 'Acquittements (ACK)'],
    ['red', 'Perte & Retransmission'],
  ],
  overview: {
    full: 'Transmission Control Protocol',
    description:
      'TCP est le protocole de transport orienté connexion le plus utilisé sur Internet. Il fournit un flux d’octets fiable, ordonné et avec contrôle de congestion et d’erreur entre deux applications.',
    facts: [
      ['Couche OSI', 'Transport (Couche 4)'],
      ['Mode', 'Orienté connexion (Stateful)'],
      ['Fiabilité', 'Garantie (Numéros de séquence & ACK)'],
      ['Contrôle de flux', 'Fenêtre glissante (Window Scale)'],
      ['Contrôle de congestion', 'Slow Start, Congestion Avoidance'],
      ['Standard', 'RFC 9293'],
    ],
  },
  outro: {
    title: 'Connexion TCP clôturée',
    desc: 'Fiabilité et contrôle de bout en bout',
    text:
      'TCP a garanti l’acheminement intègre de chaque octet : poignée de main initiale SYN/ACK, transfert ordonné avec fenêtrage, détection automatique de perte et retransmission sans faille, puis fermeture propre.',
    facts: [
      ['Poignée de main', '3 segments (SYN, SYN-ACK, ACK)'],
      ['Tolérance aux pertes', 'Retransmission automatique réussie'],
      ['Fermeture', 'Échange FIN / ACK bilatéral'],
    ],
  },
  steps: [
    {
      title: 'Ouverture de Connexion (3-Way Handshake)',
      desc: 'Négociation des numéros de séquence initiaux (ISN)',
      detail:
        'Le client initie la liaison en envoyant un segment SYN contenant son numéro de séquence initial (ISN=10000). Le serveur répond par SYN-ACK avec son propre ISN (80000) et acquitte 10001. Le client confirme par ACK.',
      facts: [
        ['Client ISN', '10000'],
        ['Serveur ISN', '80000'],
        ['État final', 'ESTABLISHED'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'web'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'SYN',
          row: { time: '0.000 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '54321 → 443 [SYN] Seq=10000 Win=64240', len: `${synFrame.bytes.length} B` },
          wire: synFrame,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'SYN-ACK',
          row: { time: '0.017 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TCP', info: '443 → 54321 [SYN, ACK] Seq=80000 Ack=10001', len: `${synAckFrame.bytes.length} B` },
          wire: synAckFrame,
        },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'ACK',
          row: { time: '0.034 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '54321 → 443 [ACK] Seq=10001 Ack=80001', len: `${ackFrame.bytes.length} B` },
          wire: ackFrame,
        },
      ],
    },
    {
      title: 'Transfert de Données & Fenêtrage',
      desc: 'Envoi d’un segment MSS avec accusé de réception',
      detail:
        'Le client transmet un bloc de données de 1460 octets (Taille Maximale de Segment - MSS). Le serveur valide la réception en envoyant un accusé de réception (ACK=11461) et annonce sa fenêtre disponible.',
      facts: [
        ['Données transmises', '1460 octets'],
        ['Drapeau', 'PSH (Push) + ACK'],
        ['Acquittement', 'Cumulatif'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'DATA [1460 B]',
          row: { time: '0.040 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '54321 → 443 [PSH, ACK] Seq=10001 Len=1460', len: `${dataFrame.bytes.length} B` },
          wire: dataFrame,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'violet',
          label: 'ACK 11461',
          row: { time: '0.057 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TCP', info: '443 → 54321 [ACK] Ack=11461 Win=65535', len: `${dataAckFrame.bytes.length} B` },
          wire: dataAckFrame,
        },
      ],
    },
    {
      title: 'Perte de Paquet & Retransmission',
      desc: 'Détection d’anomalie et réémission fiable',
      detail:
        'Le segment suivant (Seq=11461) est perdu en cours de transit sur un routeur encombré. Le client constate l’absence d’ACK après expiration du temporisateur RTO et réémet le segment.',
      facts: [
        ['Événement', 'Perte réseau simulée'],
        ['Mécanisme', 'Temporisateur RTO (Retransmission Timeout)'],
        ['Résultat', 'Données délivrées sans perte finale'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'red',
          label: 'DATA (LOST)',
          row: { time: '0.070 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '[PERDU EN ROUTE] Seq=11461 Len=1460', len: `${lostFrame.bytes.length} B` },
          wire: lostFrame,
          lost: true,
        },
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'amber',
          label: 'RETRANSMIT',
          row: { time: '0.270 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '[RETRANSMISSION] Seq=11461 Len=1460', len: `${retransFrame.bytes.length} B` },
          wire: retransFrame,
        },
      ],
    },
    {
      title: 'Clôture de Connexion (Teardown)',
      desc: 'Fermeture bilatérale par drapeaux FIN',
      detail:
        'Le client termine son envoi et émet un segment FIN. Le serveur confirme et transmet son propre FIN-ACK pour clore définitivement la session.',
      facts: [
        ['Drapeau clé', 'FIN (Finish)'],
        ['États terminaux', 'FIN-WAIT, TIME-WAIT, CLOSED'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'FIN-ACK',
          row: { time: '0.300 s', src: CLIENT_IP, dst: WEB_IP, proto: 'TCP', info: '54321 → 443 [FIN, ACK] Seq=12921 Ack=80001', len: `${finFrame.bytes.length} B` },
          wire: finFrame,
        },
        {
          type: 'packet',
          from: 'web',
          to: 'client',
          color: 'green',
          label: 'FIN-ACK',
          row: { time: '0.317 s', src: WEB_IP, dst: CLIENT_IP, proto: 'TCP', info: '443 → 54321 [FIN, ACK] Seq=80001 Ack=12922', len: `${finAckFrame.bytes.length} B` },
          wire: finAckFrame,
        },
      ],
    },
  ],
};
