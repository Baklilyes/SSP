'use client';

import React from 'react';
import { OSI_SIMULATION_STEPS, getOsiSteps } from '../../lib/simulation/scenarios/osi/osiEvents';
import { Check, ArrowDown, ArrowUp, Zap, Clock } from 'lucide-react';

export interface OSITimelineProps {
  activeStep: number;
  totalSteps: number;
  onJumpStep: (stepIndex: number) => void;
  isFrench?: boolean;
}

export function OSITimeline({
  activeStep,
  totalSteps,
  onJumpStep,
  isFrench = true,
}: OSITimelineProps) {
  return (
    <div className="flex flex-col h-full w-full bg-background border-r border-border select-none overflow-hidden">
      {/* Entête fixe de la chronologie */}
      <div className="p-3.5 border-b border-border bg-surface shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ff7c28]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              {isFrench ? 'CHRONOLOGIE' : 'TIMELINE'}
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ff7c28]/15 text-[#ff7c28] border border-[#ff7c28]/30">
            {activeStep + 1} / {totalSteps}
          </span>
        </div>
        <p className="text-[11px] text-muted">
          {isFrench
            ? '12 étapes de transfert'
            : '12 transfer steps'}
        </p>
      </div>

      {/* Liste verticale des 12 étapes */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {getOsiSteps(isFrench ? 'fr' : 'en').map((step, idx) => {
          const isActive = idx === activeStep;
          const isPast = idx < activeStep;
          const meta = step.osiMeta;

          // Libellé court d'action pour le tag
          let actionLabel = '';
          if (meta.action === 'data-created') actionLabel = 'Payload';
          else if (meta.action === 'presentation') actionLabel = 'UTF-8';
          else if (meta.action === 'session') actionLabel = 'Session';
          else if (meta.action === 'add-tcp') actionLabel = '+ TCP';
          else if (meta.action === 'add-ip') actionLabel = '+ IPv4';
          else if (meta.action === 'add-ethernet') actionLabel = '+ Eth';
          else if (meta.action === 'transmit-bits') actionLabel = 'Bits';
          else if (meta.action === 'receive-bits') actionLabel = 'RX';
          else if (meta.action === 'strip-ethernet') actionLabel = '- Eth';
          else if (meta.action === 'strip-ip') actionLabel = '- IPv4';
          else if (meta.action === 'strip-tcp') actionLabel = '- TCP';
          else if (meta.action === 'data-delivered') actionLabel = isFrench ? 'Reçu' : 'Delivered';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onJumpStep(idx)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer group ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-[#ff7c28] shadow-md shadow-orange-500/15 ring-1 ring-orange-500/40 translate-x-0.5'
                  : isPast
                  ? 'bg-white/80 dark:bg-slate-950/40 border-border hover:border-emerald-500/50 hover:bg-surface-hover'
                  : 'bg-white/40 dark:bg-slate-950/20 border-border/70 hover:border-border hover:bg-surface-hover opacity-80 hover:opacity-100'
              }`}
            >
              {/* Pastille numérique ou coche */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 transition-colors ${
                  isActive
                    ? 'bg-[#ff7c28] text-white shadow-xs'
                    : isPast
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
              </div>

              {/* Contenu de l'étape */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      meta.direction === 'encapsulation'
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/20'
                        : meta.direction === 'transmission'
                        ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-500/20'
                        : 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/20'
                    }`}
                  >
                    {isFrench ? `Couche ${meta.layer}` : `Layer ${meta.layer}`}
                  </span>

                  {actionLabel && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-[#ff7c28]/15 text-[#ff7c28]'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {actionLabel}
                    </span>
                  )}
                </div>

                <div
                  className={`text-[11px] font-mono font-medium leading-tight truncate transition-colors ${
                    isActive
                      ? 'text-[#ff7c28] dark:text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-foreground'
                  }`}
                  title={step.title}
                >
                  {step.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
