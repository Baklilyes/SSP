'use client';

import React from 'react';
import { getTcpipSteps } from '../../lib/simulation/scenarios/tcpip/tcpipEvents';
import { ArrowDown, ArrowUp, Zap, Check, GitBranch } from 'lucide-react';

export interface TCPIPTimelineProps {
  activeStep: number;
  totalSteps: number;
  onJumpStep: (stepIndex: number) => void;
  transportType?: 'TCP' | 'UDP';
  isFrench?: boolean;
}

export function TCPIPTimeline({
  activeStep,
  totalSteps,
  onJumpStep,
  transportType = 'TCP',
  isFrench = true,
}: TCPIPTimelineProps) {
  const steps = getTcpipSteps(isFrench ? 'fr' : 'en', transportType);

  return (
    <div className="flex flex-col h-full bg-surface select-none border-r border-border">
      {/* 1. Entête de la chronologie */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold block">
            {isFrench ? 'CHRONOLOGIE DÉTERMINISTE' : 'DETERMINISTIC TIMELINE'}
          </span>
          <h2 className="text-sm font-bold font-mono text-foreground mt-0.5">
            {isFrench ? '12 ÉTAPES DU CYCLE TCP/IP' : '12-STEP TCP/IP CYCLE'}
          </h2>
        </div>

        <span className="text-xs font-mono font-bold text-[#ff7c28] bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
          {activeStep + 1} / {totalSteps}
        </span>
      </div>

      {/* 2. Liste des étapes verticales avec défilement */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          const meta = step.tcpipMeta;

          // Badges d'action selon l'étape
          let actionTag = '';
          if (meta.action === 'application-data-created') actionTag = 'Payload';
          else if (meta.action === 'transport-header-added') actionTag = `+ ${transportType}`;
          else if (meta.action === 'ip-header-added') actionTag = '+ IPv4';
          else if (meta.action === 'frame-created') actionTag = '+ Eth';
          else if (meta.action === 'transmission-start') actionTag = 'Bits';
          else if (meta.action === 'frame-processed' && meta.direction === 'routing') actionTag = 'R1 In';
          else if (meta.action === 'router-hop') actionTag = 'Routage IP';
          else if (meta.action === 'transmission-complete') actionTag = 'Transit';
          else if (meta.action === 'frame-processed') actionTag = '- Eth';
          else if (meta.action === 'ip-header-processed') actionTag = '- IPv4';
          else if (meta.action === 'transport-header-processed') actionTag = `- ${transportType}`;
          else if (meta.action === 'application-data-delivered') actionTag = isFrench ? 'Reçu' : 'Delivered';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onJumpStep(idx)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-[#ff7c28] shadow-md shadow-orange-500/20 ring-2 ring-orange-500/40 translate-x-1'
                  : isCompleted
                  ? 'bg-emerald-50/30 dark:bg-slate-900/40 border-emerald-300 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/60'
                  : 'bg-white dark:bg-slate-950/40 border-border hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Numéro ou icône de complétion */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#ff7c28] text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Titre & Pilule de couche */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        meta.layer === 4
                          ? 'bg-orange-500/15 text-[#ff7c28]'
                          : meta.layer === 3
                          ? 'bg-indigo-500/15 text-indigo-500'
                          : meta.layer === 2
                          ? 'bg-sky-500/15 text-sky-500'
                          : 'bg-emerald-500/15 text-emerald-500'
                      }`}
                    >
                      {isFrench ? `Couche ${meta.layer}` : `Layer ${meta.layer}`}
                    </span>

                    {/* Tag direction */}
                    {meta.direction === 'encapsulation' ? (
                      <ArrowDown className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : meta.direction === 'routing' ? (
                      <GitBranch className="w-3 h-3 text-sky-500 shrink-0" />
                    ) : meta.direction === 'transmission' ? (
                      <Zap className="w-3 h-3 text-teal-500 shrink-0" />
                    ) : (
                      <ArrowUp className="w-3 h-3 text-purple-500 shrink-0" />
                    )}
                  </div>

                  <p
                    className={`text-xs font-mono truncate leading-snug ${
                      isActive ? 'font-bold text-foreground' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {/* Tag d'action court à droite */}
              {actionTag && (
                <span
                  className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {actionTag}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
