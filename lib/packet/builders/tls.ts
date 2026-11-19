import { PacketBuilder } from '../PacketBuilder';

export function buildTlsRecord(opts: {
  type: 'handshake' | 'appdata' | 'ccs';
  handshakeType?: 'client_hello' | 'server_hello';
  serverName?: string;
  cipherSuite?: string;
  payloadLength?: number;
}): PacketBuilder {
  const tls = new PacketBuilder('tls', 'TLS 1.3');

  const recordType = opts.type === 'handshake' ? 22 : opts.type === 'appdata' ? 23 : 20;
  const typeName =
    opts.type === 'handshake'
      ? `Handshake (${opts.handshakeType === 'client_hello' ? 'Client Hello' : 'Server Hello'})`
      : opts.type === 'appdata'
      ? 'Application Data (Encrypted)'
      : 'Change Cipher Spec';

  tls.summary = typeName;

  // En-tête de record TLS (5 octets)
  tls.field('Content Type', `${recordType} (${typeName})`, () => tls.u8(recordType), {
    note: 'Type d’enregistrement TLS encapsulé',
  });
  tls.field('Legacy Version', '0x0303 (TLS 1.2)', () => tls.u16(0x0303), {
    note: 'Numéro de version factice maintenu pour compatibilité avec les anciens intermédiaires réseau',
  });

  if (opts.type === 'appdata') {
    const len = opts.payloadLength || 512;
    tls.field('Length', `${len} bytes`, () => tls.u16(len));
    tls.field('Encrypted Application Data', `${len} bytes`, () => tls.unknown(len), {
      note: 'Données applicatives chiffrées avec la clé symétrique dérivée (AES-GCM ou ChaCha20)',
    });
    return tls;
  }

  // Handshake TLS
  if (opts.handshakeType === 'client_hello') {
    const hs = new PacketBuilder('tls_hs', 'Handshake Protocol: Client Hello');
    hs.field('Handshake Type', '1 (Client Hello)', () => hs.u8(1), { heading: true });
    hs.field('Length', '512 bytes', () => hs.u24(512));
    hs.field('Version', '0x0303 (TLS 1.2 compatibility)', () => hs.u16(0x0303));
    hs.field('Client Random', '32 random bytes', () => hs.unknown(32), {
      note: 'Valeur aléatoire unique de 256 bits pour empêcher les attaques par rejeu',
    });
    hs.field('Session ID Length', '32', () => hs.u8(32));
    hs.field('Session ID', '32 legacy bytes', () => hs.unknown(32));

    // Cipher Suites
    hs.field('Cipher Suites Length', '6', () => hs.u16(6));
    hs.field('Cipher Suite', 'TLS_AES_128_GCM_SHA256 (0x1301)', () => hs.u16(0x1301), {
      note: 'Chiffrement authentifié AEAD recommandé en TLS 1.3',
    });
    hs.field('Cipher Suite', 'TLS_AES_256_GCM_SHA384 (0x1302)', () => hs.u16(0x1302));
    hs.field('Cipher Suite', 'TLS_CHACHA20_POLY1305_SHA256 (0x1303)', () => hs.u16(0x1303));

    // Compression Methods
    hs.field('Compression Methods Length', '1', () => hs.u8(1));
    hs.field('Compression Method', '0 (null)', () => hs.u8(0));

    // Extensions
    hs.field('Extension: Server Name (SNI)', opts.serverName || 'https://ssp-academy.com/', () => {
      hs.u16(0x0000); // Type 0 = SNI
      const nameBytes = new TextEncoder().encode(opts.serverName || 'https://ssp-academy.com/');
      hs.u16(nameBytes.length + 5);
      hs.u16(nameBytes.length + 3);
      hs.u8(0); // host_name
      hs.u16(nameBytes.length);
      hs.raw(Array.from(nameBytes));
    }, {
      note: 'Indique le nom d’hôte visé pour permettre l’hébergement virtuel de certificats multiples',
    });

    hs.field('Extension: Supported Versions', 'TLS 1.3 (0x0304)', () => {
      hs.u16(0x002b); // Type 43 = supported_versions
      hs.u16(3);
      hs.u8(2);
      hs.u16(0x0304);
    });

    hs.field('Extension: Key Share (X25519)', '32 bytes public key', () => {
      hs.u16(0x0033); // Type 51 = key_share
      hs.u16(36);
      hs.u16(0x001d); // Curve X25519
      hs.u16(32);
      hs.unknown(32);
    }, {
      note: 'Part de clé éphémère Diffie-Hellman pour dériver les secrets dès 1-RTT',
    });

    tls.field('Record Length', `${hs.length} bytes`, () => tls.u16(hs.length));
    tls.append(hs);
  } else if (opts.handshakeType === 'server_hello') {
    const hs = new PacketBuilder('tls_hs', 'Handshake Protocol: Server Hello');
    hs.field('Handshake Type', '2 (Server Hello)', () => hs.u8(2), { heading: true });
    hs.field('Length', '122 bytes', () => hs.u24(122));
    hs.field('Version', '0x0303 (TLS 1.2 compatibility)', () => hs.u16(0x0303));
    hs.field('Server Random', '32 bytes', () => hs.unknown(32));
    hs.field('Selected Cipher Suite', 'TLS_AES_128_GCM_SHA256 (0x1301)', () => hs.u16(0x1301));

    // Extensions
    hs.field('Extension: Supported Versions', 'TLS 1.3 (0x0304)', () => {
      hs.u16(0x002b);
      hs.u16(2);
      hs.u16(0x0304);
    });

    hs.field('Extension: Key Share (X25519)', '32 bytes server public key', () => {
      hs.u16(0x0033);
      hs.u16(36);
      hs.u16(0x001d);
      hs.u16(32);
      hs.unknown(32);
    }, {
      note: 'Part de clé du serveur permettant de calculer le secret partagé immédiat',
    });

    tls.field('Record Length', `${hs.length} bytes`, () => tls.u16(hs.length));
    tls.append(hs);
  }

  return tls;
}
