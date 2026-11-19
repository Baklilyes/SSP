import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';
import { buildDhcpMessage } from '../../packet/builders/dhcp';

const CLIENT_MAC = '00:1a:2b:3c:4d:5e';
const BROADCAST_MAC = 'ff:ff:ff:ff:ff:ff';
const ROUTER_MAC = '00:22:33:44:55:66';

const ZERO_IP = '0.0.0.0';
const BROADCAST_IP = '255.255.255.255';
const ROUTER_IP = '192.168.1.1';
const ASSIGNED_IP = '192.168.1.100';
const DNS_IP = '8.8.8.8';

// 1. DHCP Discover (Client -> Broadcast)
const discDhcp = buildDhcpMessage({ messageType: 'DISCOVER', clientMac: CLIENT_MAC });
const discUdp = buildUdpDatagram({ srcPort: 68, dstPort: 67, payloadLength: discDhcp.length });
const discIp = buildIpv4Packet({ srcIp: ZERO_IP, dstIp: BROADCAST_IP, protocol: 17, payloadLength: discUdp.length + discDhcp.length });
const discEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: BROADCAST_MAC });
const discFrame = assembleLayers([discEth, discIp, discUdp, discDhcp]);

// 2. DHCP Offer (Server -> Client)
const offerDhcp = buildDhcpMessage({
  messageType: 'OFFER',
  clientMac: CLIENT_MAC,
  assignedIp: ASSIGNED_IP,
  serverIp: ROUTER_IP,
  leaseTime: 86400,
  subnetMask: '255.255.255.0',
  routerIp: ROUTER_IP,
  dnsIp: DNS_IP,
});
const offerUdp = buildUdpDatagram({ srcPort: 67, dstPort: 68, payloadLength: offerDhcp.length });
const offerIp = buildIpv4Packet({ srcIp: ROUTER_IP, dstIp: ASSIGNED_IP, protocol: 17, payloadLength: offerUdp.length + offerDhcp.length });
const offerEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const offerFrame = assembleLayers([offerEth, offerIp, offerUdp, offerDhcp]);

// 3. DHCP Request (Client -> Broadcast)
const reqDhcp = buildDhcpMessage({
  messageType: 'REQUEST',
  clientMac: CLIENT_MAC,
  assignedIp: ASSIGNED_IP,
  serverIp: ROUTER_IP,
});
const reqUdp = buildUdpDatagram({ srcPort: 68, dstPort: 67, payloadLength: reqDhcp.length });
const reqIp = buildIpv4Packet({ srcIp: ZERO_IP, dstIp: BROADCAST_IP, protocol: 17, payloadLength: reqUdp.length + reqDhcp.length });
const reqEth = buildEthernetFrame({ srcMac: CLIENT_MAC, dstMac: BROADCAST_MAC });
const reqFrame = assembleLayers([reqEth, reqIp, reqUdp, reqDhcp]);

// 4. DHCP ACK (Server -> Client)
const ackDhcp = buildDhcpMessage({
  messageType: 'ACK',
  clientMac: CLIENT_MAC,
  assignedIp: ASSIGNED_IP,
  serverIp: ROUTER_IP,
  leaseTime: 86400,
  subnetMask: '255.255.255.0',
  routerIp: ROUTER_IP,
  dnsIp: DNS_IP,
});
const ackUdp = buildUdpDatagram({ srcPort: 67, dstPort: 68, payloadLength: ackDhcp.length });
const ackIp = buildIpv4Packet({ srcIp: ROUTER_IP, dstIp: ASSIGNED_IP, protocol: 17, payloadLength: ackUdp.length + ackDhcp.length });
const ackEth = buildEthernetFrame({ srcMac: ROUTER_MAC, dstMac: CLIENT_MAC });
const ackFrame = assembleLayers([ackEth, ackIp, ackUdp, ackDhcp]);

export const dhcpProtocol: ProtocolDefinition = {
  id: 'dhcp',
  name: 'DHCP',
  title: 'Automatic Network Configuration (DORA)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router'],
  legend: [
    ['amber', 'Découverte (Discover)'],
    ['blue', 'Proposition (Offer)'],
    ['violet', 'Demande (Request)'],
    ['green', 'Confirmation (ACK)'],
  ],
  overview: {
    full: 'Dynamic Host Configuration Protocol',
    description:
      'DHCP permet à un équipement venant de se connecter à un réseau d’obtenir automatiquement son adresse IP, son masque de sous-réseau, sa passerelle par défaut et ses serveurs DNS selon le cycle DORA.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Transport', 'UDP (Ports 67 Serveur / 68 Client)'],
      ['Cycle DORA', 'Discover → Offer → Request → Acknowledge'],
      ['Paramètres fournis', 'Adresse IP, Masque, Passerelle, DNS, Bail'],
      ['Standard', 'RFC 2131'],
    ],
  },
  outro: {
    title: 'Configuration IP active',
    desc: 'Bail DHCP négocié avec succès',
    text:
      'Le client dispose désormais d’une adresse IP valide (192.168.1.100), d’une passerelle par défaut (192.168.1.1) et d’un serveur DNS (8.8.8.8) lui permettant d’accéder à l’ensemble du Web.',
    facts: [
      ['Adresse allouée', '192.168.1.100 / 24'],
      ['Passerelle', '192.168.1.1'],
      ['Durée du bail', '86400 secondes (24 heures)'],
    ],
  },
  steps: [
    {
      title: 'DHCP Discover (Diffusion)',
      desc: 'Le client cherche un serveur DHCP sur le réseau',
      detail:
        'Ne possédant pas encore d’adresse IP, le client émet une trame en diffusion broadcast (MAC FF:FF:FF:FF:FF:FF et IP 255.255.255.255) avec l’adresse source 0.0.0.0 pour trouver un serveur DHCP actif.',
      facts: [
        ['Message DHCP', '1 (Discover)'],
        ['Adresse source', '0.0.0.0'],
        ['Adresse destination', '255.255.255.255 (Broadcast)'],
      ],
      events: [
        { type: 'show', nodes: ['client', 'router'], frame: 'local' },
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'amber',
          label: 'DHCP DISCOVER',
          row: { time: '0.000 s', src: ZERO_IP, dst: BROADCAST_IP, proto: 'DHCP', info: 'DHCP Discover - Transaction ID 0x3903f326', len: `${discFrame.bytes.length} B` },
          wire: discFrame,
        },
      ],
    },
    {
      title: 'DHCP Offer (Offre)',
      desc: 'Le serveur propose une configuration réseau',
      detail:
        'Le routeur répond en proposant une adresse libre (192.168.1.100), ainsi que le masque de sous-réseau, la passerelle locale et la durée de validité du bail.',
      facts: [
        ['Message DHCP', '2 (Offer)'],
        ['IP proposée', '192.168.1.100'],
        ['Durée du bail', '86400 s (24h)'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'blue',
          label: 'DHCP OFFER',
          row: { time: '0.010 s', src: ROUTER_IP, dst: ASSIGNED_IP, proto: 'DHCP', info: 'DHCP Offer - Your IP: 192.168.1.100', len: `${offerFrame.bytes.length} B` },
          wire: offerFrame,
        },
      ],
    },
    {
      title: 'DHCP Request (Acceptation)',
      desc: 'Le client demande formellement l’adresse proposée',
      detail:
        'Le client diffuse un message DHCP Request confirmant son intention d’utiliser l’adresse 192.168.1.100 fournie par ce serveur (et informant d’autres éventuels serveurs que leurs offres sont déclinées).',
      facts: [
        ['Message DHCP', '3 (Request)'],
        ['IP sollicitée', '192.168.1.100'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'router',
          color: 'violet',
          label: 'DHCP REQUEST',
          row: { time: '0.020 s', src: ZERO_IP, dst: BROADCAST_IP, proto: 'DHCP', info: 'DHCP Request - Requested IP: 192.168.1.100', len: `${reqFrame.bytes.length} B` },
          wire: reqFrame,
        },
      ],
    },
    {
      title: 'DHCP ACK (Confirmation finale)',
      desc: 'Attribution et enregistrement définitif du bail',
      detail:
        'Le serveur valide la réservation dans sa table de baux actifs et envoie un paquet DHCP ACK final. L’interface réseau du client est désormais pleinement configurée.',
      facts: [
        ['Message DHCP', '5 (ACK)'],
        ['État', 'Attribution confirmée'],
      ],
      events: [
        {
          type: 'packet',
          from: 'router',
          to: 'client',
          color: 'green',
          label: 'DHCP ACK',
          row: { time: '0.030 s', src: ROUTER_IP, dst: ASSIGNED_IP, proto: 'DHCP', info: 'DHCP ACK - IP 192.168.1.100 confirmed', len: `${ackFrame.bytes.length} B` },
          wire: ackFrame,
        },
      ],
    },
  ],
};
