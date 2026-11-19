export interface ProtocolMeta {
  id: string;
  name: string;
  full: string;
  group: 'core' | 'application' | 'security';
  layer: number;
}

export const PROTOCOLS_LIST: ProtocolMeta[] = [
  // Application (19)
  { id: 'http', name: 'HTTP', full: 'Hypertext Transfer Protocol', group: 'application', layer: 7 },
  { id: 'websocket', name: 'WebSocket', full: 'Two-way web messaging', group: 'application', layer: 7 },
  { id: 'webrtc', name: 'WebRTC', full: 'Browser video calls', group: 'application', layer: 7 },
  { id: 'sip', name: 'SIP', full: 'Internet phone calls', group: 'application', layer: 7 },
  { id: 'rtsp', name: 'RTSP', full: 'IP camera streams', group: 'application', layer: 7 },
  { id: 'rtmp', name: 'RTMP', full: 'Live streaming upload', group: 'application', layer: 7 },
  { id: 'dns', name: 'DNS', full: 'Domain Name System', group: 'application', layer: 7 },
  { id: 'dhcp', name: 'DHCP', full: 'Dynamic Host Configuration', group: 'application', layer: 7 },
  { id: 'ntp', name: 'NTP', full: 'Network Time Protocol', group: 'application', layer: 7 },
  { id: 'portal', name: 'Captive Portal', full: 'Hotel and café Wi-Fi logins', group: 'application', layer: 7 },
  { id: 'smtp', name: 'SMTP', full: 'Simple Mail Transfer Protocol', group: 'application', layer: 7 },
  { id: 'pop3', name: 'POP3', full: 'Post Office Protocol v3', group: 'application', layer: 7 },
  { id: 'imap', name: 'IMAP', full: 'Internet Message Access', group: 'application', layer: 7 },
  { id: 'ftp', name: 'FTP', full: 'File Transfer Protocol', group: 'application', layer: 7 },
  { id: 'smb', name: 'SMB', full: 'Windows file sharing', group: 'application', layer: 7 },
  { id: 'proxy', name: 'HTTP Proxy', full: 'Forward proxy and CONNECT', group: 'application', layer: 7 },
  { id: 'socks', name: 'SOCKS5', full: 'Socket Secure proxy', group: 'application', layer: 5 },
  { id: 'reverse', name: 'Reverse Proxy', full: 'TLS offloading and load balancing', group: 'application', layer: 7 },
  { id: 'modbus', name: 'Modbus', full: 'Talking to an industrial PLC', group: 'application', layer: 7 },

  // Security (9)
  { id: 'https', name: 'HTTPS', full: 'HTTP Secure', group: 'security', layer: 7 },
  { id: 'doh', name: 'DNS over HTTPS', full: 'Private DNS lookups', group: 'security', layer: 7 },
  { id: 'dnssec', name: 'DNSSEC', full: 'Signed DNS answers', group: 'security', layer: 7 },
  { id: 'wpa3', name: 'WPA3', full: 'Wi-Fi Protected Access 3', group: 'security', layer: 2 },
  { id: 'radius', name: 'RADIUS', full: '802.1X Enterprise Wi-Fi', group: 'security', layer: 2 },
  { id: 'ssh', name: 'SSH', full: 'Secure Shell remote login', group: 'security', layer: 7 },
  { id: 'tls', name: 'TLS/SSL', full: 'Transport Layer Security 1.3', group: 'security', layer: 6 },
  { id: 'wireguard', name: 'WireGuard', full: 'A modern, fast VPN', group: 'security', layer: 3 },
  { id: 'ipsec', name: 'IPsec', full: 'IKEv2 and ESP tunnels', group: 'security', layer: 3 },

  // Core (13)
  { id: 'osi', name: 'Modèle OSI', full: 'Interconnexion des Systèmes Ouverts (7 Couches)', group: 'core', layer: 7 },
  { id: 'tcpip', name: 'Modèle TCP/IP', full: 'Architecture DoD / IETF (4 Couches)', group: 'core', layer: 4 },
  { id: 'quic', name: 'QUIC', full: 'HTTP/3 over UDP', group: 'core', layer: 4 },
  { id: 'tcp', name: 'TCP', full: 'Transmission Control Protocol', group: 'core', layer: 4 },
  { id: 'udp', name: 'UDP', full: 'User Datagram Protocol', group: 'core', layer: 4 },
  { id: 'ip', name: 'IP', full: 'Internet Protocol (IPv4)', group: 'core', layer: 3 },
  { id: 'bgp', name: 'BGP', full: 'Routing between autonomous systems', group: 'core', layer: 7 },
  { id: 'ipv6', name: 'IPv6', full: 'Address setup and neighbour discovery', group: 'core', layer: 3 },
  { id: 'icmp', name: 'ICMP', full: 'Internet Control Message diagnostics', group: 'core', layer: 3 },
  { id: 'igmp', name: 'IGMP', full: 'Multicast and IPTV channels', group: 'core', layer: 3 },
  { id: 'ethernet', name: 'Ethernet', full: 'Frames and switches', group: 'core', layer: 2 },
  { id: 'pppoe', name: 'PPPoE', full: 'Broadband FAI logins', group: 'core', layer: 2 },
  { id: 'wifi', name: 'Wi-Fi', full: 'Joining a network (WPA2)', group: 'core', layer: 2 },
];
