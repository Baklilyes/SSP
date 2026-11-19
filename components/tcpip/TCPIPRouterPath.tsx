'use client';

import React from 'react';
import { RouterHopInfo } from '../../lib/simulation/scenarios/tcpip/tcpipRouting';
import { GitBranch, Laptop, Server, Router, ArrowRight, ShieldCheck } from 'lucide-react';

export interface TCPIPRouterPathProps {
  currentHop?: number;
  routerInfo?: RouterHopInfo;
  isFrench?: boolean;
}

export function TCPIPRouterPath({
  currentHop = 0,
  routerInfo,
  isFrench = true,
}: TCPIPRouterPathProps) {
  return (
    <div className="bg-surface border border-sky-500/30 rounded-xl p-3.5 shadow-xs select-none">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border">
        <div className="flex items-center gap-2 text-sky-500 font-bold text-xs font-mono">
          <GitBranch className="w-4 h-4 animate-pulse" />
          <span>{isFrench ? 'TOPOLOGIE DE ROUTAGE IP (INTERNET)' : 'IP ROUTING TOPOLOGY'}</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30">
          {isFrench ? 'Couche 2 Internet' : 'Layer 2 Internet'}
        </span>
      </div>

      {/* Topologie des nœuds */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 my-2">
        {/* Nœud 1 : Client */}
        <div className="flex flex-col items-center p-2 rounded-lg bg-surface-hover/80 border border-border flex-1 text-center">
          <Laptop className="w-4 h-4 text-emerald-500 mb-1" />
          <span className="text-[10px] font-mono font-bold text-foreground">PC A (Client)</span>
          <span className="text-[9px] font-mono text-muted">192.168.1.10</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />

        {/* Nœud 2 : Routeur 1 */}
        <div
          className={`flex flex-col items-center p-2 rounded-lg border flex-1 text-center transition-all ${
            currentHop === 1
              ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-600 ring-2 ring-sky-500/30 shadow-xs'
              : 'bg-surface-hover/80 border-border text-muted'
          }`}
        >
          <Router className={`w-4 h-4 mb-1 ${currentHop === 1 ? 'text-sky-500 animate-bounce' : 'text-slate-400'}`} />
          <span className="text-[10px] font-mono font-bold text-foreground">Routeur R1</span>
          <span className="text-[9px] font-mono text-muted">Passerelle</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />

        {/* Nœud 3 : Cœur Internet / Routeur R2 */}
        <div
          className={`flex flex-col items-center p-2 rounded-lg border flex-1 text-center transition-all ${
            currentHop === 2
              ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-600 ring-2 ring-sky-500/30 shadow-xs'
              : 'bg-surface-hover/80 border-border text-muted'
          }`}
        >
          <Router className={`w-4 h-4 mb-1 ${currentHop === 2 ? 'text-sky-500 animate-bounce' : 'text-slate-400'}`} />
          <span className="text-[10px] font-mono font-bold text-foreground">Transit R2</span>
          <span className="text-[9px] font-mono text-muted">Cœur de réseau</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />

        {/* Nœud 4 : Serveur */}
        <div className="flex flex-col items-center p-2 rounded-lg bg-surface-hover/80 border border-border flex-1 text-center">
          <Server className="w-4 h-4 text-purple-500 mb-1" />
          <span className="text-[10px] font-mono font-bold text-foreground">Serveur Web</span>
          <span className="text-[9px] font-mono text-muted">10.0.0.20</span>
        </div>
      </div>

      {/* Détails du routage si actif */}
      {routerInfo && (
        <div className="mt-2.5 p-2 rounded-lg bg-sky-50/70 dark:bg-slate-900/90 border border-sky-300 dark:border-sky-500/40 text-[11px] font-mono space-y-1">
          <div className="flex items-center justify-between text-sky-800 dark:text-sky-300 font-bold">
            <span>{isFrench ? routerInfo.routerNameFr : routerInfo.routerNameEn}</span>
            <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
              TTL: {routerInfo.oldTtl} → {routerInfo.newTtl}
            </span>
          </div>
          <div className="text-[10.5px] text-muted">
            {isFrench ? routerInfo.lookupResultFr : routerInfo.lookupResultEn}
          </div>
        </div>
      )}
    </div>
  );
}
