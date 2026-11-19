'use client';

import React, { useState } from 'react';
import { PacketEvent } from '../../lib/simulation/types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronDown } from 'lucide-react';

export interface PacketFlowTableProps {
  packets: PacketEvent[];
  activeIndex: number;
  onSelectPacket: (packet: PacketEvent, index: number) => void;
  legend?: [string | null, string][];
  status?: 'idle' | 'running' | 'paused' | 'stepping' | 'done';
  speed?: number;
  activeStep?: number;
  totalSteps?: number;
  started?: boolean;
  onTogglePlay?: () => void;
  onStep?: () => void;
  onPrev?: () => void;
  onReset?: () => void;
  onSetSpeed?: (speed: number) => void;
}

export function PacketFlowTable({
  packets,
  activeIndex,
  onSelectPacket,
  legend,
  status = 'idle',
  speed = 1,
  activeStep = 0,
  totalSteps = 1,
  started = false,
  onTogglePlay,
  onStep,
  onPrev,
  onReset,
  onSetSpeed,
}: PacketFlowTableProps) {
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const speeds = [0.5, 1, 1.5, 2];

  const getDotColor = (c: string | null) => {
    switch (c) {
      case 'green':
      case 'emerald':
        return 'bg-emerald-400';
      case 'blue':
      case 'sky':
        return 'bg-sky-400';
      case 'violet':
      case 'purple':
        return 'bg-purple-400';
      case 'amber':
      case 'yellow':
        return 'bg-amber-400';
      case 'red':
        return 'bg-red-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getBadgeBg = (c: string) => {
    switch (c) {
      case 'green':
      case 'emerald':
        return 'bg-emerald-600';
      case 'blue':
      case 'sky':
        return 'bg-sky-600';
      case 'violet':
      case 'purple':
        return 'bg-purple-600';
      case 'amber':
      case 'yellow':
        return 'bg-amber-500';
      case 'red':
        return 'bg-red-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface border-t border-border select-none overflow-hidden">
      {/* En-tête : Titre + Légende à gauche, Contrôles de simulation à droite */}
      <div className="px-4 py-2 border-b border-border bg-surface flex items-center justify-between gap-4 shrink-0">
        {/* Côté Gauche : Titre avec ligne d'accent + Légende colorée */}
        <div className="flex items-center gap-3 overflow-x-auto min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-3.5 h-0.5 bg-[#ff7c28] rounded-full inline-block" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
              FLUX DE PAQUETS
            </h3>
          </div>

          {legend && legend.length > 0 && (
            <div className="flex items-center gap-3 text-[11px] font-sans shrink-0 hidden sm:flex">
              {legend.map(([color, label], lIdx) => (
                <span key={lIdx} className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getDotColor(color)}`} />
                  <span>{label}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Côté Droit : Commandes de lecture */}
        {onTogglePlay && (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Menu Vitesse [ 1x v ] */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="h-7 px-2.5 bg-slate-900 border border-slate-700 rounded flex items-center gap-1 text-[11px] font-mono font-bold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Vitesse de simulation"
              >
                <span>{speed}×</span>
                <ChevronDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
              </button>

              {speedMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-20 bg-slate-900 border border-slate-700 rounded shadow-xl p-1 z-30">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        onSetSpeed?.(s);
                        setSpeedMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded font-mono ${
                        s === speed
                          ? 'bg-[#ff7c28] text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton Étape Précédente [ < ] */}
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                disabled={!started || (activeStep === 0 && status === 'idle')}
                className={`h-7 w-7 bg-slate-900 border border-slate-700 rounded flex items-center justify-center transition-colors ${
                  !started || (activeStep === 0 && status === 'idle')
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'text-slate-200 hover:bg-slate-800 cursor-pointer'
                }`}
                title="Étape précédente"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}

            {/* Bouton Principal [ LECTURE / PAUSE / REVOIR ] aux couleurs de la charte */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="h-7 px-3 bg-[#ff7c28] hover:bg-[#ea580c] text-white rounded flex items-center gap-1.5 font-bold text-[11px] font-mono uppercase tracking-wider transition-colors shadow-sm shadow-orange-500/20 cursor-pointer"
              title="Lecture / Pause (Espace)"
            >
              {status === 'running' ? (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : status === 'done' ? (
                <>
                  <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                  <span>REVOIR</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>LECTURE</span>
                </>
              )}
            </button>

            {/* Bouton Avancer [ AVANCER ] */}
            {onStep && (
              <button
                type="button"
                onClick={onStep}
                disabled={status === 'done'}
                className={`h-7 px-2.5 bg-slate-900 border border-slate-700 rounded flex items-center justify-center font-bold text-[11px] font-mono uppercase tracking-wide text-slate-200 transition-colors ${
                  status === 'done'
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'hover:bg-slate-800 cursor-pointer'
                }`}
                title="Avancer d’une étape"
              >
                <span>AVANCER</span>
              </button>
            )}

            {/* Bouton Réinitialiser [ ↺ RÉINITIALISER ] */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="h-7 px-2.5 bg-slate-900 border border-slate-700 rounded flex items-center gap-1 font-bold text-[11px] font-mono uppercase tracking-wide text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3 h-3 stroke-[2.2]" />
                <span className="hidden sm:inline">RÉINITIALISER</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tableau des paquets */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="bg-surface-hover/80 sticky top-0 text-[10px] text-slate-700 dark:text-slate-400 uppercase font-bold border-b border-border z-10 tracking-wider">
            <tr>
              <th className="py-1.5 px-3 w-12 text-center">N°</th>
              <th className="py-1.5 px-3 w-20">TEMPS</th>
              <th className="py-1.5 px-3 w-32">SOURCE</th>
              <th className="py-1.5 px-3 w-32">DESTINATION</th>
              <th className="py-1.5 px-3 w-24">PROTOCOLE</th>
              <th className="py-1.5 px-3">INFO</th>
              <th className="py-1.5 px-3 w-20 text-right">TAILLE</th>
            </tr>
          </thead>
          <tbody>
            {packets.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-xs text-muted font-sans"
                >
                  Aucun paquet n'a encore circulé sur le réseau.
                </td>
              </tr>
            ) : (
              packets.map((pkt, idx) => {
                const isSelected = idx === activeIndex;
                const row = pkt.row;

                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectPacket(pkt, idx)}
                    className={`cursor-pointer transition-colors border-b border-border/40 hover:bg-surface-hover/60 ${
                      isSelected
                        ? 'bg-orange-500/10 font-semibold border-l-2 border-l-[#ff7c28]'
                        : ''
                    }`}
                  >
                    <td className="py-1.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shadow-xs ${getBadgeBg(
                          pkt.color
                        )}`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{row.time}</td>
                    <td className="py-1.5 px-3 text-slate-900 dark:text-slate-200 font-mono text-[11px] font-medium">{row.src}</td>
                    <td className="py-1.5 px-3 text-slate-900 dark:text-slate-200 font-mono text-[11px] font-medium">{row.dst}</td>
                    <td className="py-1.5 px-3 font-bold font-mono text-slate-900 dark:text-slate-100 text-[11px]">
                      {row.proto}
                    </td>
                    <td className="py-1.5 px-3 text-slate-900 dark:text-slate-200 font-mono text-[11px] truncate max-w-xs md:max-w-md font-medium">
                      {row.info}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {row.len || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
