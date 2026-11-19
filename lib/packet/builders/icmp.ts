import { PacketBuilder } from '../PacketBuilder';
import { computeInternetChecksum } from '../checksum';

export function buildIcmpPacket(opts: {
  type: number; // 8 = Echo Request, 0 = Echo Reply, 11 = Time Exceeded, 3 = Unreachable
  code?: number;
  id?: number;
  seq?: number;
  payloadText?: string;
}): PacketBuilder {
  const icmp = new PacketBuilder('icmp', 'ICMP');
  const code = opts.code ?? 0;
  const id = opts.id ?? 1;
  const seq = opts.seq ?? 1;

  const typeNames: Record<number, string> = {
    8: 'Echo (ping) Request',
    0: 'Echo (ping) Reply',
    11: 'Time Exceeded (TTL expired in transit)',
    3: 'Destination Unreachable',
  };

  const typeName = typeNames[opts.type] || `Type ${opts.type}`;
  icmp.summary = `${typeName}, seq=${seq}`;

  const payload = opts.payloadText || 'abcdefghijklmnopqrstuvwabcdefghi';
  const encoder = new TextEncoder();
  const payloadBytes = Array.from(encoder.encode(payload));

  // Pré-calcul pour checksum ICMP
  const headerBytes = [
    opts.type,
    code,
    0, 0, // checksum = 0
    (id >>> 8) & 0xff, id & 0xff,
    (seq >>> 8) & 0xff, seq & 0xff,
    ...payloadBytes,
  ];
  const cksum = computeInternetChecksum(headerBytes);

  icmp.field('Type', `${opts.type} (${typeName})`, () => icmp.u8(opts.type), {
    note: 'Type de message de contrôle ou de diagnostic ICMP',
  });
  icmp.field('Code', `${code}`, () => icmp.u8(code));
  icmp.field('Checksum', `0x${cksum.toString(16).padStart(4, '0')}`, () => icmp.u16(cksum), {
    note: 'Somme de contrôle validant l’intégrité du message ICMP',
  });
  icmp.field('Identifier', `${id} (0x${id.toString(16).padStart(4, '0')})`, () => icmp.u16(id));
  icmp.field('Sequence Number', `${seq}`, () => icmp.u16(seq), {
    note: 'Numéro d’ordre permettant d’associer chaque réponse (Echo Reply) à sa requête (Echo Request)',
  });
  icmp.field('Payload Data', `${payloadBytes.length} bytes`, () => icmp.raw(payloadBytes), {
    note: 'Données de test renvoyées à l’identique par le récepteur',
  });

  return icmp;
}
