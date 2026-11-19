/**
 * Calcul de la somme de contrôle Internet (RFC 1071).
 * Utilisé pour les en-têtes IPv4, TCP, UDP et ICMP.
 */
export function computeInternetChecksum(bytes: (number | null)[]): number {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    const high = bytes[i];
    const low = i + 1 < bytes.length ? bytes[i + 1] : 0;
    if (high === null || low === null) return 0;
    sum += (high << 8) | low;
  }
  while (sum > 0xffff) {
    sum = (sum & 0xffff) + (sum >>> 16);
  }
  return ~sum & 0xffff;
}

/**
 * Formate un nombre hexadécimal sur N caractères préfixé par 0x
 */
export function formatHex(val: number, pad = 4): string {
  return `0x${val.toString(16).padStart(pad, '0')}`;
}
