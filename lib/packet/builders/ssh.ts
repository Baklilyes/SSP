import { PacketBuilder } from '../PacketBuilder';

export function buildSshPacket(opts: {
  type: 'version' | 'kexinit' | 'kexdh_init' | 'kexdh_reply' | 'newkeys' | 'encrypted';
  versionString?: string;
  payloadLength?: number;
}): PacketBuilder {
  const ssh = new PacketBuilder('ssh', 'SSH Protocol');

  if (opts.type === 'version') {
    const v = opts.versionString || 'SSH-2.0-OpenSSH_9.3\r\n';
    ssh.summary = v.trim();
    ssh.field('Protocol Version Identification', v.trim(), () => ssh.ascii(v), { heading: true });
    return ssh;
  }

  // SSH Binary Packet Protocol:
  // Packet Length (u32), Padding Length (u8), Payload (n bytes), Padding (p bytes)
  const msgTypeMap = {
    kexinit: 20,
    kexdh_init: 30,
    kexdh_reply: 31,
    newkeys: 21,
    encrypted: 94,
  };
  const msgNames = {
    kexinit: 'SSH_MSG_KEXINIT (20)',
    kexdh_init: 'SSH_MSG_KEXDH_INIT (30)',
    kexdh_reply: 'SSH_MSG_KEXDH_REPLY (31)',
    newkeys: 'SSH_MSG_NEWKEYS (21)',
    encrypted: 'SSH_MSG_CHANNEL_DATA (Encrypted)',
  };

  const msgCode = msgTypeMap[opts.type];
  ssh.summary = msgNames[opts.type];

  if (opts.type === 'encrypted') {
    const len = opts.payloadLength || 96;
    ssh.field('Packet Length', `${len} bytes`, () => ssh.u32(len));
    ssh.field('Padding Length', '8 bytes', () => ssh.u8(8));
    ssh.field('Encrypted Payload', `${len - 9} bytes (ChaCha20-Poly1305)`, () => ssh.unknown(len - 9), {
      note: 'Données de session chiffrées (saisie de terminal interactif)',
    });
    ssh.field('MAC / Tag', '16 bytes', () => ssh.unknown(16));
    return ssh;
  }

  const pLen = opts.type === 'kexinit' ? 760 : opts.type === 'kexdh_reply' ? 620 : opts.type === 'kexdh_init' ? 68 : 12;
  ssh.field('Packet Length', `${pLen} bytes`, () => ssh.u32(pLen));
  ssh.field('Padding Length', '10 bytes', () => ssh.u8(10));
  ssh.field('Message Code', `${msgCode} (${msgNames[opts.type]})`, () => ssh.u8(msgCode), { heading: true });

  if (opts.type === 'kexinit') {
    ssh.field('Cookie', '16 random bytes', () => ssh.unknown(16));
    ssh.field('Kex Algorithms', 'curve25519-sha256,diffie-hellman-group14-sha256', () => {
      ssh.u32(48);
      ssh.ascii('curve25519-sha256,diffie-hellman-group14-sha256');
    });
    ssh.field('Host Key Algorithms', 'ssh-ed25519,rsa-sha2-512', () => {
      ssh.u32(24);
      ssh.ascii('ssh-ed25519,rsa-sha2-512');
    });
    ssh.field('Encryption Algorithms (Client to Server)', 'chacha20-poly1305@openssh.com,aes256-gcm@openssh.com', () => {
      ssh.u32(50);
      ssh.ascii('chacha20-poly1305@openssh.com,aes256-gcm@openssh.com');
    });
  } else if (opts.type === 'kexdh_init') {
    ssh.field('Client Ephemeral Public Key (e)', '32 bytes (Curve25519)', () => ssh.unknown(32));
  } else if (opts.type === 'kexdh_reply') {
    ssh.field('Server Host Key (K_S)', 'ssh-ed25519 public key', () => ssh.unknown(32));
    ssh.field('Server Ephemeral Public Key (f)', '32 bytes (Curve25519)', () => ssh.unknown(32));
    ssh.field('Exchange Hash Signature (s)', '64 bytes (Ed25519 Signature)', () => ssh.unknown(64));
  }

  ssh.field('Padding', '10 bytes', () => ssh.unknown(10), { hidden: true });
  return ssh;
}
