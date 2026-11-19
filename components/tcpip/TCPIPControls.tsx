'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface TCPIPControlsProps {
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
  onJumpStep?: (stepIndex: number) => void;
  isFrench?: boolean;
}

export function TCPIPControls({
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
  isFrench = true,
}: TCPIPControlsProps) {
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const speeds = [0.5, 1, 1.5, 2];

  const isPlaying = status === 'running' || status === 'stepping';
  const isDone = status === 'done';

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-t border-border select-none">
      {/* Côté Gauche : Indicateurs d'étapes (Pills) */}
      <div className="flex items-center gap-1.5 hidden sm:flex">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onJumpStep && onJumpStep(idx)}
            title={isFrench ? `Étape ${idx + 1}` : `Step ${idx + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === activeStep && !isDone
                ? 'w-6 bg-[#ff7c28]'
                : idx < activeStep || isDone
                ? 'w-2 bg-emerald-500/70 hover:bg-emerald-500'
                : 'w-2 bg-border hover:bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Côté Droit : Boutons de commande */}
      <div className="flex items-center gap-2">
        {/* 1. Menu Vitesse */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
            className="h-8 px-3 bg-surface hover:bg-surface-hover border border-border rounded-md flex items-center gap-1.5 text-xs font-bold font-mono text-foreground transition-colors shadow-2xs cursor-pointer"
            title={isFrench ? 'Vitesse de simulation' : 'Simulation speed'}
          >
            <span>{speed}×</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted stroke-[2.5]" />
          </button>

          {speedMenuOpen && (
            <div className="absolute bottom-full right-0 mb-1 w-24 bg-surface border border-border rounded-lg shadow-xl p-1 z-30">
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
                      ? 'bg-orange-500/10 text-[#ff7c28] font-bold'
                      : 'text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Étape précédente */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!started || (activeStep === 0 && status === 'idle')}
          className={`h-8 w-8 bg-surface border border-border rounded-md flex items-center justify-center transition-colors shadow-2xs ${
            !started || (activeStep === 0 && status === 'idle')
              ? 'opacity-40 cursor-not-allowed text-muted'
              : 'hover:bg-surface-hover text-foreground cursor-pointer'
          }`}
          title={isFrench ? 'Étape précédente (Flèche Gauche)' : 'Previous step (Left Arrow)'}
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* 3. Bouton Principal : LECTURE / PAUSE / REVOIR */}
        <button
          type="button"
          onClick={isDone ? onReset : onTogglePlay}
          className="h-8 px-3.5 bg-[#ff7c28] hover:bg-[#e06818] text-white rounded-md flex items-center gap-1.5 text-xs font-bold font-mono shadow-xs cursor-pointer transition-all active:scale-95"
          title={
            isDone
              ? isFrench
                ? 'Revoir la simulation'
                : 'Replay simulation'
              : isPlaying
              ? isFrench
                ? 'Pause (Espace)'
                : 'Pause (Space)'
              : isFrench
              ? 'Lecture (Espace)'
              : 'Play (Space)'
          }
        >
          {isDone ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="uppercase tracking-wide">{isFrench ? 'REVOIR' : 'REPLAY'}</span>
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 stroke-[2.5] fill-white" />
              <span className="uppercase tracking-wide">PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 stroke-[2.5] fill-white" />
              <span className="uppercase tracking-wide">{isFrench ? 'LECTURE' : 'PLAY'}</span>
            </>
          )}
        </button>

        {/* 4. Avancer d'une étape */}
        <button
          type="button"
          onClick={onStep}
          disabled={isDone}
          className={`h-8 px-3 bg-surface border border-border rounded-md flex items-center gap-1.5 text-xs font-bold font-mono text-foreground transition-colors shadow-2xs ${
            isDone
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-surface-hover cursor-pointer active:scale-95'
          }`}
          title={isFrench ? 'Avancer d’une étape (Flèche Droite)' : 'Step forward (Right Arrow)'}
        >
          <span className="uppercase tracking-wide">{isFrench ? 'AVANCER' : 'STEP'}</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* 5. Réinitialiser */}
        <button
          type="button"
          onClick={onReset}
          className="h-8 px-2.5 bg-surface hover:bg-surface-hover border border-border rounded-md flex items-center gap-1.5 text-xs font-bold font-mono text-foreground transition-colors shadow-2xs cursor-pointer active:scale-95"
          title={isFrench ? 'Réinitialiser au début (Échap)' : 'Reset to start (Esc)'}
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted stroke-[2.5]" />
          <span className="uppercase tracking-wide hidden md:inline">
            {isFrench ? 'RÉINITIALISER' : 'RESET'}
          </span>
        </button>
      </div>
    </div>
  );
}
