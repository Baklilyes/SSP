import { PacketBuilder } from '../PacketBuilder';

export function buildTcpSegment(opts: {
  srcPort: number;
  dstPort: number;
  seq: number;
  ack?: number;
  flags: {
    syn?: boolean;
    ack?: boolean;
    fin?: boolean;
    rst?: boolean;
    psh?: boolean;
    urg?: boolean;
  };
  windowSize?: number;
  payloadLength?: number;
}): PacketBuilder {
  const flagsStr: string[] = [];
  let flagBits = 0;
  if (opts.flags.urg) { flagsStr.push('URG'); flagBits |= 0x20; }
  if (opts.flags.ack) { flagsStr.push('ACK'); flagBits |= 0x10; }
  if (opts.flags.psh) { flagsStr.push('PSH'); flagBits |= 0x08; }
  if (opts.flags.rst) { flagsStr.push('RST'); flagBits |= 0x04; }
  if (opts.flags.syn) { flagsStr.push('SYN'); flagBits |= 0x02; }
  if (opts.flags.fin) { flagsStr.push('FIN'); flagBits |= 0x01; }

  const summaryFlags = flagsStr.join(', ') || 'None';
  const tcp = new PacketBuilder('tcp', 'TCP · 20 bytes');
  tcp.summary = `${opts.srcPort} → ${opts.dstPort}, [${summaryFlags}]`;

  tcp.field('Source Port', opts.srcPort, () => tcp.u16(opts.srcPort), {
    note: 'Port applicatif source (généralement éphémère côté client)',
  });
  tcp.field('Destination Port', opts.dstPort, () => tcp.u16(opts.dstPort), {
    note: 'Port du service destinataire (ex: 80 pour HTTP, 443 pour HTTPS)',
  });
  tcp.field('Sequence Number', `${opts.seq}`, () => tcp.u32(opts.seq), {
    note: 'Numéro d’ordre du premier octet de données de ce segment',
  });
  tcp.field('Acknowledgment Number', `${opts.ack ?? 0}`, () => tcp.u32(opts.ack ?? 0), {
    note: 'Prochain numéro d’octet attendu par l’émetteur',
  });
  tcp.field('Header Length', '5 (20 bytes)', () => tcp.u8(0x50));
  tcp.field('Flags', `0x${flagBits.toString(16).padStart(2, '0')} (${summaryFlags})`, () => tcp.u8(flagBits), {
    note: `Drapeaux de contrôle actifs : ${summaryFlags}`,
  });
  const win = opts.windowSize ?? 65535;
  tcp.field('Window Size', `${win}`, () => tcp.u16(win), {
    note: 'Capacité restante du buffer de réception chez l’émetteur',
  });
  tcp.field('Checksum', '0x2d1a (calculé)', () => tcp.u16(0x2d1a));
  tcp.field('Urgent Pointer', '0', () => tcp.u16(0));

  return tcp;
}
