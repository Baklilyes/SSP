import { PacketBuilder } from '../PacketBuilder';
import { ipv4ToBytes } from '../formatters';

export function buildDnsPacket(opts: {
  id?: number;
  qr: boolean; // false = query, true = response
  queryName: string;
  queryType?: string; // "A", "AAAA", etc.
  answerIp?: string;
  ttl?: number;
}): PacketBuilder {
  const dns = new PacketBuilder('dns', 'DNS');
  const id = opts.id ?? 0x7c42;
  dns.summary = opts.qr ? `Response: ${opts.queryName} → ${opts.answerIp}` : `Query: ${opts.queryName} (${opts.queryType ?? 'A'})`;

  dns.field('Transaction ID', `0x${id.toString(16).padStart(4, '0')}`, () => dns.u16(id));
  const flags = opts.qr ? 0x8180 : 0x0100; // Standard response vs standard query (recursion desired)
  dns.field('Flags', `0x${flags.toString(16).padStart(4, '0')} (${opts.qr ? 'Response, NoError' : 'Standard Query'})`, () => dns.u16(flags));
  dns.field('Questions', '1', () => dns.u16(1));
  dns.field('Answer RRs', opts.qr ? '1' : '0', () => dns.u16(opts.qr ? 1 : 0));
  dns.field('Authority RRs', '0', () => dns.u16(0));
  dns.field('Additional RRs', '0', () => dns.u16(0));

  // Query section
  dns.field('Query Name', opts.queryName, () => {
    for (const part of opts.queryName.split('.')) {
      dns.u8(part.length);
      dns.ascii(part);
    }
    dns.u8(0);
  });
  dns.field('Query Type', '1 (Host Address A)', () => dns.u16(1));
  dns.field('Query Class', '1 (IN - Internet)', () => dns.u16(1));

  // Answer section if response
  if (opts.qr && opts.answerIp) {
    dns.field('Answer Name', opts.queryName, () => dns.u16(0xc00c), {
      note: 'Pointeur de compression DNS vers la question à l’offset 12',
    });
    dns.field('Answer Type', '1 (A)', () => dns.u16(1));
    dns.field('Answer Class', '1 (IN)', () => dns.u16(1));
    const ttl = opts.ttl ?? 300;
    dns.field('TTL', `${ttl} s`, () => dns.u32(ttl));
    dns.field('Data Length', '4 bytes', () => dns.u16(4));
    dns.field('Address', opts.answerIp, () => dns.raw(ipv4ToBytes(opts.answerIp!)));
  }

  return dns;
}
