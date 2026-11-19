'use client';

import React from 'react';
import { TCPIPLayer as ITCPIPLayer } from '../../lib/simulation/scenarios/tcpip/tcpipLayers';
import { ChevronRight, Check } from 'lucide-react';

export interface TCPIPLayerProps {
  layer: ITCPIPLayer;
  active: boolean;
  completed: boolean;
  direction?: 'encapsulation' | 'transmission' | 'routing' | 'decapsulation';
  headerTag?: string;
  isHeaderAdded?: boolean;
  isHeaderRemoved?: boolean;
  onClick: () => void;
  onSelectProtocol?: (protocolId: string) => void;
  isFrench?: boolean;
}

export function TCPIPLayer({
  layer,
  active,
  completed,
  headerTag,
  isHeaderAdded,
  isHeaderRemoved,
  onClick,
  onSelectProtocol,
  isFrench = true,
}: TCPIPLayerProps) {
  const name = isFrench ? layer.nameFr : layer.nameEn;
  const unit = isFrench ? layer.unitFr : layer.unitEn;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
        active
          ? 'bg-white dark:bg-slate-900/90 border-[#ff7c28] shadow-md shadow-orange-500/15 ring-2 ring-orange-500/40 translate-x-1'
          : completed
          ? 'bg-emerald-50/40 dark:bg-slate-900/40 border-emerald-300 dark:border-slate-700/80 hover:border-emerald-500 hover:bg-emerald-50/80 dark:hover:bg-slate-900/70'
          : 'bg-white dark:bg-slate-950/40 border-border dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'
      }`}
      aria-label={`Couche TCP/IP ${layer.number} - ${name}`}
      title={isFrench ? `Voir les spécifications de la couche ${layer.number}` : `View layer ${layer.number} specifications`}
    >
      {/* 1. Numéro de couche + Titre + PDU Unit */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Pastille numérique */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 transition-transform ${
            active
              ? 'bg-[#ff7c28] text-white scale-105 shadow-md shadow-orange-500/30'
              : completed
              ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {completed && !active ? <Check className="w-4 h-4 stroke-[3]" /> : layer.number}
        </div>

        {/* Noms et PDU */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                active ? 'text-[#ff7c28] dark:text-white' : 'text-foreground'
              }`}
            >
              {name}
            </span>
            <span
              className="text-[9.5px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase tracking-tight shrink-0"
              style={{
                backgroundColor: layer.bgRgba,
                color: layer.color,
                border: `1px solid ${layer.color}40`,
              }}
            >
              {unit}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <p className="text-[11px] text-muted truncate max-w-[220px] sm:max-w-sm font-normal">
              {isFrench ? layer.descriptionFr : layer.descriptionEn}
            </p>
            {layer.protocols && layer.protocols.length > 0 && (
              <div className="flex items-center gap-1">
                {layer.protocols.slice(0, 4).map((p) => (
                  <span
                    key={p}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      if (onSelectProtocol) {
                        e.stopPropagation();
                        onSelectProtocol(p.toLowerCase());
                      }
                    }}
                    className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/90 hover:bg-[#ff7c28] text-slate-700 dark:text-slate-300 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors cursor-pointer uppercase"
                    title={isFrench ? `Ouvrir la simulation interactive de ${p.toUpperCase()}` : `Open ${p.toUpperCase()} simulation`}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Badge de modification d'en-tête (si actif) + Chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {headerTag && (
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isHeaderAdded
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-pulse'
                : isHeaderRemoved
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {headerTag}
          </span>
        )}

        <ChevronRight
          className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
            active ? 'text-[#ff7c28]' : 'text-slate-400'
          }`}
        />
      </div>
    </button>
  );
}
