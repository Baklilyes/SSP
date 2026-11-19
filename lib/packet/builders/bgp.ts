import { PacketBuilder } from '../PacketBuilder';
import { ipv4ToBytes } from '../formatters';

export function buildBgpPacket(opts: {
  type: 'open' | 'update' | 'keepalive';
  myAs?: number;
  holdTime?: number;
  bgpId?: string;
  nlriPrefix?: string;
  asPath?: number[];
  nextHop?: string;
}): PacketBuilder {
  const bgp = new PacketBuilder('bgp', 'Border Gateway Protocol');

  const typeMap = { open: 1, update: 2, keepalive: 4 };
  const typeNames = {
    open: 'OPEN Message (Type 1)',
    update: 'UPDATE Message (Type 2)',
    keepalive: 'KEEPALIVE Message (Type 4)',
  };

  bgp.summary = typeNames[opts.type];

  // BGP Marker (16 octets à 0xff)
  bgp.field('Marker', '16 bytes (0xff)', () => bgp.raw(Array(16).fill(0xff)), {
    note: 'Séquence de synchronisation de 16 octets à 1',
  });

  if (opts.type === 'keepalive') {
    bgp.field('Length', '19 bytes', () => bgp.u16(19));
    bgp.field('Type', '4 (KEEPALIVE)', () => bgp.u8(4), { heading: true });
    return bgp;
  }

  if (opts.type === 'open') {
    const as = opts.myAs ?? 13335;
    const hold = opts.holdTime ?? 90;
    const id = opts.bgpId ?? '198.51.100.1';

    bgp.field('Length', '29 bytes', () => bgp.u16(29));
    bgp.field('Type', '1 (OPEN)', () => bgp.u8(1), { heading: true });
    bgp.field('Version', '4 (BGP-4)', () => bgp.u8(4));
    bgp.field('My Autonomous System', `${as} (AS${as})`, () => bgp.u16(as), {
      note: 'Numéro de système autonome (AS) de l’opérateur émetteur',
    });
    bgp.field('Hold Time', `${hold} seconds`, () => bgp.u16(hold));
    bgp.field('BGP Identifier', id, () => bgp.raw(ipv4ToBytes(id)));
    bgp.field('Optional Parameters Length', '0', () => bgp.u8(0));
  } else if (opts.type === 'update') {
    const asPath = opts.asPath || [13335, 15169];
    const nextHop = opts.nextHop || '198.51.100.1';
    const prefix = opts.nlriPrefix || '203.0.113.0/24';

    bgp.field('Length', '54 bytes', () => bgp.u16(54));
    bgp.field('Type', '2 (UPDATE)', () => bgp.u8(2), { heading: true });
    bgp.field('Withdrawn Routes Length', '0 bytes', () => bgp.u16(0));
    bgp.field('Total Path Attribute Length', '28 bytes', () => bgp.u16(28));

    // Path Attributes: ORIGIN, AS_PATH, NEXT_HOP
    bgp.field('Path Attribute: ORIGIN', 'IGP (0)', () => {
      bgp.u8(0x40); // Flags
      bgp.u8(1);    // Type 1 = ORIGIN
      bgp.u8(1);    // Length
      bgp.u8(0);    // 0 = IGP
    });

    bgp.field('Path Attribute: AS_PATH', asPath.map((a) => `AS${a}`).join(' → '), () => {
      bgp.u8(0x40);
      bgp.u8(2); // Type 2 = AS_PATH
      bgp.u8(asPath.length * 2 + 2);
      bgp.u8(2); // AS_SEQUENCE
      bgp.u8(asPath.length);
      for (const a of asPath) {
        bgp.u16(a);
      }
    }, {
      note: 'Liste des systèmes autonomes traversés pour prévenir les boucles de routage inter-opérateurs',
    });

    bgp.field('Path Attribute: NEXT_HOP', nextHop, () => {
      bgp.u8(0x40);
      bgp.u8(3); // Type 3 = NEXT_HOP
      bgp.u8(4);
      bgp.raw(ipv4ToBytes(nextHop));
    });

    // NLRI (Network Layer Reachability Information)
    bgp.field('NLRI: Announced Prefix', prefix, () => {
      bgp.u8(24); // Prefix length /24
      bgp.raw(ipv4ToBytes('203.0.113.0').slice(0, 3));
    }, {
      note: 'Préfixe de sous-réseau IP désormais joignable via ce chemin',
    });
  }

  return bgp;
}
