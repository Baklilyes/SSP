import { PacketBuilder } from '../PacketBuilder';

export function buildWebsocketFrame(opts: {
  fin?: boolean;
  opcode: number; // 1 = text, 2 = binary, 8 = close, 9 = ping, 10 = pong
  masked?: boolean;
  maskingKey?: number[];
  payloadText?: string;
}): PacketBuilder {
  const ws = new PacketBuilder('ws', 'WebSocket');
  const fin = opts.fin ?? true;
  const opcode = opts.opcode;
  const isMasked = opts.masked ?? true;

  const opcodeNames: Record<number, string> = {
    1: 'Text Frame',
    2: 'Binary Frame',
    8: 'Connection Close',
    9: 'Ping',
    10: 'Pong',
  };
  const opName = opcodeNames[opcode] || `Opcode ${opcode}`;
  ws.summary = `${opName}${fin ? ' (FIN)' : ''}`;

  const payload = opts.payloadText || 'Hello WebSocket!';
  const encoder = new TextEncoder();
  const rawPayload = Array.from(encoder.encode(payload));
  const mask = opts.maskingKey || [0x37, 0xfa, 0x21, 0x3d];

  // Application du masque XOR côté client (RFC 6455)
  const maskedBytes = isMasked
    ? rawPayload.map((b, i) => b ^ mask[i % 4])
    : rawPayload;

  // Premier octet : FIN (1 bit), RSV (3 bits), Opcode (4 bits)
  const b0 = (fin ? 0x80 : 0x00) | (opcode & 0x0f);
  ws.field('FIN, Opcode', `FIN=${fin ? 1 : 0}, ${opName} (0x${opcode.toString(16)})`, () => ws.u8(b0), { heading: true });

  // Deuxième octet : Mask (1 bit), Payload length (7 bits)
  const b1 = (isMasked ? 0x80 : 0x00) | (rawPayload.length & 0x7f);
  ws.field('Mask & Payload Length', `Mask=${isMasked ? 1 : 0}, Length=${rawPayload.length} bytes`, () => ws.u8(b1));

  if (isMasked) {
    ws.field('Masking Key', `0x${mask.map((b) => b.toString(16).padStart(2, '0')).join('')}`, () => ws.raw(mask), {
      note: 'Masque aléatoire de 4 octets appliqué par le client pour éviter les attaques par empoisonnement de cache',
    });
  }

  ws.field('Payload Data', `"${payload}" (${rawPayload.length} bytes)`, () => ws.raw(maskedBytes), {
    note: isMasked ? 'Charge utile masquée par XOR avec la Masking Key' : 'Données utiles en clair',
  });

  return ws;
}
