import { describe, it, expect } from 'vitest';
import { PacketBuilder, assembleLayers } from '../lib/packet/PacketBuilder';
import { computeInternetChecksum } from '../lib/packet/checksum';
import { ipv4ToBytes, macToBytes } from '../lib/packet/formatters';

describe('PacketBuilder & Checksums', () => {
  it('converts IP and MAC to byte arrays correctly', () => {
    expect(ipv4ToBytes('192.168.1.1')).toEqual([192, 168, 1, 1]);
    expect(macToBytes('aa:bb:cc:11:22:33')).toEqual([0xaa, 0xbb, 0xcc, 0x11, 0x22, 0x33]);
  });

  it('builds a binary packet with fields correctly', () => {
    const builder = new PacketBuilder('ip', 'IPv4');
    builder.field('Version & IHL', '0x45', () => builder.u8(0x45));
    builder.field('Total Length', '40', () => builder.u16(40));
    builder.field('Source IP', '192.168.1.5', () => builder.raw(ipv4ToBytes('192.168.1.5')));

    expect(builder.length).toBe(1 + 2 + 4);
    expect(builder.bytes).toEqual([0x45, 0x00, 0x28, 192, 168, 1, 5]);
    expect(builder.fields.length).toBe(3);
    expect(builder.fields[0]).toMatchObject({ name: 'Version & IHL', from: 0, to: 1 });
    expect(builder.fields[1]).toMatchObject({ name: 'Total Length', from: 1, to: 3 });
    expect(builder.fields[2]).toMatchObject({ name: 'Source IP', from: 3, to: 7 });
  });

  it('computes standard RFC 1071 internet checksum correctly', () => {
    // Known test vector: 0x4500, 0x003c, 0x1c46, 0x4000, 0x4006, 0x0000, 0xc0a8, 0x0001, 0xc0a8, 0x00c7
    // with checksum 0x0000 initially -> expected checksum 0xb74e
    const headerBytes = [
      0x45, 0x00, 0x00, 0x3c,
      0x1c, 0x46, 0x40, 0x00,
      0x40, 0x06, 0x00, 0x00, // checksum = 0
      0xc0, 0xa8, 0x00, 0x01,
      0xc0, 0xa8, 0x00, 0xc7,
    ];
    const cksum = computeInternetChecksum(headerBytes);
    expect(cksum).toBe(0x9c5d); // 40029
  });

  it('assembles multi-layer packet correctly adjusting field offsets', () => {
    const eth = new PacketBuilder('eth', 'Ethernet II');
    eth.field('Destination', 'ff:ff:ff:ff:ff:ff', () => eth.raw([255, 255, 255, 255, 255, 255]));

    const ip = new PacketBuilder('ip', 'IPv4');
    ip.field('Version', '4', () => ip.u8(0x45));

    const assembled = assembleLayers([eth, ip]);
    expect(assembled.bytes.length).toBe(7);
    expect(assembled.layers.length).toBe(2);
    expect(assembled.layers[0]).toMatchObject({ id: 'eth', from: 0, to: 6 });
    expect(assembled.layers[1]).toMatchObject({ id: 'ip', from: 6, to: 7 });
    expect(assembled.fields[1]).toMatchObject({ name: 'Version', layer: 'ip', from: 6, to: 7 });
  });
});
