'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronDown } from 'lucide-react';

export interface StageControlsProps {
  status: 'idle' | 'running' | 'paused' | 'stepping' | 'done';
  speed: number;
  activeStep: number;
  totalSteps: number;
  started?: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
  onJumpStep: (stepIndex: number) => void;
}

export function StageControls({
  status,
  speed,
  activeStep,
  totalSteps,
  started = false,
  onTogglePlay,
  onStep,
  onPrev,
  onReset,
  onSetSpeed,
  onJumpStep,
}: StageControlsProps) {
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const speeds = [0.5, 1, 1.5, 2];

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-t border-border select-none">
      {/* Côté Gauche : Indicateurs discrets d'étapes (Pills) */}
      <div className="flex items-center gap-1.5 hidden sm:flex">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onJumpStep(idx)}
            title={`Étape ${idx + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === activeStep && status !== 'done'
                ? 'w-6 bg-blue-600 dark:bg-sky-500'
                : idx < activeStep || status === 'done'
                ? 'w-2 bg-emerald-500/70 hover:bg-emerald-500'
                : 'w-2 bg-border hover:bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Côté Droit : Les 5 boutons alignés fidèlement à la capture */}
      <div className="flex items-center gap-2">
        {/* 1. Menu Vitesse [ 1× v ] */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
            className="h-8 px-3 bg-white dark:bg-slate-900 border border-[#c5d0e6] dark:border-slate-700 rounded-md flex items-center gap-1.5 text-xs font-bold font-mono text-[#1e255e] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Vitesse de lecture ([ et ])"
          >
            <span>{speed}×</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#1e255e] dark:text-slate-300 stroke-[2.5]" />
          </button>

          {speedMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-24 bg-surface border border-border rounded-lg shadow-xl p-1 z-30">
              {speeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onSetSpeed(s);
                    setSpeedMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-xs rounded font-mono ${
                    s === speed
                      ? 'bg-blue-600/10 text-blue-600 dark:text-sky-400 font-bold'
                      : 'text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Étape précédente [ < ] */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!started || (activeStep === 0 && status === 'idle')}
          className={`h-8 w-8 bg-white dark:bg-slate-900 border border-[#c5d0e6] dark:border-slate-700 rounded-md flex items-center justify-center transition-colors shadow-2xs ${
            !started || (activeStep === 0 && status === 'idle')
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : 'text-[#1e255e] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
          }`}
          title="Étape précédente (Flèche Gauche)"
          aria-label="Étape précédente"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* 3. Bouton Lecture / Pause / Rejouer [ ▶ LECTURE ] */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="h-8 px-4 bg-[#253887] hover:bg-[#1d2d70] text-white rounded-md flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
          title="Lecture / Pause (Espace)"
        >
          {status === 'running' ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : status === 'done' ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>REJOUER</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>LECTURE</span>
            </>
          )}
        </button>

        {/* 4. Bouton Avancer [ AVANCER ] */}
        <button
          type="button"
          onClick={onStep}
          disabled={status === 'done'}
          className={`h-8 px-3.5 bg-white dark:bg-slate-900 border border-[#c5d0e6] dark:border-slate-700 rounded-md flex items-center justify-center font-bold text-xs uppercase tracking-wide text-[#1e255e] dark:text-slate-200 transition-colors shadow-2xs ${
            status === 'done'
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
          }`}
          title="Avancer d’une étape (Flèche Droite ou S)"
        >
          <span>AVANCER</span>
        </button>

        {/* 5. Bouton Réinitialiser [ ↺ RÉINITIALISER ] */}
        <button
          type="button"
          onClick={onReset}
          className="h-8 px-3.5 bg-white dark:bg-slate-900 border border-[#c5d0e6] dark:border-slate-700 rounded-md flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-[#1e255e] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          title="Réinitialiser (Échap)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#1e255e] dark:text-slate-200 stroke-[2.2]" />
          <span>RÉINITIALISER</span>
        </button>
      </div>
    </div>
  );
}
