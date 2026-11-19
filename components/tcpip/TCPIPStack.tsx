'use client';

import React from 'react';
import {
  TCPIP_LAYERS_TOP_DOWN,
  TCPIPLayer as ITCPIPLayer,
} from '../../lib/simulation/scenarios/tcpip/tcpipLayers';
import { TCPIPLayer } from './TCPIPLayer';
import { TCPIPEncapsulationState } from '../../lib/simulation/scenarios/tcpip/tcpipPacket';
import {
  Layers,
  ArrowDown,
  ArrowUp,
  Zap,
  Network,
  Radio,
  Scale,
  GitBranch,
} from 'lucide-react';

export interface TCPIPStackProps {
  activeLayer: number;
  completedLayers: number[];
  direction?: 'encapsulation' | 'transmission' | 'routing' | 'decapsulation';
  selectedLayerId?: string;
  onSelectLayer: (layer: ITCPIPLayer) => void;
  onSelectProtocol?: (protocolId: string) => void;
  transportType: 'TCP' | 'UDP';
  onSelectTransport: (t: 'TCP' | 'UDP') => void;
  networkAccessType: 'Ethernet' | 'Wi-Fi';
  onSelectNetworkAccess: (na: 'Ethernet' | 'Wi-Fi') => void;
  onOpenComparison: () => void;
  onOpenHybrid: () => void;
  isFrench?: boolean;
  packetState?: TCPIPEncapsulationState;
}

export function TCPIPStack({
  activeLayer,
  completedLayers,
  direction = 'encapsulation',
  selectedLayerId,
  onSelectLayer,
  onSelectProtocol,
  transportType,
  onSelectTransport,
  networkAccessType,
  onSelectNetworkAccess,
  onOpenComparison,
  onOpenHybrid,
  isFrench = true,
  packetState,
}: TCPIPStackProps) {
  const isTcp = transportType === 'TCP';

  return (
    <div className="relative flex flex-col w-full h-full max-w-2xl mx-auto p-4 select-none">
      {/* 1. Entête de la pile TCP/IP */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[#ff7c28]">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">
              {isFrench ? 'PILE D’ARCHITECTURE TCP/IP (4 COUCHES)' : '4-LAYER TCP/IP MODEL STACK'}
            </h2>
            <p className="text-[11px] text-muted">
              {isFrench
                ? 'Architecture universelle d’Internet (DoD / IETF RFC 1122)'
                : 'Universal Internet architecture (DoD / IETF RFC 1122)'}
            </p>
          </div>
        </div>

        {/* Badge de sens du flux */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono shadow-2xs">
          {direction === 'encapsulation' ? (
            <>
              <ArrowDown className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {isFrench ? 'Émetteur (L4 → L1)' : 'Sender (L4 → L1)'}
              </span>
            </>
          ) : direction === 'routing' ? (
            <>
              <GitBranch className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              <span className="text-sky-600 dark:text-sky-400 font-bold">
                {isFrench ? 'Routage IP (Saut de routeur)' : 'IP Routing (Router Hop)'}
              </span>
            </>
          ) : direction === 'transmission' ? (
            <>
              <Zap className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
              <span className="text-teal-600 dark:text-teal-300 font-bold">
                {isFrench ? 'Transit Réseau' : 'Network Transit'}
              </span>
            </>
          ) : (
            <>
              <ArrowUp className="w-3.5 h-3.5 text-purple-500 animate-bounce" />
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {isFrench ? 'Récepteur (L1 → L4)' : 'Receiver (L1 → L4)'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Barre d'options interactives : Sélecteur Transport (TCP/UDP), Média & Outils comparatifs */}
      <div className="flex items-center justify-between gap-2 p-2 mb-3 bg-surface-hover/60 rounded-xl border border-border flex-wrap">
        {/* Sélecteur Transport (Section 14) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase text-muted tracking-tight">
            {isFrench ? 'Transport :' : 'Transport:'}
          </span>
          <div className="flex bg-surface rounded-lg p-0.5 border border-border">
            <button
              type="button"
              onClick={() => onSelectTransport('TCP')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                isTcp
                  ? 'bg-[#ff7c28] text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
              title={isFrench ? 'TCP : Fiable, orienté connexion' : 'TCP: Reliable, connection-oriented'}
            >
              TCP
            </button>
            <button
              type="button"
              onClick={() => onSelectTransport('UDP')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                !isTcp
                  ? 'bg-[#0ea5e9] text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
              title={isFrench ? 'UDP : Léger, sans connexion' : 'UDP: Lightweight, connectionless'}
            >
              UDP
            </button>
          </div>
        </div>

        {/* Sélecteur Technologie Hôte-Réseau (Section 18) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase text-muted tracking-tight">
            {isFrench ? 'Accès L1 :' : 'L1 Access:'}
          </span>
          <div className="flex bg-surface rounded-lg p-0.5 border border-border">
            <button
              type="button"
              onClick={() => onSelectNetworkAccess('Ethernet')}
              className={`px-2 py-1 rounded-md text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                networkAccessType === 'Ethernet'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Ethernet
            </button>
            <button
              type="button"
              onClick={() => onSelectNetworkAccess('Wi-Fi')}
              className={`px-2 py-1 rounded-md text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                networkAccessType === 'Wi-Fi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Wi-Fi
            </button>
          </div>
        </div>

        {/* Boutons d'analyse comparative */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={onOpenComparison}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-[#ff7c28] border border-orange-500/30 text-[10.5px] font-mono font-bold transition-all cursor-pointer"
            title={isFrench ? 'Comparer le modèle TCP/IP avec le modèle OSI' : 'Compare TCP/IP with OSI Model'}
          >
            <Scale className="w-3 h-3" />
            <span>{isFrench ? 'Comparer OSI' : 'OSI Compare'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenHybrid}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 text-[10.5px] font-mono font-bold transition-all cursor-pointer"
            title={isFrench ? 'Afficher le modèle hybride à 5 couches' : 'View modern 5-layer hybrid model'}
          >
            <Layers className="w-3 h-3" />
            <span>{isFrench ? 'Modèle 5 Couches' : '5-Layer Model'}</span>
          </button>
        </div>
      </div>

      {/* 3. Pile des 4 couches TCP/IP (4 en haut, 1 en bas) */}
      <div className="flex-1 flex flex-col justify-between gap-2.5">
        {TCPIP_LAYERS_TOP_DOWN.map((layer: ITCPIPLayer) => {
          const isActive = layer.number === activeLayer;
          const isCompleted = completedLayers.includes(layer.number);

          // Tag dynamique selon l'étape et la couche
          let headerTag: string | undefined;
          let isHeaderAdded = false;
          let isHeaderRemoved = false;

          if (isActive) {
            if (layer.number === 3) {
              if (direction === 'encapsulation') {
                headerTag = isTcp ? '+ TCP (20 B)' : '+ UDP (8 B)';
                isHeaderAdded = true;
              } else if (direction === 'decapsulation') {
                headerTag = isTcp ? '- TCP (20 B)' : '- UDP (8 B)';
                isHeaderRemoved = true;
              }
            } else if (layer.number === 2) {
              if (direction === 'encapsulation') {
                headerTag = '+ IPv4 (20 B)';
                isHeaderAdded = true;
              } else if (direction === 'routing') {
                headerTag = 'Routage (TTL -1)';
              } else if (direction === 'decapsulation') {
                headerTag = '- IPv4 (20 B)';
                isHeaderRemoved = true;
              }
            } else if (layer.number === 1) {
              if (direction === 'encapsulation') {
                headerTag = `+ ${networkAccessType} (14 B)`;
                isHeaderAdded = true;
              } else if (direction === 'decapsulation') {
                headerTag = `- ${networkAccessType} (14 B)`;
                isHeaderRemoved = true;
              } else if (direction === 'transmission') {
                headerTag = 'Bits physiques';
              }
            } else if (layer.number === 4) {
              headerTag = direction === 'encapsulation' ? 'Payload (5 B)' : 'Delivered';
            }
          }

          return (
            <div key={layer.id} className="relative">
              <TCPIPLayer
                layer={layer}
                active={isActive}
                completed={isCompleted}
                direction={direction}
                headerTag={headerTag}
                isHeaderAdded={isHeaderAdded}
                isHeaderRemoved={isHeaderRemoved}
                onClick={() => onSelectLayer(layer)}
                onSelectProtocol={onSelectProtocol}
                isFrench={isFrench}
              />
            </div>
          );
        })}
      </div>

      {/* 4. Base du média physique */}
      <div className="mt-3 pt-2.5 border-t border-dashed border-border flex items-center justify-between text-[11px] font-mono text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {isFrench
              ? `Liaison locale ${networkAccessType} (Support Cuivre / Fibre / Radio)`
              : `Local link ${networkAccessType} (Copper / Fiber / Wireless)`}
          </span>
        </span>
        <span className="text-muted">1000BASE-T · Full-Duplex</span>
      </div>
    </div>
  );
}
