import { PacketBuilder } from '../PacketBuilder';
import { macToBytes } from '../formatters';

export function buildEthernetFrame(opts: {
  srcMac: string;
  dstMac: string;
  etherType?: number; // 0x0800 = IPv4, 0x86dd = IPv6, 0x0806 = ARP
}): PacketBuilder {
  const eth = new PacketBuilder('eth', 'Ethernet II · 14 bytes');
  eth.summary = `${opts.srcMac} → ${opts.dstMac}`;

  eth.field('Destination', opts.dstMac, () => eth.raw(macToBytes(opts.dstMac)), {
    note: 'Adresse MAC physique du destinataire sur la liaison locale',
  });
  eth.field('Source', opts.srcMac, () => eth.raw(macToBytes(opts.srcMac)), {
    note: 'Adresse MAC physique de l’émetteur',
  });
  eth.field(
    'Type',
    opts.etherType === 0x0806 ? '0x0806 (ARP)' : '0x0800 (IPv4)',
    () => eth.u16(opts.etherType ?? 0x0800),
    { note: 'Protocole encapsulé dans la charge utile de la trame' }
  );

  return eth;
}
