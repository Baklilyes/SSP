/**
 * Convertit une chaîne IPv4 "192.168.1.1" en tableau de 4 octets
 */
export function ipv4ToBytes(ip: string): number[] {
  return ip.split('.').map(Number);
}

/**
 * Convertit une adresse MAC "aa:bb:cc:dd:ee:ff" en tableau de 6 octets
 */
export function macToBytes(mac: string): number[] {
  return mac.split(':').map((s) => parseInt(s, 16));
}

/**
 * Décompresse et convertit une adresse IPv6 en 16 octets
 */
export function ipv6ToBytes(ip: string): number[] {
  const [left, right] = ip.split('::');
  const leftParts = left ? left.split(':') : [];
  const rightParts = right !== undefined && right ? right.split(':') : [];
  const missing = 8 - leftParts.length - rightParts.length;
  const full = [
    ...leftParts,
    ...Array(missing).fill('0'),
    ...rightParts,
  ];
  return full.flatMap((h) => [parseInt(h, 16) >> 8, parseInt(h, 16) & 0xff]);
}

/**
 * Formate un nombre d'octets lisiblement (ex: "1.2 kB", "64 B")
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
