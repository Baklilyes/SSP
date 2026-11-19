'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, Search, Moon, Sun } from 'lucide-react';
import { PROTOCOLS_LIST, ProtocolMeta } from '../../data/protocols';
import { getProtocol } from '../../lib/protocols/registry';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export interface SidebarProps {
  currentProtocolId: string;
  onSelectProtocol: (id: string) => void;
  isOpen: boolean;
  activeStep?: number;
  onSelectStep?: (protocolId: string, stepIndex: number) => void;
  status?: string;
  onOpenSearch?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

type CategoryTab = 'all' | 'core' | 'application' | 'security';

const CATEGORY_TABS: { id: CategoryTab; label: string; group?: string }[] = [
  { id: 'all', label: 'TOUS' },
  { id: 'core', label: 'BASE', group: 'core' },
  { id: 'application', label: 'APPLICATION', group: 'application' },
  { id: 'security', label: 'SÉCURITÉ', group: 'security' },
];

const PROTOCOLS_ORDER = [
  'http', 'https', 'websocket', 'webrtc', 'sip', 'rtsp', 'rtmp',
  'quic', 'tcp', 'udp', 'ip', 'bgp', 'ipv6',
  'dns', 'doh', 'dnssec', 'dhcp', 'icmp', 'igmp', 'ntp',
  'ethernet', 'pppoe', 'wifi', 'wpa3', 'radius', 'portal',
  'smtp', 'pop3', 'imap', 'ftp', 'smb', 'ssh', 'tls',
  'proxy', 'socks', 'reverse', 'wireguard', 'ipsec', 'modbus'
];

const PROTOCOL_SUBTITLES: Record<string, string> = {
  http: 'Transfert hypertexte',
  https: 'HTTP sécurisé',
  websocket: 'Messagerie web bidirectionnelle',
  webrtc: 'Appels vidéo dans le navigateur',
  sip: 'Appels téléphoniques par Internet',
  rtsp: 'Flux de caméras IP',
  rtmp: 'Téléversement de streaming en direct',
  dns: 'Système de noms de domaine',
  dhcp: 'Configuration dynamique des hôtes',
  ntp: 'Protocole de temps réseau',
  portal: 'Portails de connexion Wi-Fi',
  smtp: 'Envoi de courrier électronique',
  pop3: 'Réception de courrier (POP3)',
  imap: 'Accès aux boîtes de messagerie',
  ftp: 'Transfert de fichiers',
  smb: 'Partage de fichiers Windows',
  proxy: 'Mandataire direct et CONNECT',
  socks: 'Mandataire sécurisé SOCKS5',
  reverse: 'Délestage TLS et équilibrage',
  modbus: 'Communication automate industriel',
  doh: 'Résolutions DNS privées',
  dnssec: 'Réponses DNS signées',
  wpa3: 'Accès Wi-Fi protégé 3',
  radius: 'Wi-Fi d’entreprise 802.1X',
  ssh: 'Connexion à distance Secure Shell',
  tls: 'Sécurité de la couche transport',
  wireguard: 'Un VPN moderne et rapide',
  ipsec: 'Tunnels IKEv2 et ESP',
  quic: 'HTTP/3 sur UDP',
  tcp: 'Contrôle de transmission',
  udp: 'Datagrammes utilisateur',
  ip: 'Protocole Internet',
  bgp: 'Routage entre réseaux',
  ipv6: 'Autoconfiguration et voisins',
  icmp: 'Messages de contrôle Internet',
  igmp: 'Multicast et chaînes TV',
  ethernet: 'Trames et commutateurs',
  pppoe: 'Connexions haut débit FAI',
  wifi: 'Connexion à un réseau (WPA2)',
};

export function Sidebar({
  currentProtocolId,
  onSelectProtocol,
  isOpen,
  activeStep = 0,
  onSelectStep,
  status = 'idle',
  onOpenSearch,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(currentProtocolId);

  // Synchronise l'expansion avec le protocole sélectionné
  useEffect(() => {
    if (currentProtocolId) {
      setExpandedId(currentProtocolId);
    }
  }, [currentProtocolId]);

  // Trie et prépare la liste des protocoles selon l'ordre officiel
  const orderedProtocols = useMemo(() => {
    const map = new Map<string, ProtocolMeta>();
    PROTOCOLS_LIST.forEach((p) => map.set(p.id, p));

    const sorted: ProtocolMeta[] = [];
    PROTOCOLS_ORDER.forEach((id) => {
      const item = map.get(id);
      if (item) sorted.push(item);
    });

    // Ajoute les éventuels protocoles restants
    PROTOCOLS_LIST.forEach((p) => {
      if (!sorted.find((s) => s.id === p.id)) {
        sorted.push(p);
      }
    });

    return sorted;
  }, []);

  // Filtre les protocoles selon l'onglet actif
  const filteredProtocols = useMemo(() => {
    if (activeTab === 'all') return orderedProtocols;
    const tabObj = CATEGORY_TABS.find((t) => t.id === activeTab);
    if (!tabObj?.group) return orderedProtocols;
    return orderedProtocols.filter((p) => p.group === tabObj.group);
  }, [orderedProtocols, activeTab]);

  if (!isOpen) return null;

  return (
    <aside className="w-80 border-r border-border bg-surface flex flex-col h-full shrink-0 select-none overflow-hidden z-20">
      {/* 1. Titre Officiel PROTOCOLES INTERNET + Accès Recherche & Thème */}
      <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between shrink-0">
        <h1 className="text-xs font-bold tracking-wider uppercase text-foreground font-mono">
          PROTOCOLES INTERNET
        </h1>
        <div className="flex items-center gap-1">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
              title="Rechercher un protocole (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
              title="Changer de thème (Clair / Sombre)"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Onglets Catégories : TOUS, BASE, APPLICATION, SÉCURITÉ */}
      <div className="grid grid-cols-4 border-b border-border bg-surface text-center shrink-0">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === 'all'
              ? orderedProtocols.length
              : orderedProtocols.filter((p) => p.group === tab.group).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-2.5 px-1 flex flex-col items-center justify-center gap-1 transition-colors border-r border-border last:border-r-0 ${
                isActive
                  ? 'text-[#ea580c] dark:text-[#ff7c28] font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-bold tracking-wider">{tab.label}</span>
                <span
                  className={`text-[9.5px] px-1 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-[#ff7c28] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </div>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ff7c28]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Liste des protocoles avec accordéons */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {filteredProtocols.map((p) => {
          const isSelected = p.id === currentProtocolId;
          const isExpanded = expandedId === p.id;
          const protoDef = isExpanded ? getProtocol(p.id, locale) : null;
          const subtitle =
            locale === 'fr' || !locale
              ? PROTOCOL_SUBTITLES[p.id] || p.full
              : p.full;

          const dotColor =
            p.id === 'quic' || p.id === 'websocket'
              ? 'bg-amber-400'
              : isSelected
              ? 'bg-emerald-400'
              : 'border border-slate-500 bg-transparent';

          return (
            <div
              key={p.id}
              className={`transition-colors ${
                isExpanded ? 'border-y border-orange-500/30 bg-orange-500/[0.03]' : ''
              }`}
            >
              {/* Ligne En-tête du protocole */}
              <button
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setExpandedId(isExpanded ? null : p.id);
                  } else {
                    onSelectProtocol(p.id);
                    setExpandedId(p.id);
                  }
                }}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                  isExpanded
                    ? 'bg-surface hover:bg-surface-hover'
                    : 'hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                  <div className="min-w-0">
                    <div className="font-bold text-xs tracking-wider uppercase text-foreground">
                      {p.name}
                    </div>
                    <div className="text-[10.5px] text-muted font-normal truncate mt-0.5">
                      {subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-muted shrink-0 ml-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 stroke-[2.5] text-[#ff7c28]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
              </button>

              {/* Liste des étapes de l'accordéon */}
              {isExpanded && protoDef && protoDef.steps && protoDef.steps.length > 0 && (
                <div className="pl-5 pr-3 pb-3 pt-0">
                  <div className="relative">
                    {protoDef.steps.map((step, sIdx) => {
                      const isLast = sIdx === protoDef.steps.length - 1;
                      const isDone = isSelected && (status === 'done' || sIdx < activeStep);
                      const isStepActive = isSelected && activeStep === sIdx && status !== 'done';

                      return (
                        <div
                          key={sIdx}
                          onClick={() => {
                            if (onSelectStep) {
                              onSelectStep(p.id, sIdx);
                            }
                          }}
                          className={`relative flex items-start group cursor-pointer py-1.5 pl-1 rounded-md transition-colors ${
                            isStepActive
                              ? 'bg-orange-500/10'
                              : 'hover:bg-surface-hover/70'
                          }`}
                        >
                          {/* Ligne verticale de la chronologie */}
                          {!isLast && (
                            <span
                              className={`absolute left-[10px] top-[18px] bottom-[-4px] border-l-2 z-0 ${
                                isDone
                                    ? 'border-emerald-500'
                                    : 'border-dotted border-slate-600'
                              }`}
                              aria-hidden="true"
                            />
                          )}

                          {/* Pastille : Coche verte si terminé, numéro actif ou neutre */}
                          {isDone ? (
                            <div className="relative z-10 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mr-2.5 shadow-xs">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                          ) : isStepActive ? (
                            <div className="relative z-10 w-4.5 h-4.5 rounded-full bg-[#ff7c28] ring-2 ring-orange-500/70 ring-offset-2 ring-offset-slate-900 flex items-center justify-center shrink-0 mr-2.5 shadow-xs text-white text-[10px] font-bold font-mono">
                              {sIdx + 1}
                            </div>
                          ) : (
                            <div className="relative z-10 w-4.5 h-4.5 rounded-full bg-slate-600 flex items-center justify-center shrink-0 mr-2.5 shadow-xs text-white text-[10px] font-bold font-mono">
                              {sIdx + 1}
                            </div>
                          )}

                          {/* Titres et descriptions des étapes */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div
                              className={`font-bold text-[11px] uppercase tracking-wide transition-colors ${
                                isStepActive
                                  ? 'text-[#ea580c] dark:text-[#ff7c28]'
                                  : isDone
                                  ? 'text-slate-900 dark:text-slate-100'
                                  : 'text-slate-700 dark:text-slate-300 group-hover:text-[#ff7c28]'
                              }`}
                            >
                              {step.title}
                            </div>
                            <div className="text-[10px] text-muted leading-snug mt-0.5">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
