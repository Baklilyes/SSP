import { ProtocolDefinition } from '../simulation/types';
import allProtocolsData from '../../data/allProtocols.json';
import frTranslationsData from '../i18n/fr-translations.json';
import { osiBasicScenario, getOsiScenario } from '../simulation/scenarios/osi';
import { tcpipBasicScenario, getTcpipScenario } from '../simulation/scenarios/tcpip';

const frTranslations = frTranslationsData as Record<string, string>;

function translateText(text?: string): string {
  if (!text || typeof text !== 'string') return text || '';
  if (frTranslations[text]) return frTranslations[text];
  const normalized = text.replace(/https:\/\/ssp-academy\.com\/?/g, 'https://www.example.com');
  if (frTranslations[normalized]) {
    return frTranslations[normalized].replace(/https?:\/\/www\.example\.com\/?/g, 'https://ssp-academy.com/');
  }
  return text;
}

export function localizeProtocol(protocol: ProtocolDefinition, locale?: string): ProtocolDefinition {
  if (protocol.id === 'osi') {
    return getOsiScenario(locale);
  }
  if (protocol.id === 'tcpip') {
    return getTcpipScenario(locale);
  }
  if (locale !== 'fr') return protocol;

  return {
    ...protocol,
    title: translateText(protocol.title),
    overview: {
      ...protocol.overview,
      description: translateText(protocol.overview?.description),
      facts: protocol.overview?.facts?.map(([k, v]) => [translateText(k), translateText(v)]) || [],
    },
    outro: protocol.outro
      ? {
          ...protocol.outro,
          title: translateText(protocol.outro.title),
          desc: translateText(protocol.outro.desc),
          text: translateText(protocol.outro.text),
          facts: protocol.outro.facts?.map(([k, v]) => [translateText(k), translateText(v)]) || [],
        }
      : protocol.outro,
    steps: protocol.steps?.map((step) => ({
      ...step,
      title: translateText(step.title),
      desc: translateText(step.desc),
      detail: translateText(step.detail),
      facts: step.facts?.map(([k, v]) => [translateText(k), translateText(v)]) || [],
    })) || [],
    labels: protocol.labels
      ? Object.fromEntries(
          Object.entries(protocol.labels).map(([nodeId, arr]) => [
            nodeId,
            [translateText(arr[0]), translateText(arr[1])] as [string, string],
          ])
        )
      : protocol.labels,
    legend: protocol.legend
      ? protocol.legend.map(([col, leg]) => [col, translateText(leg)])
      : protocol.legend,
  };
}

export const PROTOCOLS_REGISTRY: Record<string, ProtocolDefinition> = {
  ...(allProtocolsData as unknown as Record<string, ProtocolDefinition>),
  osi: osiBasicScenario,
  tcpip: tcpipBasicScenario,
};

// Individual exports for backwards compatibility
export const osiProtocol = osiBasicScenario;
export const tcpipProtocol = tcpipBasicScenario;
export const tcpProtocol = PROTOCOLS_REGISTRY['tcp'];
export const udpProtocol = PROTOCOLS_REGISTRY['udp'];
export const ipProtocol = PROTOCOLS_REGISTRY['ip'];
export const icmpProtocol = PROTOCOLS_REGISTRY['icmp'];
export const ipv6Protocol = PROTOCOLS_REGISTRY['ipv6'];
export const quicProtocol = PROTOCOLS_REGISTRY['quic'];
export const bgpProtocol = PROTOCOLS_REGISTRY['bgp'];
export const ethernetProtocol = PROTOCOLS_REGISTRY['ethernet'];
export const wifiProtocol = PROTOCOLS_REGISTRY['wifi'];
export const pppoeProtocol = PROTOCOLS_REGISTRY['pppoe'];
export const igmpProtocol = PROTOCOLS_REGISTRY['igmp'];

export const tlsProtocol = PROTOCOLS_REGISTRY['tls'];
export const httpsProtocol = PROTOCOLS_REGISTRY['https'];
export const wireguardProtocol = PROTOCOLS_REGISTRY['wireguard'];
export const sshProtocol = PROTOCOLS_REGISTRY['ssh'];
export const dohProtocol = PROTOCOLS_REGISTRY['doh'];
export const dnssecProtocol = PROTOCOLS_REGISTRY['dnssec'];
export const wpa3Protocol = PROTOCOLS_REGISTRY['wpa3'];
export const radiusProtocol = PROTOCOLS_REGISTRY['radius'];
export const ipsecProtocol = PROTOCOLS_REGISTRY['ipsec'];

export const httpProtocol = PROTOCOLS_REGISTRY['http'];
export const websocketProtocol = PROTOCOLS_REGISTRY['websocket'];
export const webrtcProtocol = PROTOCOLS_REGISTRY['webrtc'];
export const sipProtocol = PROTOCOLS_REGISTRY['sip'];
export const rtspProtocol = PROTOCOLS_REGISTRY['rtsp'];
export const rtmpProtocol = PROTOCOLS_REGISTRY['rtmp'];
export const dnsProtocol = PROTOCOLS_REGISTRY['dns'];
export const dhcpProtocol = PROTOCOLS_REGISTRY['dhcp'];
export const ntpProtocol = PROTOCOLS_REGISTRY['ntp'];
export const portalProtocol = PROTOCOLS_REGISTRY['portal'];
export const smtpProtocol = PROTOCOLS_REGISTRY['smtp'];
export const pop3Protocol = PROTOCOLS_REGISTRY['pop3'];
export const imapProtocol = PROTOCOLS_REGISTRY['imap'];
export const ftpProtocol = PROTOCOLS_REGISTRY['ftp'];
export const smbProtocol = PROTOCOLS_REGISTRY['smb'];
export const proxyProtocol = PROTOCOLS_REGISTRY['proxy'];
export const socksProtocol = PROTOCOLS_REGISTRY['socks'];
export const reverseProtocol = PROTOCOLS_REGISTRY['reverse'];
export const modbusProtocol = PROTOCOLS_REGISTRY['modbus'];

export function getProtocol(id: string, locale?: string): ProtocolDefinition {
  const base = PROTOCOLS_REGISTRY[id] || PROTOCOLS_REGISTRY['http'];
  return localizeProtocol(base, locale);
}

export function getAllProtocols(locale?: string): ProtocolDefinition[] {
  return Object.values(PROTOCOLS_REGISTRY).map((p) => localizeProtocol(p, locale));
}
