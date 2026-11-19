'use client';

import React from 'react';
import { getTcpipSteps } from '../../lib/simulation/scenarios/tcpip/tcpipEvents';
import { getTCPIPLayerByNumber } from '../../lib/simulation/scenarios/tcpip/tcpipLayers';
import { Info, ArrowDown, ArrowUp, Zap, Search, ShieldCheck, GitBranch } from 'lucide-react';

export interface TCPIPEventDetailsProps {
  activeStep: number;
  totalSteps: number;
  onInspectPacket?: () => void;
  transportType?: 'TCP' | 'UDP';
  isFrench?: boolean;
}

export function TCPIPEventDetails({
  activeStep,
  totalSteps,
  onInspectPacket,
  transportType = 'TCP',
  isFrench = true,
}: TCPIPEventDetailsProps) {
  const steps = getTcpipSteps(isFrench ? 'fr' : 'en', transportType);
  const currentStep = steps[activeStep] || steps[0];
  const meta = currentStep.tcpipMeta;
  const layerInfo = getTCPIPLayerByNumber(meta.layer);

  const directionLabel =
    meta.direction === 'encapsulation'
      ? isFrench
        ? 'Émetteur (Encapsulation)'
        : 'Sender (Encapsulation)'
      : meta.direction === 'routing'
      ? isFrench
        ? 'Routeur (Routage IP L2)'
        : 'Router (L2 IP Routing)'
      : meta.direction === 'transmission'
      ? isFrench
        ? 'Transmission physique (Transit)'
        : 'Physical Transmission (Transit)'
      : isFrench
      ? 'Destinataire (Décapsulation)'
      : 'Receiver (Decapsulation)';

  return (
    <div className="flex flex-col h-full bg-surface p-5 select-none overflow-y-auto">
      {/* 1. Entête de l'étape */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-[#ff7c28] tracking-wider uppercase">
            — {isFrench ? 'ÉTAPE' : 'STEP'} {activeStep + 1} / {totalSteps}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
              meta.direction === 'encapsulation'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : meta.direction === 'routing'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                : meta.direction === 'transmission'
                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
            }`}
          >
            {meta.direction === 'encapsulation' ? (
              <ArrowDown className="w-3 h-3" />
            ) : meta.direction === 'routing' ? (
              <GitBranch className="w-3 h-3" />
            ) : meta.direction === 'transmission' ? (
              <Zap className="w-3 h-3" />
            ) : (
              <ArrowUp className="w-3 h-3" />
            )}
            <span>{directionLabel}</span>
          </span>
        </div>

        <h1 className="text-lg font-bold font-mono text-foreground leading-tight">
          {currentStep.title}
        </h1>
        <p className="text-xs text-muted font-sans mt-1">
          {currentStep.desc}
        </p>
      </div>

      {/* 2. Explication détaillée */}
      <div className="py-4 border-b border-border">
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#ff7c28]" />
          <span>{isFrench ? 'Fonctionnement au sein du modèle TCP/IP' : 'Operation within TCP/IP Model'}</span>
        </h2>
        <p className="text-sm text-foreground/90 font-sans leading-relaxed">
          {currentStep.detail}
        </p>
      </div>

      {/* 3. Paramètres & Faits techniques de l'étape */}
      <div className="py-4 border-b border-border space-y-2.5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ff7c28]" />
          <span>{isFrench ? 'Paramètres de cette étape' : 'Technical Parameters of this Step'}</span>
        </h2>

        <div className="space-y-1.5">
          {(currentStep.facts || []).map(([k, v], idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-surface-hover border border-border text-xs font-mono"
            >
              <span className="text-muted">{k}</span>
              <span className="font-bold text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action d'inspection de paquet */}
      {onInspectPacket && (
        <div className="pt-4">
          <button
            type="button"
            onClick={onInspectPacket}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#ff7c28] border border-orange-500/30 hover:border-orange-500 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>
              {isFrench
                ? 'Inspecter les octets & en-têtes réels'
                : 'Inspect raw bytes & headers in dissector'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
