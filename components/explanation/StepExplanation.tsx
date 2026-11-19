import React from 'react';
import { SimulationStep, PacketEvent } from '../../lib/simulation/types';
import { Badge } from '../ui/Badge';
import { Search } from 'lucide-react';

export interface StepExplanationProps {
  step: SimulationStep;
  stepIndex: number;
  totalSteps: number;
  activePacket: PacketEvent | null;
  onInspectPacket?: (packet: PacketEvent) => void;
}

export function StepExplanation({
  step,
  stepIndex,
  totalSteps,
  activePacket,
  onInspectPacket,
}: StepExplanationProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Badge et Titre */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="info" className="font-mono text-[10px]">
            Étape {stepIndex + 1} / {totalSteps}
          </Badge>
          <span className="text-xs text-muted font-medium">{step.desc}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          {step.title}
        </h3>
      </div>

      {/* Texte explicatif */}
      <p className="text-xs text-foreground/90 leading-relaxed bg-surface-hover/30 p-3 rounded-lg border border-border">
        {step.detail}
      </p>

      {/* Faits clés de l’étape */}
      {step.facts && step.facts.length > 0 && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {step.facts.map(([label, val]) => (
            <div
              key={label}
              className="p-2 rounded bg-surface border border-border"
            >
              <dt className="text-[10px] text-muted font-medium uppercase tracking-wider">
                {label}
              </dt>
              <dd className="text-xs text-foreground font-semibold mt-0.5 font-mono">
                {val}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Aperçu du paquet actif de l'étape */}
      {activePacket && (
        <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activePacket.color === 'blue'
                  ? 'bg-blue-500'
                  : activePacket.color === 'green'
                  ? 'bg-emerald-500'
                  : activePacket.color === 'amber'
                  ? 'bg-amber-500'
                  : 'bg-purple-500'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-foreground font-mono">
                {activePacket.label}
              </div>
              <div className="text-[11px] text-muted">
                {activePacket.row.src} → {activePacket.row.dst} ({activePacket.row.len})
              </div>
            </div>
          </div>

          {onInspectPacket && (
            <button
              onClick={() => onInspectPacket(activePacket)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#ea580c] dark:text-[#ff7c28] bg-orange-500/10 hover:bg-orange-500/20 rounded border border-orange-500/30 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Inspecter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
