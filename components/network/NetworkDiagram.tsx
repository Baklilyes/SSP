'use client';

import React, { useState, useRef, useMemo } from 'react';
import { NodeId, PacketEvent } from '../../lib/simulation/types';
import { useTheme } from '../../hooks/useTheme';
import { ZoomIn, ZoomOut, RotateCcw, Info, X } from 'lucide-react';
import {
  renderRouter,
  renderLaptop,
  renderCloud,
  renderDnsServer,
  renderWebServer,
  renderSwitch,
  renderCamera,
  renderTvBox,
  LANES_MAP,
  ROUTES_MAP,
} from './IsometricDevices';

export interface NetworkDiagramProps {
  visibleNodes: NodeId[];
  protocolNodes?: NodeId[];
  labels?: Record<string, [string, string]>;
  activePacket: PacketEvent | null;
  shownPackets?: PacketEvent[];
  urlBarText?: string;
  isRendered?: boolean;
  onSelectNode?: (nodeId: NodeId) => void;
  onSelectPacket?: (packet: PacketEvent) => void;
  speed?: number;
  activeStep?: number;
  totalSteps?: number;
  stepTitle?: string;
  status?: string;
  theme?: 'dark' | 'light';
}

interface NodeConfig {
  pos: [number, number];
  labelPos: [number, number];
  textAnchor: 'start' | 'end' | 'middle';
  name: string;
  ip: string;
  renderSvg: (x: number, y: number) => string;
}

export const NODE_DETAILS: Record<string, { role: string; desc: string; mac?: string }> = {
  client: {
    role: 'Hôte Client (Mohamed)',
    desc: 'Station de travail ou navigateur web initiant les requêtes réseau.',
    mac: '00:1A:2B:3C:4D:5E',
  },
  router: {
    role: 'Passerelle / Routeur NAT',
    desc: 'Routeur domestique assurant la translation d’adresses NAT et le routage LAN vers WAN.',
    mac: '00:22:33:44:55:66',
  },
  internet: {
    role: 'Nuage Internet (WAN / Dorsale)',
    desc: 'Interconnexion mondiale des réseaux IP et fournisseurs d’accès (Transit / BGP).',
  },
  dns: {
    role: 'Résolveur DNS Récursif',
    desc: 'Serveur résolveur DNS (ex: 8.8.8.8) traduisant les noms de domaine en adresses IP.',
    mac: '00:50:56:C0:00:08',
  },
  web: {
    role: 'Serveur Web / Applicatif',
    desc: 'Serveur distant hébergeant le contenu web, traitant les requêtes HTTP/TLS/TCP.',
    mac: '00:50:56:C0:00:10',
  },
  switch: {
    role: 'Commutateur L2 (Switch Ethernet)',
    desc: 'Équipement de niveau 2 apprenant les adresses MAC et commutant les trames sur les ports.',
  },
  cam: {
    role: 'Caméra IP (IoT / RTSP)',
    desc: 'Caméra réseau diffusant des flux vidéo en direct (RTSP / RTP).',
  },
  stb: {
    role: 'Décodeur TV (Multicast / IGMP)',
    desc: 'Boîtier multimédia souscrivant aux flux vidéo multicast via le protocole IGMP.',
  },
  lan: {
    role: 'Serveur Local / NAS',
    desc: 'Serveur du réseau local hébergeant des partages de fichiers SMB ou services internes.',
  },
  isp: {
    role: 'Routeur FAI / Opérateur',
    desc: 'Routeur de bordure du fournisseur d’accès Internet connectant l’accès client.',
  },
  transit: {
    role: 'Routeur de Transit BGP',
    desc: 'Routeur de réseau dorsal reliant différents systèmes autonomes (AS).',
  },
  hosting: {
    role: 'Hébergeur Cloud / Datacenter',
    desc: 'Infrastructure hébergeant les serveurs applicatifs et bases de données.',
  },
  root: {
    role: 'Serveur DNS Racine (Root Nameserver)',
    desc: 'Serveur DNS de la zone racine orientant les requêtes vers les TLD (.com, .net...).',
  },
  tld: {
    role: 'Serveur DNS TLD (.com / .net)',
    desc: 'Serveur DNS autoritaire pour le domaine de premier niveau.',
  },
  auth: {
    role: 'Serveur DNS Autoritaire',
    desc: 'Serveur détenant les enregistrements définitifs (zone autoritaire) du domaine.',
  },
  mx: {
    role: 'Serveur Mail (SMTP / MX)',
    desc: 'Relais et serveur de messagerie gérant la réception et l’envoi de courriels.',
  },
  relay: {
    role: 'Proxy / Relais Applicatif',
    desc: 'Serveur mandataire relayant et filtrant les connexions client.',
  },
  app: {
    role: 'Serveur Applicatif interne',
    desc: 'Service backend traitant les requêtes API et logiques métier.',
  },
  peer: {
    role: 'Pair Distant (Bob)',
    desc: 'Client distant communiquant de pair à pair (WebRTC, SIP, P2P).',
    mac: '00:CC:DD:EE:FF:11',
  },
  remote: {
    role: 'Routeur Distant',
    desc: 'Passerelle du réseau distant hébergeant le pair ou le serveur distant.',
  },
  ap: {
    role: 'Point d’Accès Wi-Fi (802.11)',
    desc: 'Borne Wi-Fi gérant l’association sans fil et l’authentification WPA2/WPA3.',
  },
};

const COLOR_MAP: Record<string, string> = {
  green: '#12a56b',
  blue: '#1f6fe8',
  amber: '#f2ac0a',
  violet: '#7656e0',
  red: '#ef4444',
  navy: '#0b3aa8',
};

export const ISOMETRIC_NODES: Record<string, NodeConfig> = {
  client: {
    pos: [240, 446],
    labelPos: [73, 494],
    textAnchor: 'start',
    name: 'Client',
    ip: '192.168.1.10',
    renderSvg: (x, y) => renderLaptop(x, y),
  },
  router: {
    pos: [440, 339],
    labelPos: [407, 426],
    textAnchor: 'start',
    name: 'Routeur',
    ip: '192.168.1.1',
    renderSvg: (x, y) => renderRouter(x, y, true),
  },
  internet: {
    pos: [728, 460],
    labelPos: [726, 524],
    textAnchor: 'start',
    name: 'Internet',
    ip: '',
    renderSvg: (x, y) => renderCloud(x, y),
  },
  dns: {
    pos: [701, 185],
    labelPos: [654, 160],
    textAnchor: 'end',
    name: 'Résolveur DNS',
    ip: '8.8.8.8',
    renderSvg: (x, y) => renderDnsServer(x, y),
  },
  web: {
    pos: [812, 203],
    labelPos: [773, 106],
    textAnchor: 'start',
    name: 'Serveur web',
    ip: '203.0.113.10',
    renderSvg: (x, y) => renderWebServer(x, y),
  },
  switch: {
    pos: [262, 314],
    labelPos: [214, 300],
    textAnchor: 'end',
    name: 'Switch L2',
    ip: '8 ports',
    renderSvg: (x, y) => renderSwitch(x, y),
  },
  cam: {
    pos: [330, 218],
    labelPos: [282, 186],
    textAnchor: 'end',
    name: 'Caméra IP',
    ip: '192.168.1.64',
    renderSvg: (x, y) => renderCamera(x, y),
  },
  stb: {
    pos: [324, 191],
    labelPos: [272, 170],
    textAnchor: 'end',
    name: 'Décodeur TV',
    ip: '192.168.1.30',
    renderSvg: (x, y) => renderTvBox(x, y),
  },
  lan: {
    pos: [330, 215],
    labelPos: [288, 192],
    textAnchor: 'end',
    name: 'Serveur Local',
    ip: '192.168.1.20',
    renderSvg: (x, y) => renderDnsServer(x, y),
  },
  isp: {
    pos: [595, 430],
    labelPos: [562, 517],
    textAnchor: 'start',
    name: 'Routeur FAI',
    ip: 'AS 64500',
    renderSvg: (x, y) => renderRouter(x, y, false),
  },
  transit: {
    pos: [755, 330],
    labelPos: [690, 288],
    textAnchor: 'start',
    name: 'Routeur Transit',
    ip: 'AS 64510',
    renderSvg: (x, y) => renderRouter(x, y, false),
  },
  hosting: {
    pos: [880, 430],
    labelPos: [847, 517],
    textAnchor: 'start',
    name: 'Hébergeur Cloud',
    ip: 'AS 64511',
    renderSvg: (x, y) => renderRouter(x, y, false),
  },
  bng: {
    pos: [700, 462],
    labelPos: [667, 549],
    textAnchor: 'start',
    name: 'Serveur BNG',
    ip: '198.51.100.1',
    renderSvg: (x, y) => renderRouter(x, y, false),
  },
  root: {
    pos: [960, 300],
    labelPos: [925, 228],
    textAnchor: 'start',
    name: 'DNS Racine',
    ip: '198.41.0.4',
    renderSvg: (x, y) => renderDnsServer(x, y),
  },
  tld: {
    pos: [1005, 430],
    labelPos: [970, 360],
    textAnchor: 'start',
    name: 'DNS TLD (.com)',
    ip: '192.5.6.30',
    renderSvg: (x, y) => renderDnsServer(x, y),
  },
  auth: {
    pos: [960, 575],
    labelPos: [925, 505],
    textAnchor: 'start',
    name: 'DNS Autoritaire',
    ip: '198.51.100.53',
    renderSvg: (x, y) => renderDnsServer(x, y),
  },
  mx: {
    pos: [1010, 380],
    labelPos: [968, 286],
    textAnchor: 'start',
    name: 'Serveur Mail',
    ip: '198.51.100.25',
    renderSvg: (x, y) => renderWebServer(x, y),
  },
  relay: {
    pos: [701, 185],
    labelPos: [654, 160],
    textAnchor: 'end',
    name: 'Proxy / Relais',
    ip: '192.0.2.80',
    renderSvg: (x, y) => renderDnsServer(x, y),
  },
  app: {
    pos: [985, 300],
    labelPos: [1046, 316],
    textAnchor: 'start',
    name: 'Serveur d’App',
    ip: '10.0.0.20',
    renderSvg: (x, y) => renderWebServer(x, y),
  },
  peer: {
    pos: [1160, 430],
    labelPos: [1095, 525],
    textAnchor: 'start',
    name: 'Pair distant',
    ip: '192.168.0.23',
    renderSvg: (x, y) =>
      `<g transform="translate(${2 * 1160} 0) scale(-1 1)">${renderLaptop(x, y)}</g>`,
  },
  remote: {
    pos: [985, 330],
    labelPos: [1050, 330],
    textAnchor: 'start',
    name: 'Routeur Distant',
    ip: '198.51.100.200',
    renderSvg: (x, y) => renderRouter(x, y, true),
  },
  ap: {
    pos: [380, 240],
    labelPos: [340, 310],
    textAnchor: 'start',
    name: 'Point d’Accès Wi-Fi',
    ip: 'WPA2/WPA3',
    renderSvg: (x, y) => renderRouter(x, y, true),
  },
};

/** Extrait et formate les détails utiles de la charge utile pour l'étiquette inférieure */
function getPacketPayload(packet: PacketEvent): string | null {
  const anyPkt = packet as any;
  if (anyPkt.payload) {
    if (Array.isArray(anyPkt.payload)) return anyPkt.payload.join(' ');
    return String(anyPkt.payload);
  }

  const info = packet.row?.info || '';

  // 1. Détection TCP Seq / Ack
  const seqMatch = info.match(/Seq[=:]\s*(\d+)/i);
  const ackMatch = info.match(/Ack[=:]\s*(\d+)/i);
  if (seqMatch && ackMatch) {
    const s = parseInt(seqMatch[1], 10);
    const a = parseInt(ackMatch[1], 10);
    const sStr = s > 1000 ? (s % 10000 === 1 ? '1' : String(s)) : String(s);
    const aStr = a > 1000 ? (a % 10000 === 1 ? '1' : String(a)) : String(a);
    return `seq=${sStr} ack=${aStr}`;
  } else if (seqMatch) {
    const s = parseInt(seqMatch[1], 10);
    const sStr = s > 1000 ? (s % 10000 === 0 ? '0' : String(s)) : String(s);
    return `seq=${sStr}`;
  } else if (ackMatch) {
    const a = parseInt(ackMatch[1], 10);
    const aStr = a > 1000 ? (a % 10000 === 1 ? '1' : String(a)) : String(a);
    return `ack=${aStr}`;
  }

  // 2. Détection HTTP
  const httpMatch = info.match(/^(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s+([^\s]+)/i);
  if (httpMatch) {
    return `${httpMatch[1]} ${httpMatch[2]}`;
  }
  const httpRespMatch = info.match(/^HTTP\/[\d.]+\s+(\d+\s+[A-Za-z ]+)/i);
  if (httpRespMatch) {
    return httpRespMatch[1].trim();
  }

  // 3. Détection DNS
  const dnsMatch = info.match(/Standard query (?:response )?(?:0x[0-9a-fA-F]+ )?([A-Z0-9]+)\s+([^\s]+)/i);
  if (dnsMatch) {
    return `${dnsMatch[1]} ${dnsMatch[2]}`;
  }

  // 4. Détail générique court
  if (info && info.length < 24 && info !== packet.label) {
    return info;
  }

  return null;
}

export function NetworkDiagram({
  visibleNodes,
  protocolNodes,
  labels,
  activePacket,
  shownPackets,
  urlBarText,
  isRendered,
  onSelectNode,
  onSelectPacket,
  speed = 1,
  activeStep = 0,
  totalSteps = 1,
  stepTitle,
  status = 'idle',
  theme: propTheme,
}: NetworkDiagramProps) {
  const { theme: hookTheme } = useTheme();
  const currentTheme = propTheme || hookTheme || 'dark';
  const isDark = currentTheme === 'dark';

  // États interactifs : sélection de nœud, survol et zoom/pan
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeId | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Si on clique sur un élément interactif (nœud ou paquet), ne pas initier le pan de fond
    const target = e.target as HTMLElement;
    if (target.closest('.device-group') || target.closest('.packet-interactive-group')) {
      return;
    }
    if (e.button === 0) {
      setIsDragging(true);
      dragOriginRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragOriginRef.current.x,
      y: e.clientY - dragOriginRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoom((z) => Math.min(2.5, Math.max(0.6, +(z + delta).toFixed(2))));
    }
  };

  const handleNodeClick = (id: NodeId) => {
    const next = selectedNode === id ? null : id;
    setSelectedNode(next);
    if (onSelectNode) onSelectNode(id);
  };

  // 1. Calcul des nœuds actifs de la scène
  const effectiveNodes = React.useMemo(() => {
    const nodes = new Set<string>();

    // Nœuds du protocole ou nœuds visibles
    if (protocolNodes && protocolNodes.length > 0) {
      protocolNodes.forEach((n) => nodes.add(n));
    } else {
      visibleNodes.forEach((n) => nodes.add(n));
    }

    // Le socle classique de topologie (Client, Routeur, Web) inclut naturellement Internet et DNS
    if (nodes.has('client') && nodes.has('web')) {
      nodes.add('router');
      nodes.add('internet');
      nodes.add('dns');
    } else if (nodes.has('client') && nodes.has('dns')) {
      nodes.add('router');
      nodes.add('internet');
    }

    // S'assurer que le nœud d'émission et de réception du paquet actif sont inclus
    if (activePacket) {
      nodes.add(activePacket.from);
      nodes.add(activePacket.to);
    }

    // Baseline minimum si vide
    if (nodes.size === 0) {
      ['client', 'router', 'internet', 'dns', 'web'].forEach((n) => nodes.add(n));
    }

    return Array.from(nodes) as NodeId[];
  }, [protocolNodes, visibleNodes, activePacket]);

  // 2. Détermination dynamique du ViewBox selon l'étendue des nœuds
  const viewBox = React.useMemo(() => {
    const hasFarNodes = effectiveNodes.some((n) =>
      ['root', 'tld', 'auth', 'peer', 'app', 'mx', 'remote'].includes(n)
    );
    if (hasFarNodes) {
      return '45 66 1160 550';
    }
    // ViewBox officiel de référence (index.js : ew = [45, 66, 810, 490])
    return '45 66 810 490';
  }, [effectiveNodes]);

  // 3. Calcul de la route active pour le paquet en cours
  const activeRoute = React.useMemo(() => {
    if (!activePacket) return null;
    const key = `${activePacket.from}>${activePacket.to}`;
    const reverseKey = `${activePacket.to}>${activePacket.from}`;

    const laneNames =
      ROUTES_MAP[key] ||
      (LANES_MAP[key] ? [key] : null) ||
      (ROUTES_MAP[reverseKey] ? ROUTES_MAP[reverseKey] : null);

    const activeColor = COLOR_MAP[activePacket.color] || '#12a56b';

    const hops: {
      lane: string;
      from: NodeId;
      to: NodeId;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      length: number;
      durationSec: number;
      pauseAfterSec: number;
      startTimeSec: number;
      endTimeSec: number;
    }[] = [];

    if (laneNames && laneNames.length > 0) {
      const rawHops: {
        lane: string;
        from: NodeId;
        to: NodeId;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        length: number;
      }[] = [];

      for (const lane of laneNames) {
        const coords = LANES_MAP[lane];
        if (coords) {
          const [from, to] = lane.split('>') as [NodeId, NodeId];
          const length = Math.hypot(coords[2] - coords[0], coords[3] - coords[1]);
          rawHops.push({
            lane,
            from,
            to,
            x1: coords[0],
            y1: coords[1],
            x2: coords[2],
            y2: coords[3],
            length,
          });
        }
      }

      if (rawHops.length > 0) {
        const laneCount = rawHops.length;
        // Vitesse rigoureusement synchronisée : 1 saut: 1.1s, 2 sauts: 1.35s, 3 sauts: 1.55s
        const flightSec = laneCount === 1 ? 1.1 : laneCount === 2 ? 1.35 : 1.55;
        const totalFlightSec = flightSec / (speed || 1);
        const pauseSec = laneCount > 1 ? Math.min(0.12, (totalFlightSec * 0.15) / (laneCount - 1)) : 0;
        const travelSec = totalFlightSec - (laneCount - 1) * pauseSec;
        const totalLength = rawHops.reduce((sum, h) => sum + h.length, 0);

        let currentStart = 0;
        for (let i = 0; i < laneCount; i++) {
          const h = rawHops[i];
          const hopDurationSec = travelSec * (h.length / totalLength);
          const pauseAfterSec = i < laneCount - 1 ? pauseSec : 0;
          hops.push({
            ...h,
            durationSec: hopDurationSec,
            pauseAfterSec,
            startTimeSec: currentStart,
            endTimeSec: currentStart + hopDurationSec,
          });
          currentStart += hopDurationSec + pauseAfterSec;
        }
      }
    }

    // Fallback : trajet direct entre les deux nœuds si non cartographié
    if (hops.length === 0) {
      const fromCfg = ISOMETRIC_NODES[activePacket.from];
      const toCfg = ISOMETRIC_NODES[activePacket.to];
      if (fromCfg && toCfg) {
        const length = Math.hypot(toCfg.pos[0] - fromCfg.pos[0], toCfg.pos[1] - fromCfg.pos[1]);
        const durationSec = 1.35 / (speed || 1);
        hops.push({
          lane: key,
          from: activePacket.from,
          to: activePacket.to,
          x1: fromCfg.pos[0],
          y1: fromCfg.pos[1],
          x2: toCfg.pos[0],
          y2: toCfg.pos[1],
          length,
          durationSec,
          pauseAfterSec: 0,
          startTimeSec: 0,
          endTimeSec: durationSec,
        });
      }
    }

    if (hops.length > 0) {
      const lastHop = hops[hops.length - 1];
      const totalFlightSec = lastHop.endTimeSec + lastHop.pauseAfterSec;

      return {
        activeLanes: new Set(hops.map((h) => h.lane)),
        hops,
        color: activeColor,
        durationSec: totalFlightSec,
        duration: `${totalFlightSec.toFixed(2)}s`,
      };
    }

    return null;
  }, [activePacket, speed]);

  // 4. Liaisons visibles à tracer
  const visibleLanes = React.useMemo(() => {
    const lanes: {
      key: string;
      coords: [number, number, number, number];
      isActive: boolean;
      activeColor?: string;
    }[] = [];

    for (const [key, coords] of Object.entries(LANES_MAP)) {
      const [from, to] = key.split('>') as [NodeId, NodeId];
      if (effectiveNodes.includes(from) && effectiveNodes.includes(to)) {
        const isLaneActive = !!activeRoute?.activeLanes.has(key);
        lanes.push({
          key,
          coords,
          isActive: isLaneActive,
          activeColor: isLaneActive ? activeRoute?.color : undefined,
        });
      }
    }

    return lanes;
  }, [effectiveNodes, activeRoute]);

  // 5. Calcul de l'étiquette et du compartiment du paquet en transit
  const packetBadge = React.useMemo(() => {
    if (!activePacket || !activeRoute) return null;
    const label = activePacket.label || 'PKT';
    const payload = getPacketPayload(activePacket);
    const color = activeRoute.color;

    const payloadLines: string[] = Array.isArray(activePacket.payload)
      ? activePacket.payload
      : typeof activePacket.payload === 'string'
      ? [activePacket.payload]
      : payload
      ? [payload]
      : [];

    const maxLineLen = Math.max(
      label.length * 8.5,
      ...payloadLines.map((l) => l.length * 6.5)
    );
    const width = Math.max(56, maxLineLen + 20);
    const headerHeight = 20;
    const bodyHeight = payloadLines.length > 0 ? payloadLines.length * 15 + 4 : 0;
    const totalHeight = headerHeight + bodyHeight;

    return {
      label,
      payloadLines,
      color,
      width,
      headerHeight,
      bodyHeight,
      totalHeight,
    };
  }, [activePacket, activeRoute]);

  // 6. Gestionnaire de déplacement rigoureux le long des flèches et impulsions aux équipements
  const packetGroupRef = React.useRef<SVGGElement>(null);
  const trail0Ref = React.useRef<SVGCircleElement>(null);
  const trail1Ref = React.useRef<SVGCircleElement>(null);
  const trail2Ref = React.useRef<SVGCircleElement>(null);

  const [pulseEffects, setPulseEffects] = React.useState<{
    id: string;
    pos: [number, number];
    color: string;
    isDest: boolean;
  }[]>([]);
  const [clignoteNode, setClignoteNode] = React.useState<{
    nodeId: NodeId;
    color: string;
    key: number;
  } | null>(null);

  // Nettoyage automatique des ondes de choc après leur diffusion
  React.useEffect(() => {
    if (pulseEffects.length === 0) return;
    const timer = setTimeout(() => {
      setPulseEffects((prev) => prev.slice(1));
    }, 650);
    return () => clearTimeout(timer);
  }, [pulseEffects]);

  // Animation continue et synchrone de la boule le long des flèches
  React.useEffect(() => {
    if (!activePacket || !activeRoute || activeRoute.hops.length === 0) {
      if (packetGroupRef.current) {
        packetGroupRef.current.style.opacity = '0';
        packetGroupRef.current.style.display = 'none';
      }
      return;
    }

    const hops = activeRoute.hops;
    const totalFlightSec = activeRoute.durationSec;
    const activeColor = activeRoute.color;

    // Positionnement immédiat au point de départ de la première flèche
    const firstHop = hops[0];
    if (packetGroupRef.current) {
      packetGroupRef.current.style.display = '';
      packetGroupRef.current.style.opacity = '1';
      packetGroupRef.current.setAttribute(
        'transform',
        `translate(${firstHop.x1.toFixed(1)}, ${firstHop.y1.toFixed(1)})`
      );
    }
    if (trail0Ref.current) {
      trail0Ref.current.setAttribute('cx', '0');
      trail0Ref.current.setAttribute('cy', '0');
    }
    if (trail1Ref.current) {
      trail1Ref.current.setAttribute('cx', '0');
      trail1Ref.current.setAttribute('cy', '0');
    }
    if (trail2Ref.current) {
      trail2Ref.current.setAttribute('cx', '0');
      trail2Ref.current.setAttribute('cy', '0');
    }

    const startPerfTime = performance.now();
    let pauseStart: number | null = status === 'paused' ? performance.now() : null;
    let accumulatedPausedMs = 0;
    const triggeredHops = new Set<number>();
    let destTriggered = false;
    let animFrameId: number;

    const tick = () => {
      const now = performance.now();

      if (status === 'paused') {
        if (pauseStart === null) {
          pauseStart = now;
        }
        animFrameId = requestAnimationFrame(tick);
        return;
      } else if (pauseStart !== null) {
        accumulatedPausedMs += now - pauseStart;
        pauseStart = null;
      }

      const elapsedSec = Math.max(
        0,
        (now - startPerfTime - accumulatedPausedMs) / 1000
      );

      // Trajet de bout en bout terminé
      if (elapsedSec >= totalFlightSec) {
        const lastHop = hops[hops.length - 1];
        if (packetGroupRef.current) {
          packetGroupRef.current.setAttribute(
            'transform',
            `translate(${lastHop.x2.toFixed(1)}, ${lastHop.y2.toFixed(1)})`
          );
        }
        if (!destTriggered) {
          destTriggered = true;
          const destConfig = ISOMETRIC_NODES[activePacket.to];
          if (destConfig) {
            const pId = `dest-${activePacket.to}-${Date.now()}`;
            setPulseEffects((prev) => [
              ...prev.slice(-4),
              { id: pId, pos: destConfig.pos, color: activeColor, isDest: true },
            ]);
            setClignoteNode({ nodeId: activePacket.to, color: activeColor, key: Date.now() });
          }
        }
        return;
      }

      // Détermination du saut courant
      let currentHopIdx = 0;
      for (let i = 0; i < hops.length; i++) {
        if (
          elapsedSec >= hops[i].startTimeSec &&
          elapsedSec < hops[i].endTimeSec + hops[i].pauseAfterSec
        ) {
          currentHopIdx = i;
          break;
        }
        if (i === hops.length - 1) {
          currentHopIdx = i;
        }
      }

      const hop = hops[currentHopIdx];
      let p = 0;

      if (elapsedSec <= hop.endTimeSec) {
        p = hop.durationSec > 0 ? (elapsedSec - hop.startTimeSec) / hop.durationSec : 1;
        p = Math.max(0, Math.min(1, p));
      } else {
        p = 1;
        if (!triggeredHops.has(currentHopIdx)) {
          triggeredHops.add(currentHopIdx);
          const interNodeConfig = ISOMETRIC_NODES[hop.to];
          if (interNodeConfig) {
            const pId = `inter-${hop.to}-${Date.now()}`;
            setPulseEffects((prev) => [
              ...prev.slice(-4),
              { id: pId, pos: interNodeConfig.pos, color: activeColor, isDest: false },
            ]);
          }
        }
      }

      // Déplacement rigoureux et continu le long de la flèche
      const curX = hop.x1 + (hop.x2 - hop.x1) * p;
      const curY = hop.y1 + (hop.y2 - hop.y1) * p;

      if (packetGroupRef.current) {
        packetGroupRef.current.setAttribute(
          'transform',
          `translate(${curX.toFixed(1)}, ${curY.toFixed(1)})`
        );
      }

      // Positionnement des points de traînée le long de la flèche
      const len = Math.max(1, hop.length);
      const ux = (hop.x2 - hop.x1) / len;
      const uy = (hop.y2 - hop.y1) / len;

      const d0 = Math.min(10, p * len);
      const d1 = Math.min(20, p * len);
      const d2 = Math.min(30, p * len);

      if (trail0Ref.current) {
        trail0Ref.current.setAttribute('cx', (-ux * d0).toFixed(1));
        trail0Ref.current.setAttribute('cy', (-uy * d0).toFixed(1));
      }
      if (trail1Ref.current) {
        trail1Ref.current.setAttribute('cx', (-ux * d1).toFixed(1));
        trail1Ref.current.setAttribute('cy', (-uy * d1).toFixed(1));
      }
      if (trail2Ref.current) {
        trail2Ref.current.setAttribute('cx', (-ux * d2).toFixed(1));
        trail2Ref.current.setAttribute('cy', (-uy * d2).toFixed(1));
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [activePacket, activeRoute, speed, status]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full ${
        isDark ? 'bg-[#0b1020]' : 'bg-[#fdfdfe]'
      } select-none flex items-center justify-center overflow-hidden ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Badge indicateur de l'étape active dans la topologie (commence toujours par 1 et suit les étapes) */}
      {!selectedNode && status !== 'done' && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-orange-200/80 dark:border-orange-500/30 shadow-sm select-none">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              status === 'done'
                ? 'bg-emerald-500'
                : 'bg-[#ff7c28] animate-pulse'
            }`}
          />
          <span className="font-bold font-mono text-xs text-[#ea580c] dark:text-[#ff7c28]">
            {status === 'done'
              ? `✓ Terminé (${totalSteps}/${totalSteps})`
              : `Étape ${activeStep + 1} / ${totalSteps}`}
          </span>
          {stepTitle && (
            <span className="text-[11px] text-[#64748b] dark:text-slate-400 font-medium truncate max-w-[280px]">
              · {stepTitle}
            </span>
          )}
          {activePacket && (
            <span className="text-[10.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-[#ea580c] dark:text-[#ff7c28] border border-orange-500/30 shrink-0">
              {activePacket.label}
            </span>
          )}
        </div>
      )}

      {/* Contrôles de navigation interactifs (Zoom, Pan, Réinitialiser) - positionnés en bas à droite pour ne pas recouvrir le sélecteur Topologie/Séquence */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-[#c5d0e6] dark:border-slate-700 shadow-sm">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom avant (+)"
          className="w-7 h-7 flex items-center justify-center rounded text-[#1e255e] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom arrière (-)"
          className="w-7 h-7 flex items-center justify-center rounded text-[#1e255e] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono px-1 font-bold text-[#1e255e] dark:text-slate-300 min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={handleResetView}
          title="Réinitialiser la vue (100%)"
          className="w-7 h-7 flex items-center justify-center rounded text-[#1e255e] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fiche détaillée de l'équipement sélectionné */}
      {selectedNode && (
        <div className="absolute top-3 left-3 z-30 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-sky-500/50 rounded-xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 select-none">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  visibleNodes.includes(selectedNode) ? 'bg-emerald-500 shadow-xs' : 'bg-slate-400'
                }`}
              />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e255e] dark:text-slate-100">
                  {labels?.[selectedNode]?.[0] || ISOMETRIC_NODES[selectedNode]?.name || selectedNode}
                </h4>
                <span className="text-[10px] font-mono text-[#64748b] dark:text-slate-400">
                  {labels?.[selectedNode]?.[1] || ISOMETRIC_NODES[selectedNode]?.ip}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rôle réseau
              </span>
              <p className="text-xs text-[#1e255e] dark:text-slate-200 font-semibold mt-0.5">
                {NODE_DETAILS[selectedNode]?.role || 'Équipement de transmission'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Description
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                {NODE_DETAILS[selectedNode]?.desc || 'Participe aux échanges de paquets du protocole.'}
              </p>
            </div>
            {NODE_DETAILS[selectedNode]?.mac && (
              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Adresse MAC :</span>
                <span className="font-mono text-[#1e255e] dark:text-slate-200 font-bold">
                  {NODE_DETAILS[selectedNode].mac}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">État du nœud :</span>
              <span
                className={`font-bold ${
                  visibleNodes.includes(selectedNode) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                {visibleNodes.includes(selectedNode) ? 'Actif dans l’étape' : 'En attente / Inactif'}
              </span>
            </div>
          </div>
        </div>
      )}

      <svg
        viewBox={viewBox}
        className="w-full h-full max-h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Marqueurs de flèches directionnelles */}
          <marker
            id="head-idle"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6.2"
            markerHeight="6.2"
            orient="auto-start-reverse"
          >
            <path d="M0,0.6 L10,5 L0,9.4 Z" fill={isDark ? '#273a66' : '#bccae6'} />
          </marker>

          <marker
            id="head-active"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6.2"
            markerHeight="6.2"
            orient="auto-start-reverse"
          >
            <path d="M0,0.6 L10,5 L0,9.4 Z" fill={activeRoute?.color || '#12a56b'} />
          </marker>

          {/* Marqueur pour liaisons survolées/sélectionnées */}
          <marker
            id="head-hover"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6.2"
            markerHeight="6.2"
            orient="auto-start-reverse"
          >
            <path d="M0,0.6 L10,5 L0,9.4 Z" fill={isDark ? '#38bdf8' : '#0284c7'} />
          </marker>

          {/* Grille technique orthogonale (lignes carrées 64px) selon la charte graphique */}
          <pattern
            id="iso-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke={isDark ? '#172342' : '#e2e8f0'}
              strokeWidth="1"
            />
          </pattern>

          {/* Vignette radiale adoucissant les contours vers le fond */}
          <radialGradient
            id="grid-vignette"
            gradientUnits="userSpaceOnUse"
            cx="450"
            cy="311"
            r="600"
          >
            <stop offset="0" stopColor={isDark ? '#0b1020' : '#f8fafc'} stopOpacity="0" />
            <stop offset="0.65" stopColor={isDark ? '#0b1020' : '#f8fafc'} stopOpacity="0.3" />
            <stop offset="1" stopColor={isDark ? '#0b1020' : '#f8fafc'} stopOpacity="0.8" />
          </radialGradient>

          {/* Ombres douces des équipements au sol */}
          <linearGradient id="shadow-fade" x1="0" y1="0.25" x2="1" y2="0.75">
            <stop offset="0" stopColor={isDark ? '#000000' : '#8d9ab3'} stopOpacity={isDark ? 0.6 : 0.3} />
            <stop offset="1" stopColor={isDark ? '#000000' : '#8d9ab3'} stopOpacity="0" />
          </linearGradient>

          <radialGradient id="shadow-round">
            <stop offset="0" stopColor={isDark ? '#000000' : '#8d9ab3'} stopOpacity={isDark ? 0.5 : 0.26} />
            <stop offset="1" stopColor={isDark ? '#000000' : '#8d9ab3'} stopOpacity="0" />
          </radialGradient>

          {/* Dégradés des faces isométriques 3D */}
          <linearGradient id="face-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={isDark ? '#1c2a52' : '#f8fbff'} />
            <stop offset="1" stopColor={isDark ? '#162244' : '#e6eefc'} />
          </linearGradient>
          <linearGradient id="face-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={isDark ? '#141e3d' : '#eff5ff'} />
            <stop offset="1" stopColor={isDark ? '#101833' : '#dae5fb'} />
          </linearGradient>
          <linearGradient id="face-right" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={isDark ? '#111933' : '#e0eafc'} />
            <stop offset="1" stopColor={isDark ? '#0c1226' : '#c7d7f6'} />
          </linearGradient>
        </defs>

        {/* Groupe interactif appliquant le zoom et le déplacement panoramique (Pan) */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{
            transformOrigin: '580px 310px',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          {/* 1. Fond quadrillé technique selon la charte */}
          <rect x="-800" y="-600" width="2800" height="2000" fill={isDark ? '#0b1020' : '#f8fafc'} />
          <rect x="-800" y="-600" width="2800" height="2000" fill="url(#iso-grid)" />
          <rect x="-800" y="-600" width="2800" height="2000" fill="url(#grid-vignette)" />

          {/* 2. Couche des liaisons doubles parallèles (Lanes) */}
          <g className="lanes-layer">
            {visibleLanes.map(({ key, coords, isActive, activeColor }) => {
              const [x1, y1, x2, y2] = coords;
              const [from, to] = key.split('>') as [NodeId, NodeId];
              const isConnectedToHoveredOrSelected =
                (hoveredNode && (from === hoveredNode || to === hoveredNode)) ||
                (selectedNode && (from === selectedNode || to === selectedNode));

              return (
                <path
                  key={`lane-${key}`}
                  d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`}
                  fill="none"
                  stroke={
                    isActive
                      ? activeColor || '#12a56b'
                      : isConnectedToHoveredOrSelected
                      ? isDark ? '#38bdf8' : '#0284c7'
                      : isDark ? '#273a66' : '#bccae6'
                  }
                  strokeWidth={isActive ? 2.4 : isConnectedToHoveredOrSelected ? 2.2 : 1.7}
                  strokeDasharray={isActive ? '5 3' : isConnectedToHoveredOrSelected ? '4 2' : '4 4'}
                  markerEnd={
                    isActive
                      ? 'url(#head-active)'
                      : isConnectedToHoveredOrSelected
                      ? 'url(#head-hover)'
                      : 'url(#head-idle)'
                  }
                  className="transition-colors duration-200"
                />
              );
            })}
          </g>

          {/* 3. Matériel réseau isométrique 3D authentique */}
          <g className="devices-layer">
            {effectiveNodes.map((id) => {
              const config = ISOMETRIC_NODES[id];
              if (!config) return null;
              const isRevealed = visibleNodes.includes(id);
              const isSelected = selectedNode === id;
              const isHovered = hoveredNode === id;

              return (
                <g
                  key={`device-node-${id}`}
                  className="device-group group cursor-pointer transition-transform"
                  style={{
                    opacity: isRevealed ? 1 : 0.45,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(id);
                  }}
                  onMouseEnter={() => setHoveredNode(id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Aura de sélection ou survol */}
                  {isSelected && (
                    <ellipse
                      cx={config.pos[0]}
                      cy={config.pos[1] + 12}
                      rx={56}
                      ry={30}
                      fill="#0284c7"
                      fillOpacity={0.18}
                      stroke="#0284c7"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  )}
                  {isHovered && !isSelected && (
                    <ellipse
                      cx={config.pos[0]}
                      cy={config.pos[1] + 12}
                      rx={50}
                      ry={26}
                      fill="#38bdf8"
                      fillOpacity={0.14}
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                    />
                  )}

                  {/* Clignotement de l'équipement lors de la réception du paquet */}
                  {clignoteNode && clignoteNode.nodeId === id && (
                    <ellipse
                      key={`clignote-${id}-${clignoteNode.key}`}
                      cx={config.pos[0]}
                      cy={config.pos[1] + 12}
                      rx={56}
                      ry={30}
                      fill={clignoteNode.color}
                      opacity="0"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;0.55;0.08;0.65;0"
                        keyTimes="0;0.2;0.45;0.7;1"
                        dur="0.55s"
                        fill="freeze"
                      />
                    </ellipse>
                  )}
                  <g
                    dangerouslySetInnerHTML={{
                      __html: config.renderSvg(config.pos[0], config.pos[1]),
                    }}
                  />
                </g>
              );
            })}
          </g>

          {/* 4. Couche d'ondes lumineuses et clignotement lors de l'arrivée sur l'équipement */}
          <g className="pulse-layer pointer-events-none select-none">
            {pulseEffects.map((pulse) =>
              pulse.isDest ? (
                <g
                  key={pulse.id}
                  transform={`translate(${pulse.pos[0]}, ${pulse.pos[1] + 12})`}
                >
                  {/* Onde de choc circulaire primaire */}
                  <circle
                    r="14"
                    fill="none"
                    stroke={pulse.color}
                    strokeWidth="3.2"
                    opacity="0"
                  >
                    <animate
                      attributeName="r"
                      from="14"
                      to="68"
                      dur="0.55s"
                      fill="freeze"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.95;0.5;0"
                      keyTimes="0;0.1;0.6;1"
                      dur="0.55s"
                      fill="freeze"
                    />
                  </circle>

                  {/* Onde concentrique secondaire blanche */}
                  <circle
                    r="8"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    opacity="0"
                  >
                    <animate
                      attributeName="r"
                      from="8"
                      to="38"
                      dur="0.45s"
                      fill="freeze"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.85;0"
                      keyTimes="0;0.2;1"
                      dur="0.45s"
                      fill="freeze"
                    />
                  </circle>
                </g>
              ) : (
                <g
                  key={pulse.id}
                  transform={`translate(${pulse.pos[0]}, ${pulse.pos[1] + 12})`}
                >
                  <circle
                    r="10"
                    fill="none"
                    stroke={pulse.color}
                    strokeWidth="2.5"
                    opacity="0"
                  >
                    <animate
                      attributeName="r"
                      from="10"
                      to="44"
                      dur="0.4s"
                      fill="freeze"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.8;0"
                      keyTimes="0;0.2;1"
                      dur="0.4s"
                      fill="freeze"
                    />
                  </circle>
                </g>
              )
            )}
          </g>

          {/* 5. Étiquettes textuelles des nœuds avec noms et adresses IP */}
          <g className="labels-layer">
            {effectiveNodes.map((id) => {
              const config = ISOMETRIC_NODES[id];
              if (!config) return null;
              const isRevealed = visibleNodes.includes(id);
              const isSelected = selectedNode === id;
              const isHovered = hoveredNode === id;
              const [nodeName, nodeIp] = labels?.[id] || [config.name, config.ip];

              return (
                <g
                  key={`label-${id}`}
                  className="node-label select-none cursor-pointer"
                  style={{ opacity: isRevealed ? 1 : 0.65 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(id);
                  }}
                  onMouseEnter={() => setHoveredNode(id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <text
                    x={config.labelPos[0]}
                    y={config.labelPos[1]}
                    textAnchor={config.textAnchor}
                    fill={isSelected ? '#ff7c28' : isHovered ? (isDark ? '#ff7c28' : '#ea580c') : (isDark ? '#f1f5f9' : '#0f172a')}
                    fontSize="14"
                    fontWeight="700"
                    fontFamily="'Space Grotesk', system-ui, -apple-system, sans-serif"
                    letterSpacing="0.01em"
                    className="transition-colors duration-150"
                  >
                    {nodeName}
                  </text>
                  {nodeIp && (
                    <text
                      x={config.labelPos[0]}
                      y={config.labelPos[1] + 18}
                      textAnchor={config.textAnchor}
                      fill={isSelected ? '#ff7c28' : isDark ? '#94a3b8' : '#334155'}
                      fontSize="12.5"
                      fontWeight="600"
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {nodeIp}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 5. Paquet animé en transit (Pastille bicolore se déplaçant rigoureusement le long des flèches) */}
          {activeRoute && packetBadge && (
            <g
              ref={packetGroupRef}
              key={`flight-${activePacket?.from}-${activePacket?.to}-${activePacket?.label}-${shownPackets?.length || 0}-${activePacket?.row?.time || ''}-${activePacketBadgeKey(activePacket)}`}
              className="cursor-pointer group packet-interactive-group"
              onClick={(e) => {
                e.stopPropagation();
                if (activePacket && onSelectPacket) {
                  onSelectPacket(activePacket);
                }
              }}
              style={{ pointerEvents: 'all', opacity: 0 }}
            >
              <title>Cliquer pour inspecter ce paquet ({activePacket?.label})</title>

              {/* 3 Points de traînée se déplaçant rigoureusement sur les pointillés de la flèche */}
              <circle ref={trail2Ref} cx={0} cy={0} r={2.0} fill={packetBadge.color} opacity={0.25} />
              <circle ref={trail1Ref} cx={0} cy={0} r={2.8} fill={packetBadge.color} opacity={0.4} />
              <circle ref={trail0Ref} cx={0} cy={0} r={3.6} fill={packetBadge.color} opacity={0.6} />

              {/* Halo lumineux d'aura sur la flèche */}
              <circle
                cx={0}
                cy={0}
                r={14}
                fill={packetBadge.color}
                opacity={0.22}
                className="group-hover:opacity-40 transition-opacity"
              />
              {/* Noyau lumineux du paquet avec contour blanc */}
              <circle
                cx={0}
                cy={0}
                r={4.8}
                fill={packetBadge.color}
                stroke="#ffffff"
                strokeWidth={1.6}
                className="group-hover:scale-125 transition-transform"
              />

              {/* Pastille bicolore flottante : En-tête coloré + compartiment charge utile */}
              <g
                transform={`translate(0, -${packetBadge.totalHeight + 10})`}
                className="group-hover:scale-105 transition-transform origin-bottom"
              >
                {/* En-tête coloré (ex: 200 OK) */}
                <path
                  d={
                    packetBadge.payloadLines.length > 0
                      ? `M ${-packetBadge.width / 2 + 4} -${packetBadge.totalHeight} h ${packetBadge.width - 8} q 4 0 4 4 v ${packetBadge.headerHeight - 4} h -${packetBadge.width} v -${packetBadge.headerHeight - 4} q 0 -4 4 -4 z`
                      : `M ${-packetBadge.width / 2 + 4} -${packetBadge.totalHeight} h ${packetBadge.width - 8} q 4 0 4 4 v ${packetBadge.headerHeight - 8} q 0 4 -4 4 h -${packetBadge.width - 8} q -4 0 -4 -4 v -${packetBadge.headerHeight - 8} q 0 -4 4 -4 z`
                  }
                  fill={packetBadge.color}
                />
                <text
                  x={0}
                  y={-packetBadge.totalHeight + 14}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10.5"
                  fontWeight="700"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  className="select-none"
                >
                  {packetBadge.label}
                </text>

                {/* Compartiment blanc inférieur de charge utile (ex: décroché / voix via le serveur) */}
                {packetBadge.payloadLines.length > 0 && (
                  <>
                    <path
                      d={`M ${-packetBadge.width / 2} -${packetBadge.bodyHeight} h ${packetBadge.width} v ${packetBadge.bodyHeight - 4} q 0 4 -4 4 h -${packetBadge.width - 8} q -4 0 -4 -4 v -${packetBadge.bodyHeight - 4} z`}
                      fill={isDark ? '#0f172a' : '#ffffff'}
                      stroke={packetBadge.color}
                      strokeWidth="1.2"
                    />
                    {packetBadge.payloadLines.map((line, lIdx) => (
                      <text
                        key={lIdx}
                        x={0}
                        y={-packetBadge.bodyHeight + 12 + lIdx * 13}
                        textAnchor="middle"
                        fill={isDark ? '#e2e8f0' : '#0f172a'}
                        fontSize="9.5"
                        fontWeight="500"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        className="select-none"
                      >
                        {line}
                      </text>
                    ))}
                  </>
                )}
              </g>
            </g>
          )}

          {/* 6. Barre d'URL sur l'écran du Client */}
          {urlBarText && (
            <g className="url-holder" transform="translate(60, 334)">
              <g className="url-bar">
                {/* Ligne conductrice reliant la barre à l'écran du laptop */}
                <path
                  d="M128 26 L140 58"
                  stroke={isDark ? '#3b82f6' : '#1b3fae'}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  fill="none"
                />
                {/* Boîte d'URL */}
                <rect
                  width={Math.max(168, urlBarText.length * 7.5 + 44)}
                  height="26"
                  rx="4"
                  fill={isDark ? '#111827' : '#ffffff'}
                  stroke={isDark ? '#3b82f6' : '#1b3fae'}
                  strokeWidth="1.5"
                  className="shadow-sm"
                />
                {/* Globe terrestre */}
                <g transform="translate(8, 6)" stroke={isDark ? '#3b82f6' : '#1b3fae'} fill="none" strokeWidth="1.2">
                  <circle cx="7" cy="7" r="6" />
                  <ellipse cx="7" cy="7" rx="2.6" ry="6" />
                  <path d="M1.4 5 h11.2 M1.4 9 h11.2" />
                </g>
                {/* Texte de l'URL */}
                <text
                  x="28"
                  y="17"
                  fill={isDark ? '#f1f5f9' : '#0f172a'}
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                >
                  {urlBarText}
                </text>
                {/* Indicateur de rendu sécurisé */}
                {isRendered && (
                  <path
                    d={`M ${Math.max(168, urlBarText.length * 7.5 + 44) - 18} 13.5 l 3.5 3.5 l 6.5 -7`}
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

function activePacketBadgeKey(packet: PacketEvent | null): string {
  if (!packet) return '';
  return `${packet.from}-${packet.to}-${packet.label}-${packet.row?.info || ''}`;
}
