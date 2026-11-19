import { PacketBuilder } from '../PacketBuilder';
import { ipv4ToBytes } from '../formatters';
import { computeInternetChecksum } from '../checksum';

export function buildIpv4Packet(opts: {
  srcIp: string;
  dstIp: string;
  protocol: number; // 6 = TCP, 17 = UDP, 1 = ICMP
  payloadLength: number;
  identification?: number;
  ttl?: number;
  df?: boolean;
}): PacketBuilder {
  const ip = new PacketBuilder('ip', 'IPv4 · 20 bytes');
  ip.summary = `${opts.srcIp} → ${opts.dstIp}`;

  const totalLength = 20 + opts.payloadLength;
  const id = opts.identification ?? 0x1c46;
  const ttl = opts.ttl ?? 64;
  const dfFlag = opts.df ?? true;

  ip.field('Version', '4', () => {});
  ip.field('IHL', '5 (20 bytes)', () => ip.u8(0x45));
  ip.field('Type of Service', '0x00 (Routine)', () => ip.u8(0x00));
  ip.field('Total Length', `${totalLength} bytes`, () => ip.u16(totalLength), {
    note: 'Taille totale comprenant l’en-tête IP et la charge utile',
  });
  ip.field('Identification', `0x${id.toString(16).padStart(4, '0')} (${id})`, () => ip.u16(id));
  ip.field(
    'Flags',
    dfFlag ? '0x40 (Don’t Fragment)' : '0x00',
    () => ip.u16(dfFlag ? 0x4000 : 0x0000)
  );
  ip.field('TTL', `${ttl}`, () => ip.u8(ttl), {
    note: 'Time to Live : décrémenté à chaque saut de routeur pour éviter les boucles infinies',
  });

  const protoName = opts.protocol === 6 ? '6 (TCP)' : opts.protocol === 17 ? '17 (UDP)' : `${opts.protocol}`;
  ip.field('Protocol', protoName, () => ip.u8(opts.protocol));

  // Calcul du checksum
  const headerForCksum = [
    0x45, 0x00,
    (totalLength >>> 8) & 0xff, totalLength & 0xff,
    (id >>> 8) & 0xff, id & 0xff,
    dfFlag ? 0x40 : 0x00, 0x00,
    ttl, opts.protocol,
    0x00, 0x00, // checksum temporaire = 0
    ...ipv4ToBytes(opts.srcIp),
    ...ipv4ToBytes(opts.dstIp),
  ];
  const cksum = computeInternetChecksum(headerForCksum);

  ip.field('Header Checksum', `0x${cksum.toString(16).padStart(4, '0')}`, () => ip.u16(cksum), {
    note: 'Somme de contrôle pour valider l’intégrité de l’en-tête IP',
  });
  ip.field('Source IP', opts.srcIp, () => ip.raw(ipv4ToBytes(opts.srcIp)));
  ip.field('Destination IP', opts.dstIp, () => ip.raw(ipv4ToBytes(opts.dstIp)));

  return ip;
}
