import { PacketBuilder } from '../PacketBuilder';

export function buildQuicPacket(opts: {
  headerType: 'initial' | 'handshake' | '1rtt';
  destConnId: string;
  srcConnId?: string;
  packetNumber: number;
  payloadLength?: number;
}): PacketBuilder {
  const quic = new PacketBuilder('quic', 'QUIC');

  const isLong = opts.headerType !== '1rtt';
  const typeMap = { initial: 0, handshake: 2, '1rtt': 0 };
  const typeNames = {
    initial: 'Long Header: Initial (0x00)',
    handshake: 'Long Header: Handshake (0x02)',
    '1rtt': 'Short Header: 1-RTT Protected (0x40)',
  };

  quic.summary = typeNames[opts.headerType];

  if (isLong) {
    // Header Form (1), Fixed Bit (1), Long Packet Type (2 bits), Reserved (2 bits), Packet Number Length (2 bits)
    const firstByte = 0xc0 | ((typeMap[opts.headerType] & 0x03) << 4) | 0x03;
    quic.field('Header Flags', `0x${firstByte.toString(16)} (${typeNames[opts.headerType]})`, () => quic.u8(firstByte), { heading: true });

    // Version (4 bytes: 0x00000001 = QUIC Version 1)
    quic.field('Version', '0x00000001 (QUIC v1, RFC 9000)', () => quic.u32(1), {
      note: 'Identifiant de la version de protocole QUIC négociée',
    });

    // Destination Connection ID (DCID)
    const dcidBytes = [0x83, 0x94, 0xc8, 0xf0, 0x3e, 0x51, 0x4b, 0x67];
    quic.field('DCID Length', `${dcidBytes.length}`, () => quic.u8(dcidBytes.length));
    quic.field('Destination Connection ID', `0x${dcidBytes.map((b) => b.toString(16).padStart(2, '0')).join('')}`, () => quic.raw(dcidBytes), {
      note: 'Identifiant de connexion opaque permettant la persistance de session même lors d’un changement d’IP',
    });

    // Source Connection ID (SCID)
    const scidBytes = [0x51, 0x4b, 0x67, 0x83, 0x94, 0xc8, 0xf0, 0x3e];
    quic.field('SCID Length', `${scidBytes.length}`, () => quic.u8(scidBytes.length));
    quic.field('Source Connection ID', `0x${scidBytes.map((b) => b.toString(16).padStart(2, '0')).join('')}`, () => quic.raw(scidBytes));

    if (opts.headerType === 'initial') {
      quic.field('Token Length', '0 (No token in first packet)', () => quic.u8(0));
    }

    const len = opts.payloadLength || 1162;
    quic.field('Payload Length', `${len} bytes (including Packet Number)`, () => quic.u16(len));
    quic.field('Packet Number', `${opts.packetNumber}`, () => quic.u32(opts.packetNumber), {
      note: 'Numéro de paquet non tronqué dans un espace de numérotation strictement croissant',
    });

    // CRYPTO Frame / STREAM Frame
    quic.field('Frame: CRYPTO / TLS 1.3 Handshake', `${len - 4} bytes`, () => quic.unknown(len - 4), {
      note: 'Trame de poignée de main TLS 1.3 encapsulée nativement dans QUIC sans couche TCP intermédiaire',
    });
  } else {
    // Short Header (1-RTT)
    // Header Form (0), Fixed Bit (1), Spin Bit (1), Reserved (2 bits), Key Phase (1), Packet Number Length (2 bits)
    const firstByte = 0x43;
    quic.field('Header Flags', `0x${firstByte.toString(16)} (Short Header 1-RTT)`, () => quic.u8(firstByte), { heading: true });

    const dcidBytes = [0x83, 0x94, 0xc8, 0xf0, 0x3e, 0x51, 0x4b, 0x67];
    quic.field('Destination Connection ID', `0x${dcidBytes.map((b) => b.toString(16).padStart(2, '0')).join('')}`, () => quic.raw(dcidBytes));
    quic.field('Packet Number', `${opts.packetNumber}`, () => quic.u32(opts.packetNumber));

    const len = opts.payloadLength || 720;
    quic.field('Encrypted Payload & STREAM Frames', `${len} bytes (Chiffré)`, () => quic.unknown(len), {
      note: 'Flux de données multiplexés sans blocage de tête de ligne (No Head-of-Line Blocking)',
    });
  }

  return quic;
}
