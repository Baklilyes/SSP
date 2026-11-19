import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildTcpSegment } from '../../packet/builders/tcp';
import { buildTlsRecord } from '../../packet/builders/tls';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const CLIENT_IP = '192.168.1.100';
const DOH_RESOLVER_IP = '1.1.1.1'; // Cloudflare DoH

const reqTls = buildTlsRecord({ type: 'appdata', payloadLength: 180 });
const reqTcp = buildTcpSegment({ srcPort: 53100, dstPort: 443, seq: 1000, ack: 5000, flags: { psh: true, ack: true }, payloadLength: reqTls.length });
const reqIp = buildIpv4Packet({ srcIp: CLIENT_IP, dstIp: DOH_RESOLVER_IP, protocol: 6, payloadLength: reqTcp.length + reqTls.length });
const ethC = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: ROUTER_MAC });
const ethS = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const frame1 = assembleLayers([ethC, reqIp, reqTcp, reqTls]);

const resTls = buildTlsRecord({ type: 'appdata', payloadLength: 220 });
const resTcp = buildTcpSegment({ srcPort: 443, dstPort: 53100, seq: 5000, ack: 1000 + reqTls.length, flags: { psh: true, ack: true }, payloadLength: resTls.length });
const resIp = buildIpv4Packet({ srcIp: DOH_RESOLVER_IP, dstIp: CLIENT_IP, protocol: 6, payloadLength: resTcp.length + resTls.length });
const frame2 = assembleLayers([ethS, resIp, resTcp, resTls]);

export const dohProtocol: ProtocolDefinition = {
  id: 'doh',
  name: 'DNS over HTTPS',
  title: 'Private DNS Resolution (DoH)',
  layer: 7,
  group: 'security',
  nodes: ['client', 'router', 'dns'],
  legend: [
    ['blue', 'Requête DoH Chiffrée (Port 443)'],
    ['green', 'Réponse DoH Chiffrée'],
  ],
  overview: {
    full: 'DNS Queries over HTTPS (RFC 8484)',
    description:
      'DoH chiffre les requêtes de résolution de noms au format binaire DNS standard dans des requêtes HTTP/2 ou HTTP/3 sur le port 443, empêchant les fournisseurs d’accès et observateurs d’espionner les sites visités.',
    facts: [
      ['Couche OSI', 'Application / Sécurité (Couche 7)'],
      ['Transport', 'HTTPS (Port standard 443)'],
      ['Format des messages', 'application/dns-message'],
      ['Protection', 'Immunité contre l’écoute passive et la falsification DNS'],
      ['Standard', 'RFC 8484'],
    ],
  },
  steps: [
    {
      title: 'Requête DNS Chiffrée dans HTTPS',
      desc: 'Envoi d’un message DNS binaire encapsulé',
      detail:
        'Le client envoie une requête HTTP POST ou GET avec l’en-tête Content-Type: application/dns-message vers https://1.1.1.1/dns-query. Pour tout observateur extérieur, ce paquet ressemble à du trafic web HTTPS classique.',
      facts: [
        ['Port', '443 (Indiscernable du trafic Web)'],
        ['En-tête', 'Accept: application/dns-message'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router', 'dns'], frame: 'lookup' },
        {
          type: 'packet',
          from: 'client',
          to: 'dns',
          color: 'blue',
          label: 'DoH QUERY [🔒]',
          row: { time: '0.000 s', src: CLIENT_IP, dst: DOH_RESOLVER_IP, proto: 'DoH', info: 'HTTPS POST /dns-query (Encrypted DNS wire format)', len: `${frame1.bytes.length} B` },
          wire: frame1,
          locked: true,
        },
      ],
    },
    {
      title: 'Réponse Résolue Sécurisée',
      desc: 'Réception de l’adresse IP sans altération possible',
      detail:
        'Le résolveur distant renvoie le message DNS binaire chiffré contenant l’enregistrement A. Tout intermédiaire est dans l’impossibilité de modifier la réponse (anti-spoofing).',
      facts: [
        ['Statut', '200 OK (Chiffré)'],
        ['Confidentialité', 'L’opérateur réseau local ignore quel site a été résolu'],
      ],
      events: [
        {
          type: 'packet',
          from: 'dns',
          to: 'client',
          color: 'green',
          label: 'DoH REPLY [🔒]',
          row: { time: '0.015 s', src: DOH_RESOLVER_IP, dst: CLIENT_IP, proto: 'DoH', info: 'HTTPS 200 OK (application/dns-message)', len: `${frame2.bytes.length} B` },
          wire: frame2,
          locked: true,
        },
      ],
    },
  ],
};
