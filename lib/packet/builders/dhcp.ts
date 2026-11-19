import { PacketBuilder } from '../PacketBuilder';
import { ipv4ToBytes, macToBytes } from '../formatters';

export type DhcpMessageType = 'DISCOVER' | 'OFFER' | 'REQUEST' | 'ACK';

const DHCP_TYPE_CODES: Record<DhcpMessageType, number> = {
  DISCOVER: 1,
  OFFER: 2,
  REQUEST: 3,
  ACK: 5,
};

export function buildDhcpMessage(opts: {
  messageType: DhcpMessageType;
  xid?: number;
  clientMac: string;
  assignedIp?: string;
  serverIp?: string;
  leaseTime?: number;
  subnetMask?: string;
  routerIp?: string;
  dnsIp?: string;
}): PacketBuilder {
  const isReply = opts.messageType === 'OFFER' || opts.messageType === 'ACK';
  const typeCode = DHCP_TYPE_CODES[opts.messageType];
  const xid = opts.xid ?? 0x3903f326;

  const dhcp = new PacketBuilder('dhcp', `DHCP ${opts.messageType}`);
  dhcp.summary = `DHCP ${opts.messageType} (xid=0x${xid.toString(16)})`;

  dhcp.field('Message Type', isReply ? '2 (Boot Reply)' : '1 (Boot Request)', () =>
    dhcp.u8(isReply ? 2 : 1)
  );
  dhcp.field('Hardware Type', '1 (Ethernet 10Mb)', () => dhcp.u8(1));
  dhcp.field('Hardware Address Length', '6', () => dhcp.u8(6));
  dhcp.field('Hops', '0', () => dhcp.u8(0));
  dhcp.field('Transaction ID', `0x${xid.toString(16).padStart(8, '0')}`, () => dhcp.u32(xid), {
    note: 'Identifiant aléatoire généré par le client pour corréler la réponse',
  });
  dhcp.field('Seconds Elapsed', '0', () => dhcp.u16(0));
  dhcp.field('Bootp Flags', '0x0000 (Unicast)', () => dhcp.u16(0x0000));

  // Client IP (ciaddr)
  dhcp.field('Client IP Address', '0.0.0.0', () => dhcp.raw([0, 0, 0, 0]));

  // Your (client) IP (yiaddr)
  const yiaddr = opts.assignedIp || '0.0.0.0';
  dhcp.field('Your (Client) IP Address', yiaddr, () => dhcp.raw(ipv4ToBytes(yiaddr)), {
    note: isReply ? 'Adresse IPv4 allouée par le serveur DHCP' : undefined,
  });

  // Next Server IP (siaddr)
  const siaddr = opts.serverIp || '0.0.0.0';
  dhcp.field('Next Server IP Address', siaddr, () => dhcp.raw(ipv4ToBytes(siaddr)));

  // Relay Agent IP (giaddr)
  dhcp.field('Relay Agent IP Address', '0.0.0.0', () => dhcp.raw([0, 0, 0, 0]));

  // Client Hardware Address (chaddr - 16 bytes: 6 bytes MAC + 10 bytes padding)
  dhcp.field('Client MAC Address', opts.clientMac, () => {
    dhcp.raw(macToBytes(opts.clientMac));
    dhcp.raw(Array(10).fill(0));
  });

  // Server host name (64 bytes) & Boot file name (128 bytes)
  dhcp.field('Server Host Name', 'not given', () => dhcp.raw(Array(64).fill(0)), { hidden: true });
  dhcp.field('Boot File Name', 'not given', () => dhcp.raw(Array(128).fill(0)), { hidden: true });

  // Magic Cookie (0x63, 0x82, 0x53, 0x63)
  dhcp.field('Magic Cookie', 'DHCP (0x63825363)', () => dhcp.raw([0x63, 0x82, 0x53, 0x63]), {
    heading: true,
    note: 'Indicateur délimitant le début de la zone des options DHCP',
  });

  // Option 53: DHCP Message Type
  dhcp.field(`Option 53: DHCP Message Type`, `${opts.messageType} (${typeCode})`, () => {
    dhcp.u8(53);
    dhcp.u8(1);
    dhcp.u8(typeCode);
  });

  // Server identifier (Option 54)
  if (opts.serverIp) {
    dhcp.field('Option 54: Server Identifier', opts.serverIp, () => {
      dhcp.u8(54);
      dhcp.u8(4);
      dhcp.raw(ipv4ToBytes(opts.serverIp!));
    });
  }

  // Lease time (Option 51)
  if (opts.leaseTime) {
    dhcp.field('Option 51: IP Address Lease Time', `${opts.leaseTime} s (1 day)`, () => {
      dhcp.u8(51);
      dhcp.u8(4);
      dhcp.u32(opts.leaseTime!);
    });
  }

  // Subnet Mask (Option 1)
  if (opts.subnetMask) {
    dhcp.field('Option 1: Subnet Mask', opts.subnetMask, () => {
      dhcp.u8(1);
      dhcp.u8(4);
      dhcp.raw(ipv4ToBytes(opts.subnetMask!));
    });
  }

  // Router / Gateway (Option 3)
  if (opts.routerIp) {
    dhcp.field('Option 3: Router', opts.routerIp, () => {
      dhcp.u8(3);
      dhcp.u8(4);
      dhcp.raw(ipv4ToBytes(opts.routerIp!));
    });
  }

  // DNS Server (Option 6)
  if (opts.dnsIp) {
    dhcp.field('Option 6: Domain Name Server', opts.dnsIp, () => {
      dhcp.u8(6);
      dhcp.u8(4);
      dhcp.raw(ipv4ToBytes(opts.dnsIp!));
    });
  }

  // End Option (255)
  dhcp.field('Option 255: End', '255', () => dhcp.u8(255));

  return dhcp;
}
