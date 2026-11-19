'use client';

import React from 'react';
import { ProtocolDefinition, PacketEvent } from '../../lib/simulation/types';
import { Search, ChevronLeft, Video } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export interface ProtocolOverviewProps {
  protocol: ProtocolDefinition;
  activeStep?: number;
  totalSteps?: number;
  status?: 'idle' | 'running' | 'paused' | 'stepping' | 'done';
  activePacket?: PacketEvent | null;
  onJumpStep?: (stepIndex: number) => void;
  onInspectPacket?: (packet: PacketEvent) => void;
  onReset?: () => void;
  onWatchVideo?: () => void;
}

export function ProtocolOverview({
  protocol,
  activeStep = 0,
  totalSteps,
  status = 'idle',
  activePacket = null,
  onJumpStep,
  onInspectPacket,
  onReset,
  onWatchVideo,
}: ProtocolOverviewProps) {
  const { locale } = useLanguage();
  const isFrench = locale === 'fr' || !locale;
  const steps = protocol.steps || [];
  const totalStepsCount = totalSteps ?? steps.length;
  const currentStepIndex = Math.min(Math.max(0, activeStep), Math.max(0, steps.length - 1));
  const activeStepData = steps[currentStepIndex];

  const isDone = status === 'done';

  return (
    <div className="flex flex-col h-full p-4 select-none bg-surface text-foreground">
      {/* 1. Barre d'en-tête du panneau droit : Titre avec ligne d'accent + Bouton DÉBUT */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-[#ff7c28] rounded-full inline-block" />
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900 dark:text-slate-100">
            {isDone
              ? isFrench ? 'RÉSUMÉ' : 'LESSON SUMMARY'
              : isFrench ? 'EXPLICATION DÉTAILLÉE' : 'DETAILED EXPLANATION'}
          </h2>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded border border-border bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title={isFrench ? 'Revenir au début' : 'Back to start'}
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isFrench ? 'DÉBUT' : 'OVERVIEW'}</span>
          </button>
        )}
      </div>

      {/* 2. Contenu principal : Résumé de fin de leçon OU explication de l'étape active */}
      <div className="flex-1 overflow-y-auto pt-3 space-y-4">
        {isDone ? (
          /* Vue Récapitulative / Fin de leçon */
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#ea580c] dark:text-[#ff7c28]">
              <span className="w-2.5 h-0.5 bg-[#ff7c28] rounded-full inline-block" />
              <span>{isFrench ? 'LEÇON TERMINÉE' : 'LESSON COMPLETE'}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight mt-1">
              {protocol.outro?.title || protocol.name}
            </h3>
            {protocol.outro?.desc && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {protocol.outro.desc}
              </p>
            )}

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-3 font-normal">
              {protocol.outro?.text || protocol.overview.description}
            </p>

            {/* Liste de faits clés récapitulatifs (MESSAGES, CHEMIN, CARTE, PROTÉGER PAR...) */}
            {protocol.outro?.facts && protocol.outro.facts.length > 0 && (
              <div className="pt-4 border-t border-border/60 space-y-3 mt-4">
                {protocol.outro.facts.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between text-xs gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 shrink-0 w-28">
                      {k}
                    </span>
                    <span className="font-mono text-xs text-slate-900 dark:text-slate-200 font-bold text-right flex-1 truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton pour visionner la vidéo explicative si disponible pour ce protocole */}
            {onWatchVideo && (
              <div className="pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={onWatchVideo}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  title={isFrench ? 'Voir la vidéo explicative du protocole' : 'Watch explanatory video'}
                >
                  <Video className="w-4 h-4" />
                  <span>{isFrench ? 'VOIR LA VIDÉO EXPLICATIVE' : 'WATCH EXPLANATORY VIDEO'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Vue Étape active */
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#ea580c] dark:text-[#ff7c28]">
              <span className="w-2.5 h-0.5 bg-[#ff7c28] rounded-full inline-block" />
              <span>{isFrench ? 'ÉTAPE' : 'STEP'} {currentStepIndex + 1} / {totalStepsCount}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight mt-1">
              {activeStepData?.title || protocol.name}
            </h3>
            {activeStepData?.desc && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {activeStepData.desc}
              </p>
            )}

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-3 font-normal">
              {activeStepData?.detail || protocol.overview.description}
            </p>

            {/* Paramètres de l'étape */}
            {activeStepData?.facts && activeStepData.facts.length > 0 && (
              <div className="pt-4 border-t border-border/60 space-y-3 mt-4">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">
                  {isFrench ? 'PARAMÈTRES DE CETTE ÉTAPE' : 'STEP PARAMETERS'}
                </div>
                {activeStepData.facts.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between text-xs gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 shrink-0 w-28">
                      {k}
                    </span>
                    <span className="font-mono text-xs text-slate-900 dark:text-slate-200 font-bold text-right flex-1 truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Aperçu du paquet actif avec bouton inspecter */}
            {activePacket && (
              <div className="p-2.5 rounded bg-surface-hover/60 border border-border flex items-center justify-between gap-2 mt-4">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-foreground font-mono truncate">
                    {activePacket.label}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-muted truncate">
                    {activePacket.row.src} → {activePacket.row.dst} ({activePacket.row.len})
                  </div>
                </div>
                {onInspectPacket && (
                  <button
                    type="button"
                    onClick={() => onInspectPacket(activePacket)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#ea580c] dark:text-[#ff7c28] bg-orange-500/10 hover:bg-orange-500/20 rounded border border-orange-500/30 transition-colors shrink-0"
                  >
                    <Search className="w-3 h-3" />
                    <span>{isFrench ? 'Inspecter' : 'Inspect'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Caractéristiques techniques globales du protocole */}
            {protocol.overview.facts && protocol.overview.facts.length > 0 && (
              <div className="pt-4 border-t border-border/60 space-y-2 mt-4">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">
                  {isFrench ? 'CARACTÉRISTIQUES TECHNIQUES' : 'TECHNICAL SPECIFICATIONS'} ({protocol.overview.facts.length})
                </div>
                {protocol.overview.facts.map(([label, val]) => (
                  <div key={label} className="flex items-baseline justify-between text-xs gap-3">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 shrink-0 w-28">
                      {label}
                    </span>
                    <span className="font-mono text-xs text-slate-900 dark:text-slate-200 font-bold text-right flex-1 truncate">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton pour visionner la vidéo explicative si disponible pour ce protocole */}
            {onWatchVideo && (
              <div className="pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={onWatchVideo}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  title={isFrench ? 'Voir la vidéo explicative du protocole' : 'Watch explanatory video'}
                >
                  <Video className="w-4 h-4" />
                  <span>{isFrench ? 'VOIR LA VIDÉO EXPLICATIVE' : 'WATCH EXPLANATORY VIDEO'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
