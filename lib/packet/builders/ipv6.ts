import { PacketBuilder } from '../PacketBuilder';
import { ipv6ToBytes } from '../formatters';

export function buildIpv6Packet(opts: {
  srcIp: string;
  dstIp: string;
  nextHeader: number; // 58 = ICMPv6, 6 = TCP, 17 = UDP
  payloadLength: number;
  hopLimit?: number;
}): PacketBuilder {
  const ip6 = new PacketBuilder('ipv6', 'IPv6 · 40 bytes');
  ip6.summary = `${opts.srcIp} → ${opts.dstIp}`;

  const hopLimit = opts.hopLimit ?? 64;

  // 1er mot (32 bits) : Version (4 bits = 6), Traffic Class (8 bits = 0), Flow Label (20 bits = 0)
  ip6.field('Version', '6', () => ip6.u8(0x60));
  ip6.field('Traffic Class', '0x00 (DSCP: CS0, ECN: Not-ECT)', () => ip6.u8(0x00));
  ip6.field('Flow Label', '0x00000', () => ip6.u16(0x0000), {
    note: 'Étiquette de flux permettant aux routeurs de classifier les paquets appartenant au même flux sans inspecter la couche 4',
  });

  ip6.field('Payload Length', `${opts.payloadLength} bytes`, () => ip6.u16(opts.payloadLength), {
    note: 'Taille de la charge utile (exclut l’en-tête IPv6 fixe de 40 octets)',
  });

  const nextHeaderNames: Record<number, string> = {
    58: '58 (ICMPv6)',
    6: '6 (TCP)',
    17: '17 (UDP)',
  };
  ip6.field('Next Header', nextHeaderNames[opts.nextHeader] || `${opts.nextHeader}`, () =>
    ip6.u8(opts.nextHeader)
  );

  ip6.field('Hop Limit', `${hopLimit}`, () => ip6.u8(hopLimit), {
    note: 'Équivalent du TTL en IPv4 : décrémenté à chaque saut de routeur',
  });

  ip6.field('Source Address', opts.srcIp, () => ip6.raw(ipv6ToBytes(opts.srcIp)));
  ip6.field('Destination Address', opts.dstIp, () => ip6.raw(ipv6ToBytes(opts.dstIp)));

  return ip6;
}
