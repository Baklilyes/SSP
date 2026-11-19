import { PacketBuilder } from '../PacketBuilder';

export function buildWireguardPacket(opts: {
  type: 'initiation' | 'response' | 'data';
  senderIndex?: number;
  receiverIndex?: number;
  counter?: number;
  payloadLength?: number;
}): PacketBuilder {
  const wg = new PacketBuilder('wireguard', 'WireGuard');

  const typeMap = { initiation: 1, response: 2, data: 4 };
  const typeCode = typeMap[opts.type];
  const typeNames = {
    initiation: 'Handshake Initiation (Type 1)',
    response: 'Handshake Response (Type 2)',
    data: 'Transport Data (Type 4)',
  };

  wg.summary = typeNames[opts.type];

  // Message Type (1 byte) + Reserved (3 bytes)
  wg.field('Message Type', `${typeCode} (${typeNames[opts.type]})`, () => wg.u8(typeCode), { heading: true });
  wg.field('Reserved', '0x000000', () => wg.u24(0));

  if (opts.type === 'initiation') {
    const sIdx = opts.senderIndex ?? 0x12345678;
    wg.field('Sender Index', `0x${sIdx.toString(16).padStart(8, '0')}`, () => wg.u32le(sIdx), {
      note: 'Index unique attribué par l’initiateur pour identifier cette session',
    });
    wg.field('Unencrypted Ephemeral Key', '32 bytes (Curve25519)', () => wg.unknown(32), {
      note: 'Clé publique éphémère Diffie-Hellman Noise IK',
    });
    wg.field('Encrypted Static Key', '48 bytes (ChaCha20-Poly1305)', () => wg.unknown(48), {
      note: 'Clé publique statique de l’initiateur chiffrée pour préserver l’anonymat',
    });
    wg.field('Encrypted Timestamp', '28 bytes', () => wg.unknown(28), {
      note: 'Horodatage chiffré pour protection anti-rejeu',
    });
    wg.field('MAC1', '16 bytes (BLAKE2s)', () => wg.unknown(16), {
      note: 'Authentification du paquet avec la clé publique du récepteur',
    });
    wg.field('MAC2', '16 bytes (Cookie)', () => wg.unknown(16), {
      note: 'Protection contre le déni de service (DDoS)',
    });
  } else if (opts.type === 'response') {
    const sIdx = opts.senderIndex ?? 0x87654321;
    const rIdx = opts.receiverIndex ?? 0x12345678;
    wg.field('Sender Index', `0x${sIdx.toString(16).padStart(8, '0')}`, () => wg.u32le(sIdx));
    wg.field('Receiver Index', `0x${rIdx.toString(16).padStart(8, '0')}`, () => wg.u32le(rIdx));
    wg.field('Unencrypted Ephemeral Key', '32 bytes (Curve25519)', () => wg.unknown(32));
    wg.field('Encrypted Empty', '16 bytes', () => wg.unknown(16));
    wg.field('MAC1', '16 bytes', () => wg.unknown(16));
    wg.field('MAC2', '16 bytes', () => wg.unknown(16));
  } else {
    // Transport Data
    const rIdx = opts.receiverIndex ?? 0x87654321;
    const counter = opts.counter ?? 0;
    const len = opts.payloadLength ?? 128;

    wg.field('Receiver Index', `0x${rIdx.toString(16).padStart(8, '0')}`, () => wg.u32le(rIdx));
    wg.field('Counter', `${counter}`, () => wg.u64le(counter), {
      note: 'Compteur de paquets non rejouable utilisé comme nonce ChaCha20',
    });
    wg.field('Encrypted Encapsulated IP Packet', `${len} bytes`, () => wg.unknown(len), {
      note: 'Paquet IP complet chiffré et encapsulé (Cryptokey Routing)',
    });
  }

  return wg;
}
