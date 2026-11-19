import { ProtocolDefinition } from '../../simulation/types';
import { assembleLayers, PacketBuilder } from '../../packet/PacketBuilder';
import { buildEthernetFrame } from '../../packet/builders/ethernet';
import { buildIpv4Packet } from '../../packet/builders/ipv4';
import { buildUdpDatagram } from '../../packet/builders/udp';

// Adresses IP et MAC des acteurs SIP
const Mohamed_IP = '192.168.1.10';
const ROUTER_IP = '192.168.1.1';
const SIP_SERVER_IP = '203.0.113.5';
const BOB_ROUTER_IP = '198.51.100.200';
const BOB_IP = '192.168.0.23';

const Mohamed_MAC = '00:1a:2b:3c:4d:5e';
const ROUTER_MAC = '00:22:33:44:55:66';
const SERVER_MAC = '00:50:56:c0:00:08';
const BOB_ROUTER_MAC = '00:77:88:99:aa:bb';
const BOB_MAC = '00:cc:dd:ee:ff:11';

const SIP_PORT = 5060;

function buildSipMessage(firstLine: string, headers: [string, string][], sdpLines?: string[]): PacketBuilder {
  const sip = new PacketBuilder('sip', 'Session Initiation Protocol');
  sip.summary = firstLine.trim();
  sip.field('Request / Status Line', firstLine, () => sip.ascii(`${firstLine}\r\n`), { heading: true });

  const sdpBody = sdpLines && sdpLines.length > 0 ? sdpLines.join('\r\n') + '\r\n' : undefined;
  const allHeaders: [string, string][] = [
    ...headers,
    ...(sdpBody
      ? ([
          ['Content-Type', 'application/sdp'],
          ['Content-Length', `${sdpBody.length}`],
        ] as [string, string][])
      : ([['Content-Length', '0']] as [string, string][])),
  ];

  for (const [k, v] of allHeaders) {
    sip.field(k, v, () => sip.ascii(`${k}: ${v}\r\n`));
  }
  sip.field('End of Headers', '\\r\\n', () => sip.ascii('\r\n'));

  if (sdpBody) {
    sip.field('Session Description Protocol (SDP)', `${sdpBody.length} bytes`, () => sip.ascii(sdpBody), {
      note: 'Description des médias : format audio G.711 (PCMU) et port de réception RTP',
    });
  }
  return sip;
}

function buildRtpPacket(seq: number, timestamp: number, ssrc: number, payloadLength: number): PacketBuilder {
  const rtp = new PacketBuilder('rtp', 'Real-time Transport Protocol');
  rtp.summary = `PT=ITU-T G.711 PCMU, SSRC=0x${ssrc.toString(16).toUpperCase()}, Seq=${seq}`;
  rtp.field('Version & Flags', '0x80 (V=2, P=0, X=0, CC=0)', () => rtp.u8(0x80));
  rtp.field('Payload Type', '0 (ITU-T G.711 PCMU)', () => rtp.u8(0x00));
  rtp.field('Sequence Number', `${seq}`, () => rtp.u16(seq));
  rtp.field('Timestamp', `${timestamp}`, () => rtp.u32(timestamp));
  rtp.field('Synchronization Source (SSRC)', `0x${ssrc.toString(16).toUpperCase()}`, () => rtp.u32(ssrc));
  rtp.field('Voice Data (G.711 µ-law)', `${payloadLength} bytes`, () =>
    rtp.raw(new Array(payloadLength).fill(0xd5))
  );
  return rtp;
}

function makeFrame(
  srcIp: string,
  dstIp: string,
  srcMac: string,
  dstMac: string,
  sport: number,
  dport: number,
  payloadBuilder: PacketBuilder
) {
  const udp = buildUdpDatagram({ srcPort: sport, dstPort: dport, payloadLength: payloadBuilder.length });
  const ip = buildIpv4Packet({ srcIp, dstIp, protocol: 17, payloadLength: udp.length + payloadBuilder.length });
  const eth = buildEthernetFrame({ srcMac, dstMac });
  return assembleLayers([eth, ip, udp, payloadBuilder]);
}

// 1. Enregistrement (REGISTER)
const fRegister1 = makeFrame(
  Mohamed_IP,
  SIP_SERVER_IP,
  Mohamed_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('REGISTER sip:example.net SIP/2.0', [
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-r1'],
    ['Max-Forwards', '70'],
    ['From', '<sip:mohamed@example.net>;tag=a73k'],
    ['To', '<sip:mohamed@example.net>'],
    ['Call-ID', 'reg-5e1f@192.168.1.10'],
    ['CSeq', '1 REGISTER'],
    ['Contact', '<sip:mohamed@192.168.1.10:5060>'],
  ])
);

const f401 = makeFrame(
  SIP_SERVER_IP,
  Mohamed_IP,
  SERVER_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('SIP/2.0 401 Unauthorized', [
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-r1'],
    ['From', '<sip:mohamed@example.net>;tag=a73k'],
    ['To', '<sip:mohamed@example.net>;tag=s91d'],
    ['Call-ID', 'reg-5e1f@192.168.1.10'],
    ['CSeq', '1 REGISTER'],
    ['WWW-Authenticate', 'Digest realm="example.net", nonce="7b2e91c4", algorithm=MD5'],
  ])
);

const fRegister2 = makeFrame(
  Mohamed_IP,
  SIP_SERVER_IP,
  Mohamed_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('REGISTER sip:example.net SIP/2.0', [
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-r2'],
    ['Max-Forwards', '70'],
    ['From', '<sip:mohamed@example.net>;tag=a73k'],
    ['To', '<sip:mohamed@example.net>'],
    ['Call-ID', 'reg-5e1f@192.168.1.10'],
    ['CSeq', '2 REGISTER'],
    ['Authorization', 'Digest username="mohamed", realm="example.net", nonce="7b2e91c4", response="9a2f3e8c"'],
    ['Contact', '<sip:mohamed@192.168.1.10:5060>'],
  ])
);

const f200Register = makeFrame(
  SIP_SERVER_IP,
  Mohamed_IP,
  SERVER_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('SIP/2.0 200 OK', [
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-r2'],
    ['From', '<sip:mohamed@example.net>;tag=a73k'],
    ['To', '<sip:mohamed@example.net>;tag=s91d'],
    ['Call-ID', 'reg-5e1f@192.168.1.10'],
    ['CSeq', '2 REGISTER'],
    ['Contact', '<sip:mohamed@192.168.1.10:5060>;expires=3600'],
  ])
);

// 2. Appel à Bob (INVITE)
const sdpMohamed = [
  'v=0',
  'o=mohamed 2890 2890 IN IP4 192.168.1.10',
  's=-',
  'c=IN IP4 192.168.1.10',
  't=0 0',
  'm=audio 49170 RTP/AVP 0 101',
  'a=rtpmap:0 PCMU/8000',
  'a=rtpmap:101 telephone-event/8000',
];

const fInviteClientRelay = makeFrame(
  Mohamed_IP,
  SIP_SERVER_IP,
  Mohamed_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage(
    'INVITE sip:bob@example.net SIP/2.0',
    [
      ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-i1'],
      ['Max-Forwards', '70'],
      ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
      ['To', 'Bob <sip:bob@example.net>'],
      ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
      ['CSeq', '1 INVITE'],
      ['Contact', '<sip:mohamed@192.168.1.10:5060>'],
    ],
    sdpMohamed
  )
);

const f100Trying = makeFrame(
  SIP_SERVER_IP,
  Mohamed_IP,
  SERVER_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('SIP/2.0 100 Trying', [
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-i1'],
    ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['To', 'Bob <sip:bob@example.net>'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '1 INVITE'],
  ])
);

const sdpRelayToBob = [
  'v=0',
  'o=mohamed 2890 2890 IN IP4 203.0.113.5',
  's=-',
  'c=IN IP4 203.0.113.5',
  't=0 0',
  'm=audio 40002 RTP/AVP 0 101',
  'a=rtpmap:0 PCMU/8000',
  'a=rtpmap:101 telephone-event/8000',
];

const fInviteRelayPeer = makeFrame(
  SIP_SERVER_IP,
  BOB_IP,
  SERVER_MAC,
  BOB_ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage(
    'INVITE sip:bob@192.168.0.23:5060 SIP/2.0',
    [
      ['Record-Route', '<sip:203.0.113.5;lr>'],
      ['Via', 'SIP/2.0/UDP 203.0.113.5:5060;branch=z9hG4bK-p1'],
      ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-i1'],
      ['Max-Forwards', '69'],
      ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
      ['To', 'Bob <sip:bob@example.net>'],
      ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
      ['CSeq', '1 INVITE'],
      ['Contact', '<sip:mohamed@192.168.1.10:5060>'],
    ],
    sdpRelayToBob
  )
);

// 3. Sonnerie (180 Ringing)
const f180PeerRelay = makeFrame(
  BOB_IP,
  SIP_SERVER_IP,
  BOB_MAC,
  BOB_ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('SIP/2.0 180 Ringing', [
    ['Via', 'SIP/2.0/UDP 203.0.113.5:5060;branch=z9hG4bK-p1'],
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-i1'],
    ['Record-Route', '<sip:203.0.113.5;lr>'],
    ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['To', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '1 INVITE'],
    ['Contact', '<sip:bob@192.168.0.23:5060>'],
  ])
);

const f180RelayClient = makeFrame(
  SIP_SERVER_IP,
  Mohamed_IP,
  SERVER_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('SIP/2.0 180 Ringing', [
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-i1'],
    ['Record-Route', '<sip:203.0.113.5;lr>'],
    ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['To', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '1 INVITE'],
    ['Contact', '<sip:bob@192.168.0.23:5060>'],
  ])
);

// 4. Décrochage (200 OK & ACK)
const sdpBob = [
  'v=0',
  'o=bob 4410 4410 IN IP4 192.168.0.23',
  's=-',
  'c=IN IP4 192.168.0.23',
  't=0 0',
  'm=audio 49172 RTP/AVP 0 101',
  'a=rtpmap:0 PCMU/8000',
  'a=rtpmap:101 telephone-event/8000',
];

const f200PeerRelay = makeFrame(
  BOB_IP,
  SIP_SERVER_IP,
  BOB_MAC,
  BOB_ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage(
    'SIP/2.0 200 OK',
    [
      ['Via', 'SIP/2.0/UDP 203.0.113.5:5060;branch=z9hG4bK-p1'],
      ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-i1'],
      ['Record-Route', '<sip:203.0.113.5;lr>'],
      ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
      ['To', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
      ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
      ['CSeq', '1 INVITE'],
      ['Contact', '<sip:bob@192.168.0.23:5060>'],
    ],
    sdpBob
  )
);

const sdpRelayToMohamed = [
  'v=0',
  'o=bob 4410 4410 IN IP4 203.0.113.5',
  's=-',
  'c=IN IP4 203.0.113.5',
  't=0 0',
  'm=audio 40000 RTP/AVP 0 101',
  'a=rtpmap:0 PCMU/8000',
  'a=rtpmap:101 telephone-event/8000',
];

const f200RelayClient = makeFrame(
  SIP_SERVER_IP,
  Mohamed_IP,
  SERVER_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage(
    'SIP/2.0 200 OK',
    [
      ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-i1'],
      ['Record-Route', '<sip:203.0.113.5;lr>'],
      ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
      ['To', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
      ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
      ['CSeq', '1 INVITE'],
      ['Contact', '<sip:bob@192.168.0.23:5060>'],
    ],
    sdpRelayToMohamed
  )
);

const fAckClientRelay = makeFrame(
  Mohamed_IP,
  SIP_SERVER_IP,
  Mohamed_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('ACK sip:bob@192.168.0.23:5060 SIP/2.0', [
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-a1'],
    ['Route', '<sip:203.0.113.5;lr>'],
    ['Max-Forwards', '70'],
    ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['To', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '1 ACK'],
  ])
);

const fAckRelayPeer = makeFrame(
  SIP_SERVER_IP,
  BOB_IP,
  SERVER_MAC,
  BOB_ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('ACK sip:bob@192.168.0.23:5060 SIP/2.0', [
    ['Via', 'SIP/2.0/UDP 203.0.113.5:5060;branch=z9hG4bK-pa1'],
    ['Via', 'SIP/2.0/UDP 192.168.1.10:5060;branch=z9hG4bK-a1'],
    ['Max-Forwards', '69'],
    ['From', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['To', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '1 ACK'],
  ])
);

// 5. Conversation (RTP Voice)
const fVoiceMohamedRelay = makeFrame(
  Mohamed_IP,
  SIP_SERVER_IP,
  Mohamed_MAC,
  ROUTER_MAC,
  49170,
  40000,
  buildRtpPacket(101, 160000, 0x28908445, 160)
);

const fVoiceRelayBob = makeFrame(
  SIP_SERVER_IP,
  BOB_IP,
  SERVER_MAC,
  BOB_ROUTER_MAC,
  40002,
  49172,
  buildRtpPacket(101, 160000, 0x28908445, 160)
);

const fVoiceBobRelay = makeFrame(
  BOB_IP,
  SIP_SERVER_IP,
  BOB_MAC,
  BOB_ROUTER_MAC,
  49172,
  40002,
  buildRtpPacket(501, 160000, 0x4410a6c8, 160)
);

const fVoiceRelayMohamed = makeFrame(
  SIP_SERVER_IP,
  Mohamed_IP,
  SERVER_MAC,
  ROUTER_MAC,
  40000,
  49170,
  buildRtpPacket(501, 160000, 0x4410a6c8, 160)
);

// 6. Raccrochage (BYE)
const fByePeerRelay = makeFrame(
  BOB_IP,
  SIP_SERVER_IP,
  BOB_MAC,
  BOB_ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('BYE sip:mohamed@192.168.1.10:5060 SIP/2.0', [
    ['Via', 'SIP/2.0/UDP 192.168.0.23:5060;branch=z9hG4bK-b1'],
    ['Route', '<sip:203.0.113.5;lr>'],
    ['Max-Forwards', '70'],
    ['From', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['To', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '2 BYE'],
  ])
);

const fByeRelayClient = makeFrame(
  SIP_SERVER_IP,
  Mohamed_IP,
  SERVER_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('BYE sip:mohamed@192.168.1.10:5060 SIP/2.0', [
    ['Via', 'SIP/2.0/UDP 203.0.113.5:5060;branch=z9hG4bK-pb1'],
    ['Via', 'SIP/2.0/UDP 192.168.0.23:5060;branch=z9hG4bK-b1'],
    ['Max-Forwards', '69'],
    ['From', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['To', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '2 BYE'],
  ])
);

const f200ByeClientRelay = makeFrame(
  Mohamed_IP,
  SIP_SERVER_IP,
  Mohamed_MAC,
  ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('SIP/2.0 200 OK', [
    ['Via', 'SIP/2.0/UDP 203.0.113.5:5060;branch=z9hG4bK-pb1'],
    ['Via', 'SIP/2.0/UDP 192.168.0.23:5060;branch=z9hG4bK-b1'],
    ['From', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['To', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '2 BYE'],
  ])
);

const f200ByeRelayPeer = makeFrame(
  SIP_SERVER_IP,
  BOB_IP,
  SERVER_MAC,
  BOB_ROUTER_MAC,
  SIP_PORT,
  SIP_PORT,
  buildSipMessage('SIP/2.0 200 OK', [
    ['Via', 'SIP/2.0/UDP 192.168.0.23:5060;branch=z9hG4bK-b1'],
    ['From', 'Bob <sip:bob@example.net>;tag=a6c85cf'],
    ['To', 'Mohamed <sip:mohamed@example.net>;tag=1928301774'],
    ['Call-ID', 'a84b4c76e66710@192.168.1.10'],
    ['CSeq', '2 BYE'],
  ])
);

export const sipProtocol: ProtocolDefinition = {
  id: 'sip',
  name: 'SIP',
  title: 'Appels Téléphoniques par Internet (VoIP)',
  layer: 7,
  group: 'application',
  nodes: ['client', 'router', 'internet', 'relay', 'remote', 'peer'],
  labels: {
    client: ['Mohamed', '192.168.1.10'],
    router: ['Routeur', '192.168.1.1'],
    internet: ['Internet', ''],
    relay: ['Serveur SIP', '203.0.113.5'],
    remote: ['Routeur de Bob', '198.51.100.200'],
    peer: ['Bob', '192.168.0.23'],
  },
  latency: {
    'client-relay': 0.02,
    'relay-peer': 0.025,
  },
  legend: [
    ['amber', 'Requêtes'],
    ['violet', 'Réponses'],
    ['green', 'Voix (RTP)'],
  ],
  overview: {
    full: 'Session Initiation Protocol (RFC 3261)',
    description:
      'SIP établit et contrôle les communications multimédias sur Internet : téléphonie IP d’entreprise, logiciels VoIP et opérateurs télécoms. Inspiré de HTTP, il enregistre les téléphones, négocie les paramètres audio/vidéo via SDP (Session Description Protocol), et supervise le cycle de vie de l’appel.',
    facts: [
      ['Couche OSI', 'Application (Couche 7)'],
      ['Port standard', 'UDP ou TCP 5060 (5061 pour SIP TLS)'],
      ['Établissement', 'INVITE, 180 Ringing, 200 OK, ACK'],
      ['Transport voix', 'RTP (Real-time Transport Protocol)'],
      ['Codec audio', 'G.711 µ-law (64 kbit/s, 50 paquets/s)'],
      ['Standard', 'RFC 3261'],
    ],
  },
  outro: {
    title: 'Communication Téléphonique Terminée',
    desc: 'Enregistré, sonné, parlé et raccroché',
    text:
      'Le téléphone de Mohamed s’est authentifié auprès du serveur SIP sans jamais exposer son mot de passe en clair, a invité Bob à travers le serveur mandataire, a entendu la sonnerie, puis a échangé les flux vocaux RTP jusqu’au raccrochage final avec BYE.',
    facts: [
      ['Requêtes SIP', 'REGISTER, INVITE, ACK, BYE'],
      ['Flux voix', '50 paquets RTP / seconde dans chaque direction'],
      ['Routage', 'Signalisation et voix relayées via le serveur opérateur'],
      ['Sécurité', 'Texte clair (chiffrable avec SIPS et SRTP)'],
    ],
  },
  start: {
    nodes: ['client'],
    frame: 'client',
  },
  steps: [
    {
      title: 'Connexion (REGISTER)',
      desc: 'Le téléphone indique au serveur où il se trouve',
      detail:
        'Le téléphone logiciel de Mohamed s’enregistre auprès du serveur SIP de son opérateur : mohamed@example.net est joignable ici. Le serveur répond 401 Unauthorized avec un défi cryptographique. Mohamed renvoie sa demande avec le condensé MD5 du mot de passe. 200 OK : enregistrement validé pour une heure.',
      facts: [
        ['Port', 'UDP 5060'],
        ['Authentification', 'Condensé MD5 (Digest), jamais de mot de passe en clair'],
        ['Validité', '3600 s (renouvelé automatiquement)'],
      ],
      events: [
        { type: 'show', nodes: ['router', 'internet', 'relay'], frame: 'lookup' },
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'amber',
          label: 'REGISTER',
          payload: ['mohamed@example.net', 'est ici'],
          row: { time: '0.000 s', src: Mohamed_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Request: REGISTER sip:example.net', len: `${fRegister1.bytes.length} B` },
          wire: fRegister1,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'violet',
          label: '401',
          payload: ['Non autorisé', 'avec un défi'],
          row: { time: '0.021 s', src: SIP_SERVER_IP, dst: Mohamed_IP, proto: 'SIP', info: 'Status: 401 Unauthorized', len: `${f401.bytes.length} B` },
          wire: f401,
        },
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'amber',
          label: 'REGISTER',
          payload: ['à nouveau, avec un hash'],
          row: { time: '0.042 s', src: Mohamed_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Request: REGISTER sip:example.net (Digest)', len: `${fRegister2.bytes.length} B` },
          wire: fRegister2,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'violet',
          label: '200 OK',
          payload: ['enregistré'],
          row: { time: '0.063 s', src: SIP_SERVER_IP, dst: Mohamed_IP, proto: 'SIP', info: 'Status: 200 OK (REGISTER)', len: `${f200Register.bytes.length} B` },
          wire: f200Register,
        },
      ],
    },
    {
      title: 'Appel à Bob (INVITE)',
      desc: 'Une invitation relayée par le serveur',
      detail:
        'Mohamed appelle bob@example.net. Son message INVITE transporte la description SDP : audio G.711 émis vers son téléphone. Le serveur répond immédiatement 100 Trying, recherche l’adresse d’enregistrement de Bob et relaie l’INVITE en insérant ses en-têtes Via et Record-Route : le flux voix passera par lui.',
      facts: [
        ['Destinataire', 'sip:bob@example.net'],
        ['Offre SDP', 'Codec G.711, Port 49170'],
        ['100 Trying', 'Stoppe les retransmissions de Mohamed'],
      ],
      events: [
        { type: 'show', nodes: ['remote', 'peer'], frame: 'full' },
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'amber',
          label: 'INVITE',
          payload: ['appelle bob@example.net', 'SDP: audio G.711'],
          row: { time: '2.500 s', src: Mohamed_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Request: INVITE sip:bob@example.net', len: `${fInviteClientRelay.bytes.length} B` },
          wire: fInviteClientRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'violet',
          label: '100 TRYING',
          payload: [],
          row: { time: '2.521 s', src: SIP_SERVER_IP, dst: Mohamed_IP, proto: 'SIP', info: 'Status: 100 Trying', len: `${f100Trying.bytes.length} B` },
          wire: f100Trying,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'peer',
          color: 'amber',
          label: 'INVITE',
          payload: ['transmis à Bob', 'voix via le serveur'],
          row: { time: '2.521 s', src: SIP_SERVER_IP, dst: BOB_IP, proto: 'SIP', info: 'Request: INVITE sip:bob@192.168.0.23:5060', len: `${fInviteRelayPeer.bytes.length} B` },
          wire: fInviteRelayPeer,
        },
      ],
    },
    {
      title: 'Sonnerie (180 Ringing)',
      desc: 'La réponse transite en sens inverse',
      detail:
        'Le téléphone de Bob se met à sonner et émet le code 180 Ringing. Les réponses SIP retracent exactement le chemin inverse des en-têtes Via : le message parvient au serveur qui le transmet à Mohamed. Son téléphone joue la tonalité de retour d’appel.',
      facts: [
        ['Statut', '180 Ringing'],
        ['Routage retour', 'En-têtes Via en ordre inverse'],
        ['Mohamed entend', 'La tonalité de sonnerie'],
      ],
      events: [
        {
          type: 'packet',
          from: 'peer',
          to: 'relay',
          color: 'violet',
          label: '180 RINGING',
          payload: ['Le téléphone de Bob sonne'],
          row: { time: '2.560 s', src: BOB_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Status: 180 Ringing', len: `${f180PeerRelay.bytes.length} B` },
          wire: f180PeerRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'violet',
          label: '180 RINGING',
          payload: ['vers Mohamed'],
          row: { time: '2.586 s', src: SIP_SERVER_IP, dst: Mohamed_IP, proto: 'SIP', info: 'Status: 180 Ringing', len: `${f180RelayClient.bytes.length} B` },
          wire: f180RelayClient,
        },
      ],
    },
    {
      title: 'Décrochage (200 OK & ACK)',
      desc: 'Bob décroche, session établie',
      detail:
        'Bob décroche son combiné. Son message 200 OK contient sa réponse SDP : codec G.711, port de réception. Le serveur substitue son adresse avant de transmettre le 200 OK à Mohamed. Le téléphone de Mohamed confirme avec un ACK, relayé à Bob. La session multimédia est officiellement établie.',
      facts: [
        ['Réponse SDP', 'G.711, Port 49172'],
        ['Confirmation', 'ACK à 3 temps'],
        ['Voix adressée à', 'Serveur SIP, ports 40000 / 40002'],
      ],
      events: [
        {
          type: 'packet',
          from: 'peer',
          to: 'relay',
          color: 'violet',
          label: '200 OK',
          payload: ['Bob décroche', 'SDP: audio G.711'],
          row: { time: '6.320 s', src: BOB_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Status: 200 OK (INVITE)', len: `${f200PeerRelay.bytes.length} B` },
          wire: f200PeerRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'violet',
          label: '200 OK',
          payload: ['décroché', 'voix via le serveur'],
          row: { time: '6.346 s', src: SIP_SERVER_IP, dst: Mohamed_IP, proto: 'SIP', info: 'Status: 200 OK (INVITE)', len: `${f200RelayClient.bytes.length} B` },
          wire: f200RelayClient,
        },
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'amber',
          label: 'ACK',
          payload: [],
          row: { time: '6.367 s', src: Mohamed_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Request: ACK sip:bob@192.168.0.23:5060', len: `${fAckClientRelay.bytes.length} B` },
          wire: fAckClientRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'peer',
          color: 'amber',
          label: 'ACK',
          payload: [],
          row: { time: '6.388 s', src: SIP_SERVER_IP, dst: BOB_IP, proto: 'SIP', info: 'Request: ACK sip:bob@192.168.0.23:5060', len: `${fAckRelayPeer.bytes.length} B` },
          wire: fAckRelayPeer,
        },
      ],
    },
    {
      title: 'Conversation (Flux RTP)',
      desc: 'La voix circule en paquets RTP',
      detail:
        'La conversation vocale commence : toutes les 20 ms, chaque téléphone émet un paquet RTP contenant 160 octets d’échantillons sonores G.711, un numéro de séquence et un horodatage précis sur UDP. Ils transitent par le serveur qui les relaie au correspondant.',
      facts: [
        ['Cadence', 'Toutes les 20 ms (50 paquets/s)'],
        ['Transport voix', 'RTP sur UDP'],
        ['Rôle de SIP', 'Silencieux pendant la conversation'],
      ],
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'green',
          label: 'VOIX RTP',
          payload: ['20 ms de Mohamed'],
          row: { time: '6.420 s', src: Mohamed_IP, dst: SIP_SERVER_IP, proto: 'RTP', info: 'RTP: PT=PCMU, Seq=101, Len=160 B (Mohamed -> Serveur)', len: `${fVoiceMohamedRelay.bytes.length} B` },
          wire: fVoiceMohamedRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'peer',
          color: 'green',
          label: 'VOIX RTP',
          payload: ['20 ms de Mohamed'],
          row: { time: '6.441 s', src: SIP_SERVER_IP, dst: BOB_IP, proto: 'RTP', info: 'RTP: PT=PCMU, Seq=101, Len=160 B (Serveur -> Bob)', len: `${fVoiceRelayBob.bytes.length} B` },
          wire: fVoiceRelayBob,
        },
        {
          type: 'packet',
          from: 'peer',
          to: 'relay',
          color: 'green',
          label: 'VOIX RTP',
          payload: ['20 ms de Bob'],
          row: { time: '6.470 s', src: BOB_IP, dst: SIP_SERVER_IP, proto: 'RTP', info: 'RTP: PT=PCMU, Seq=501, Len=160 B (Bob -> Serveur)', len: `${fVoiceBobRelay.bytes.length} B` },
          wire: fVoiceBobRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'green',
          label: 'VOIX RTP',
          payload: ['20 ms de Bob'],
          row: { time: '6.496 s', src: SIP_SERVER_IP, dst: Mohamed_IP, proto: 'RTP', info: 'RTP: PT=PCMU, Seq=501, Len=160 B (Serveur -> Mohamed)', len: `${fVoiceRelayMohamed.bytes.length} B` },
          wire: fVoiceRelayMohamed,
        },
      ],
    },
    {
      title: 'Raccrochage (BYE)',
      desc: 'Fin de la communication téléphonique',
      detail:
        'Bob raccroche : son téléphone émet une requête BYE, routée à travers le serveur comme demandé dans le Record-Route. Le téléphone de Mohamed répond 200 OK. Les deux postes cessent immédiatement l’émission des paquets RTP.',
      facts: [
        ['Requête de clôture', 'BYE'],
        ['Réponse', '200 OK'],
        ['Arrêt média', 'Fin immédiate des flux RTP'],
      ],
      events: [
        {
          type: 'packet',
          from: 'peer',
          to: 'relay',
          color: 'amber',
          label: 'BYE',
          payload: ['Bob raccroche'],
          row: { time: '9.800 s', src: BOB_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Request: BYE sip:mohamed@192.168.1.10:5060', len: `${fByePeerRelay.bytes.length} B` },
          wire: fByePeerRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'client',
          color: 'amber',
          label: 'BYE',
          payload: ['vers Mohamed'],
          row: { time: '9.826 s', src: SIP_SERVER_IP, dst: Mohamed_IP, proto: 'SIP', info: 'Request: BYE sip:mohamed@192.168.1.10:5060', len: `${fByeRelayClient.bytes.length} B` },
          wire: fByeRelayClient,
        },
        {
          type: 'packet',
          from: 'client',
          to: 'relay',
          color: 'violet',
          label: '200 OK',
          payload: [],
          row: { time: '9.847 s', src: Mohamed_IP, dst: SIP_SERVER_IP, proto: 'SIP', info: 'Status: 200 OK (BYE)', len: `${f200ByeClientRelay.bytes.length} B` },
          wire: f200ByeClientRelay,
        },
        {
          type: 'packet',
          from: 'relay',
          to: 'peer',
          color: 'violet',
          label: '200 OK',
          payload: [],
          row: { time: '9.868 s', src: SIP_SERVER_IP, dst: BOB_IP, proto: 'SIP', info: 'Status: 200 OK (BYE)', len: `${f200ByeRelayPeer.bytes.length} B` },
          wire: f200ByeRelayPeer,
        },
      ],
    },
  ],
};
