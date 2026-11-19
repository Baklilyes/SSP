import React from 'react';
import { ProtocolOutro } from '../../lib/simulation/types';
import { Button } from '../ui/Button';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

export interface LessonOutroProps {
  outro: ProtocolOutro;
  onReplay: () => void;
}

export function LessonOutro({ outro, onReplay }: LessonOutroProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 text-emerald-400">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Simulation terminée
        </span>
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          {outro.title}
        </h3>
        <p className="text-xs text-[#ea580c] dark:text-[#ff7c28] font-medium mt-0.5">{outro.desc}</p>
      </div>

      <p className="text-xs text-muted leading-relaxed bg-surface-hover/30 p-3 rounded-lg border border-border">
        {outro.text}
      </p>

      {/* Métriques récapitulatives */}
      <div>
        <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
          Bilan de l’échange
        </h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {outro.facts.map(([label, val]) => (
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
      </div>

      <Button
        variant="primary"
        onClick={onReplay}
        className="w-full gap-2 py-2 mt-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Rejouer la leçon</span>
      </Button>
    </div>
  );
}
