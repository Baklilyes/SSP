'use client';

import React from 'react';
import { OSIEncapsulationState } from '../../lib/simulation/scenarios/osi/osiPacket';
import { Search, Radio, Sparkles } from 'lucide-react';

export interface OSIPacketProps {
  packetState?: OSIEncapsulationState;
  activeLayer: number;
  direction?: 'encapsulation' | 'transmission' | 'decapsulation';
  onInspect?: () => void;
  isFrench?: boolean;
}

export function OSIPacket({
  packetState,
  activeLayer,
  direction = 'encapsulation',
  onInspect,
  isFrench = true,
}: OSIPacketProps) {
  if (!packetState) return null;

  const hasEth = !!packetState.dataLinkHeader;
  const hasIp = !!packetState.networkHeader;
  const hasTcp = !!packetState.transportHeader;
  const isPhysical = activeLayer === 1 || direction === 'transmission';

  return (
    <div className="relative w-full rounded-2xl bg-surface border border-border p-4 shadow-sm backdrop-blur-md overflow-hidden">
      {/* Glow de fond selon l'état */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-24 rounded-full blur-3xl pointer-events-none opacity-15 ${
          isPhysical
            ? 'bg-teal-500'
            : direction === 'decapsulation'
            ? 'bg-purple-500'
            : 'bg-[#ff7c28]'
        }`}
      />

      {/* En-tête de la carte du paquet */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPhysical ? 'bg-teal-400' : 'bg-[#ff7c28]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isPhysical ? 'bg-teal-500' : 'bg-[#ff7c28]'
              }`}
            />
          </span>
          <span className="font-mono font-bold uppercase tracking-wider text-foreground">
            {isFrench ? 'PAQUET EN COURS DE TRAITEMENT' : 'PACKET IN TRANSIT'}
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border uppercase ${
              direction === 'encapsulation'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : direction === 'transmission'
                ? 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30'
                : 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
            }`}
          >
            {direction === 'encapsulation'
              ? isFrench
                ? '↓ Encapsulation'
                : '↓ Encapsulation'
              : direction === 'transmission'
              ? isFrench
                ? '↔ Transmission physique'
                : '↔ Physical Transmission'
              : isFrench
              ? '↑ Décapsulation'
              : '↑ Decapsulation'}
          </span>
        </div>

        {onInspect && (
          <button
            type="button"
            onClick={onInspect}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-[#ff7c28] border border-orange-500/40 text-[11px] font-mono font-bold transition-all shadow-xs cursor-pointer"
            title={isFrench ? 'Inspecter la trame dans le dissecteur' : 'Inspect frame in dissector'}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isFrench ? 'Inspecter' : 'Inspect'}</span>
          </button>
        )}
      </div>

      {/* Représentation visuelle des couches emboîtées (Encapsulation Blocks) */}
      {!isPhysical ? (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-background rounded-xl border border-border min-h-[64px] justify-center transition-all">
          {/* L2 : En-tête Ethernet */}
          {hasEth && (
            <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-500/60 shadow-xs animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">
                L2 · Ethernet
              </span>
              <span className="text-[9px] font-mono text-emerald-600/80 dark:text-emerald-300/80">
                {isFrench ? '14 octets' : '14 bytes'}
              </span>
            </div>
          )}

          {/* L3 : En-tête IPv4 */}
          {hasIp && (
            <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-500/60 shadow-xs animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400 uppercase tracking-tight">
                L3 · IPv4
              </span>
              <span className="text-[9px] font-mono text-sky-600/80 dark:text-sky-300/80">
                {isFrench ? '20 octets' : '20 bytes'}
              </span>
            </div>
          )}

          {/* L4 : En-tête TCP */}
          {hasTcp && (
            <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-300 dark:border-indigo-500/60 shadow-xs animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">
                L4 · TCP
              </span>
              <span className="text-[9px] font-mono text-indigo-600/80 dark:text-indigo-300/80">
                {isFrench ? '20 octets' : '20 bytes'}
              </span>
            </div>
          )}

          {/* L7 : Données (Payload) */}
          <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/70 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">
              {isFrench ? 'L7 · Données' : 'L7 · Data'}
            </span>
            <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
              "{packetState.applicationData}"
            </span>
          </div>
        </div>
      ) : (
        /* Couche 1 Physique : Animation du flux binaire */
        <div className="p-3 bg-teal-50/50 dark:bg-slate-950/90 rounded-xl border border-teal-300 dark:border-teal-500/40 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold">
            <Radio className="w-4 h-4 animate-pulse text-teal-600 dark:text-teal-300" />
            <span>
              {isFrench
                ? 'PROPAGATION DU SIGNAL PHYSIQUE (L1)'
                : 'PHYSICAL SIGNAL PROPAGATION (L1)'}
            </span>
          </div>
          <div className="font-mono text-sm tracking-widest text-teal-900 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/40 p-2.5 rounded-lg border border-teal-300 dark:border-teal-500/30 overflow-x-auto select-all">
            {packetState.physicalBits ?? '01001000 01100101 01101100 01101100 01101111'}
          </div>
          <div className="mt-2 text-[10.5px] text-muted font-mono">
            {isFrench
              ? 'Trame complète sérialisée en impulsions électriques / optiques sur le câble'
              : 'Complete frame serialized into optical / electrical pulses on the wire'}
          </div>
        </div>
      )}

      {/* Résumé de taille en bas */}
      <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-muted pt-2 border-t border-border">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#ff7c28]" />
          <span>
            {isFrench ? 'Couche active' : 'Active layer'}:{' '}
            <strong className="text-foreground">L{activeLayer}</strong>
          </span>
        </span>
        <span>
          {isFrench ? 'Taille totale' : 'Total size'}:{' '}
          <strong className="text-foreground font-bold">{packetState.rawBytesLength} {isFrench ? 'octets' : 'bytes'}</strong>
        </span>
      </div>
    </div>
  );
}
