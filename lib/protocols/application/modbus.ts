import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';

const SCADA_MAC = '00:1a:2b:3c:4d:5e';
const PLC_MAC = '00:80:e1:12:34:56';
const SCADA_IP = '192.168.1.100'; // Poste de supervision SCADA
const PLC_IP = '192.168.1.150'; // Automate Programmable Industriel (PLC)

// 1. Modbus TCP Query: Read Holding Registers (Function Code 0x03)
const modbusReq = new PacketBuilder('modbus', 'Modbus TCP Read Holding Registers (FC 0x03)');
modbusReq.field('Transaction ID', '0x0001', () => modbusReq.u16(0x0001), { heading: true });
modbusReq.field('Protocol ID', '0x0000 (Modbus TCP)', () => modbusReq.u16(0x0000));
modbusReq.field('Length', '6 bytes', () => modbusReq.u16(6));
modbusReq.field('Unit ID', '0x01 (Automate PLC n°1)', () => modbusReq.u8(0x01));
modbusReq.field('Function Code', '0x03 (Read Holding Registers)', () => modbusReq.u8(0x03));
modbusReq.field('Starting Address', '100 (0x0064)', () => modbusReq.u16(100));
modbusReq.field('Quantity of Registers', '2 registers (4 bytes)', () => modbusReq.u16(2));

const tcpReq = buildTcpSegment({
  srcPort: 54800,
  dstPort: 502,
  seq: 1,
  ack: 1,
  flags: { psh: true, ack: true },
  payloadLength: modbusReq.length,
});
const ipReq = buildIpv4Packet({ srcIp: SCADA_IP, dstIp: PLC_IP, protocol: 6, payloadLength: tcpReq.length + modbusReq.length });
const ethReq = buildEthernetFrame({ srcMac: SCADA_MAC, dstMac: PLC_MAC });
const frameReq = assembleLayers([ethReq, ipReq, tcpReq, modbusReq]);

// 2. Modbus TCP Response: Sensor Values (RPM & Pressure)
const modbusResp = new PacketBuilder('modbus', 'Modbus TCP Response (Données Capteurs)');
modbusResp.field('Transaction ID', '0x0001 (Match requête)', () => modbusResp.u16(0x0001), { heading: true });
modbusResp.field('Protocol ID', '0x0000 (Modbus TCP)', () => modbusResp.u16(0x0000));
modbusResp.field('Length', '7 bytes', () => modbusResp.u16(7));
modbusResp.field('Unit ID', '0x01 (PLC n°1)', () => modbusResp.u8(0x01));
modbusResp.field('Function Code', '0x03 (Read Holding Registers)', () => modbusResp.u8(0x03));
modbusResp.field('Byte Count', '4 bytes (2 registres 16 bits)', () => modbusResp.u8(4));
modbusResp.field('Register 100 (Vitesse)', '0x01F4 (500 RPM)', () => modbusResp.u16(500), {
  note: 'Vitesse de rotation de la turbine en tours/min',
});
modbusResp.field('Register 101 (Pression)', '0x09C4 (2500 kPa)', () => modbusResp.u16(2500), {
  note: 'Pression de la chaudière industrielle',
});

const tcpResp = buildTcpSegment({
  srcPort: 502,
  dstPort: 54800,
  seq: 1,
  ack: 1 + modbusReq.length,
  flags: { psh: true, ack: true },
  payloadLength: modbusResp.length,
});
const ipResp = buildIpv4Packet({ srcIp: PLC_IP, dstIp: SCADA_IP, protocol: 6, payloadLength: tcpResp.length + modbusResp.length });
const ethResp = buildEthernetFrame({ srcMac: PLC_MAC, dstMac: SCADA_MAC });
const frameResp = assembleLayers([ethResp, ipResp, tcpResp, modbusResp]);

// 3. Modbus TCP Command: Write Single Register (Function Code 0x06)
const modbusWrite = new PacketBuilder('modbus', 'Modbus TCP Write Single Register (FC 0x06)');
modbusWrite.field('Transaction ID', '0x0002', () => modbusWrite.u16(0x0002), { heading: true });
modbusWrite.field('Protocol ID', '0x0000 (Modbus TCP)', () => modbusWrite.u16(0x0000));
modbusWrite.field('Length', '6 bytes', () => modbusWrite.u16(6));
modbusWrite.field('Unit ID', '0x01', () => modbusWrite.u8(0x01));
modbusWrite.field('Function Code', '0x06 (Write Single Register)', () => modbusWrite.u8(0x06));
modbusWrite.field('Register Address', '102 (0x0066 - Commande Pompe)', () => modbusWrite.u16(102));
modbusWrite.field('Register Value', '0x0001 (START Pompe de Refroidissement)', () => modbusWrite.u16(1));

const tcpWrite = buildTcpSegment({
  srcPort: 54800,
  dstPort: 502,
  seq: 1 + modbusReq.length,
  ack: 1 + modbusResp.length,
  flags: { psh: true, ack: true },
  payloadLength: modbusWrite.length,
});
const ipWrite = buildIpv4Packet({ srcIp: SCADA_IP, dstIp: PLC_IP, protocol: 6, payloadLength: tcpWrite.length + modbusWrite.length });
const frameWrite = assembleLayers([ethReq, ipWrite, tcpWrite, modbusWrite]);

export const modbusProtocol: ProtocolDefinition = {
  id: 'modbus',
  name: 'Modbus',
  title: 'Modbus TCP (Automatisme & Systèmes Industriels SCADA)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'lan'],
  legend: [
    ['blue', 'Requête Lecture Registres (FC 0x03)'],
    ['green', 'Télémétrie Capteurs (Vitesse / Pression)'],
    ['amber', 'Commande Actionneur (FC 0x06 Write)'],
  ],
  overview: {
    full: 'Modbus Application Protocol over TCP/IP (IEC 61158 / Modbus-IDA)',
    description:
      'Modbus TCP est le protocole de communication dominant dans les usines, les réseaux électriques et l’Internet des Objets industriels (IIoT). Il encapsule les trames Modbus maître/esclave sur TCP port 502 sans contrôle d’accès natif, reliant les supervisions SCADA aux automates programmables (PLC).',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'TCP (Port standard 502)'],
      ['En-tête MBAP', '7 octets : Transaction ID (2o), Protocol ID (2o=0), Length (2o), Unit ID (1o)'],
      ['Codes de Fonction', '0x01 (Coils), 0x03 (Holding Registers), 0x04 (Input Registers), 0x06/0x10 (Write)'],
      ['Cybersécurité', 'Protocole historique non chiffré et sans authentification ; nécessite une segmentation stricte en réseau OT (Purdue Model / DMZ industrielle)'],
    ],
  },
  steps: [
    {
      title: 'Lecture de Télémétrie SCADA (Code Fonction 0x03)',
      desc: 'Interrogation des registres de mesure de l’automate',
      detail:
        'Le poste de supervision SCADA émet une trame Modbus TCP interrogeant les 2 registres consécutifs débutant à l’adresse 100 pour surveiller les capteurs de vitesse et de pression.',
      facts: [
        ['Port', 'TCP 502 (Modbus-TCP)'],
        ['En-tête MBAP', 'Transaction ID: 0x0001, Unit ID: 1'],
        ['Code Fonction', '0x03 (Read Holding Registers)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'lan',
          color: 'blue',
          label: 'Modbus Read FC 0x03',
          row: {
            time: '0.000 ms',
            src: SCADA_IP,
            dst: PLC_IP,
            proto: 'Modbus/TCP',
            info: 'Read Holding Registers: Start=100, Count=2 (Unit 1)',
            len: `${frameReq.bytes.length} o`,
            wire: frameReq,
          },
          wire: frameReq,
        },
      ],
    },
    {
      title: 'Réponse de Mesure de l’Automate Industriel (PLC)',
      desc: 'Transmission des grandeurs physiques mesurées',
      detail:
        'L’automate lit ses entrées analogiques et renvoie les 4 octets de valeurs : Registre 100 = 500 RPM (vitesse turbine), Registre 101 = 2500 kPa (pression de vapeur).',
      facts: [
        ['Registre 100', '500 RPM (Tours par minute)'],
        ['Registre 101', '2500 kPa (Pression chaudière)'],
        ['Temps de réponse', '1.8 ms (Temps réel automate)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'lan',
          to: 'client',
          color: 'green',
          label: 'Modbus Telemetry',
          row: {
            time: '1.800 ms',
            src: PLC_IP,
            dst: SCADA_IP,
            proto: 'Modbus/TCP',
            info: 'Response FC 0x03: [Reg 100: 500 RPM, Reg 101: 2500 kPa]',
            len: `${frameResp.bytes.length} o`,
            wire: frameResp,
          },
          wire: frameResp,
        },
      ],
    },
    {
      title: 'Émission d’un Ordre Actionneur (Code Fonction 0x06 Write)',
      desc: 'Activation de la pompe de refroidissement d’urgence',
      detail:
        'Constatant la pression élevée, l’opérateur ou l’algorithme de régulation SCADA écrit la valeur 1 dans le registre 102 de l’automate pour enclencher la pompe de secours.',
      facts: [
        ['Code Fonction', '0x06 (Write Single Register)'],
        ['Registre', '102 (Commande Pompe)'],
        ['Valeur', '0x0001 (START)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'lan',
          color: 'amber',
          label: 'Modbus Write FC 0x06',
          row: {
            time: '6.200 ms',
            src: SCADA_IP,
            dst: PLC_IP,
            proto: 'Modbus/TCP',
            info: 'Write Single Register: Reg 102 = 1 (START Pompe)',
            len: `${frameWrite.bytes.length} o`,
            wire: frameWrite,
          },
          wire: frameWrite,
        },
      ],
    },
  ],
};
