import { PacketBuilder } from '../PacketBuilder';

export function buildUdpDatagram(opts: {
  srcPort: number;
  dstPort: number;
  payloadLength: number;
}): PacketBuilder {
  const udp = new PacketBuilder('udp', 'UDP · 8 bytes');
  udp.summary = `${opts.srcPort} → ${opts.dstPort}`;

  const length = 8 + opts.payloadLength;
  udp.field('Source Port', opts.srcPort, () => udp.u16(opts.srcPort));
  udp.field('Destination Port', opts.dstPort, () => udp.u16(opts.dstPort));
  udp.field('Length', `${length} bytes`, () => udp.u16(length), {
    note: 'Longueur totale du datagramme UDP (en-tête de 8 octets + données)',
  });
  udp.field('Checksum', '0x0000 (optionnel/calculé)', () => udp.u16(0x0000));

  return udp;
}
