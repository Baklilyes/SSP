'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SimulationSnapshot } from '../../lib/simulation/SimulationEngine';
import { PacketEvent } from '../../lib/simulation/types';
import { getOsiSteps } from '../../lib/simulation/scenarios/osi/osiEvents';
import { OSILayer } from '../../lib/simulation/scenarios/osi/osiLayers';
import { OSIBuilding } from './OSIBuilding';
import { OSIPacket } from './OSIPacket';
import { OSIPacketHeader } from './OSIPacketHeader';
import { OSITimeline } from './OSITimeline';
import { OSIEventDetails } from './OSIEventDetails';
import { OSIControls } from './OSIControls';
import { OSILayerDetails } from './OSILayerDetails';
import { OSIInfographicOverlay } from './OSIInfographicOverlay';
import { Sparkles } from 'lucide-react';

export interface OSIExplorerProps {
  snapshot: SimulationSnapshot;
  onTogglePlay: () => void;
  onStep: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
  onJumpStep: (stepIndex: number) => void;
  onSelectPacket?: (packet: PacketEvent, index: number) => void;
  onNavigateToProtocol?: (protocolId: string) => void;
  isFrench?: boolean;
}

export function OSIExplorer({
  snapshot,
  onTogglePlay,
  onStep,
  onPrev,
  onReset,
  onSetSpeed,
  onJumpStep,
  onSelectPacket,
  onNavigateToProtocol,
  isFrench = true,
}: OSIExplorerProps) {
  const [selectedLayer, setSelectedLayer] = useState<OSILayer | null>(null);
  const isDone = snapshot.status === 'done';
  const [showInfographic, setShowInfographic] = useState(false);

  useEffect(() => {
    if (isDone) {
      setShowInfographic(true);
    } else {
      setShowInfographic(false);
    }
  }, [isDone]);

  const steps = useMemo(() => getOsiSteps(isFrench ? 'fr' : 'en'), [isFrench]);
  const currentStep = useMemo(() => {
    const idx = Math.min(snapshot.activeStep, steps.length - 1);
    return steps[idx] || steps[0];
  }, [snapshot.activeStep, steps]);

  const meta = currentStep.osiMeta;

  // Détermination des couches complétées selon l'étape actuelle
  const completedLayers = useMemo(() => {
    const step = snapshot.activeStep;
    if (step === 0) return [];
    if (step === 1) return [7];
    if (step === 2) return [7, 6];
    if (step === 3) return [7, 6, 5];
    if (step === 4) return [7, 6, 5, 4];
    if (step === 5) return [7, 6, 5, 4, 3];
    if (step === 6) return [7, 6, 5, 4, 3, 2];
    if (step === 7) return [7, 6, 5, 4, 3, 2, 1];
    if (step === 8) return [1];
    if (step === 9) return [1, 2];
    if (step === 10) return [1, 2, 3];
    if (step >= 11) return [1, 2, 3, 4, 5, 6, 7];
    return [];
  }, [snapshot.activeStep]);

  // En-tête mis en évidence selon l'action actuelle
  const highlightHeader = useMemo<'ethernet' | 'ipv4' | 'tcp' | 'payload' | undefined>(() => {
    if (meta.action === 'add-ethernet' || meta.action === 'strip-ethernet') return 'ethernet';
    if (meta.action === 'add-ip' || meta.action === 'strip-ip') return 'ipv4';
    if (meta.action === 'add-tcp' || meta.action === 'strip-tcp') return 'tcp';
    if (meta.action === 'data-created' || meta.action === 'data-delivered') return 'payload';
    return undefined;
  }, [meta.action]);

  const handleInspect = () => {
    if (snapshot.activePacket && onSelectPacket) {
      onSelectPacket(snapshot.activePacket, snapshot.activePacketIndex);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden">
      {/* Zone Principale à 3 Colonnes : 
          1. Chronologie verticale à gauche (12 étapes)
          2. Paquet animé & Tour des 7 couches au centre
          3. Détails de l'événement & En-têtes à droite */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Colonne 1 (Gauche) : Chronologie verticale des 12 étapes */}
        <div className="w-72 lg:w-80 shrink-0 h-full border-r border-border overflow-hidden flex flex-col">
          <OSITimeline
            activeStep={snapshot.activeStep}
            totalSteps={snapshot.totalSteps}
            onJumpStep={onJumpStep}
            isFrench={isFrench}
          />
        </div>

        {/* Colonne 2 (Centre) : Paquet animé & Tour des 7 couches OSI */}
        <div className="flex-1 min-h-0 flex flex-col border-r border-border overflow-y-auto p-4 gap-4 bg-background">
          {/* Bannière d'accès à la vidéo explicative récapitulative une fois la simulation terminée */}
          {isDone && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/40 text-xs font-mono shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 shrink-0">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Sparkles className="w-4 h-4 text-[#ff7c28] animate-pulse" />
                <span>
                  {isFrench
                    ? 'Déroulement terminé ! Modèle OSI prêt pour la synthèse'
                    : 'Simulation finished! OSI Model ready for summary'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfographic(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff7c28] hover:bg-[#e06818] text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <span>{isFrench ? 'Voir la vidéo' : 'Watch Video'}</span>
              </button>
            </div>
          )}

          {/* Représentation animée du paquet en transit */}
          <OSIPacket
            packetState={meta.packetState}
            activeLayer={meta.layer}
            direction={meta.direction}
            onInspect={handleInspect}
            isFrench={isFrench}
          />

          {/* Tour des 7 couches OSI */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <OSIBuilding
              activeLayer={meta.layer}
              completedLayers={completedLayers}
              direction={meta.direction}
              selectedLayerId={selectedLayer?.id}
              onSelectLayer={setSelectedLayer}
              onSelectProtocol={onNavigateToProtocol}
              isFrench={isFrench}
              packetState={meta.packetState}
            />
          </div>
        </div>

        {/* Colonne 3 (Droite) : Détails de l'étape & Structure d'en-tête */}
        <div className="w-full md:w-80 lg:w-[380px] xl:w-[420px] shrink-0 h-full flex flex-col bg-surface border-t md:border-t-0 border-border overflow-y-auto">
          {/* Détails explicatifs de l'événement */}
          <div className="flex-1 min-h-0">
            <OSIEventDetails
              activeStep={snapshot.activeStep}
              totalSteps={snapshot.totalSteps}
              onInspectPacket={handleInspect}
              isFrench={isFrench}
            />
          </div>

          {/* Décomposition visuelle des en-têtes (Headers) */}
          <div className="p-4 border-t border-border bg-surface-hover/30">
            <OSIPacketHeader
              packetState={meta.packetState}
              isFrench={isFrench}
              highlightHeader={highlightHeader}
            />
          </div>
        </div>
      </div>

      {/* Barre Inférieure : Contrôles de simulation unifiés */}
      <OSIControls
        status={snapshot.status}
        speed={snapshot.speed}
        activeStep={snapshot.activeStep}
        totalSteps={snapshot.totalSteps}
        started={snapshot.started}
        onTogglePlay={onTogglePlay}
        onStep={onStep}
        onPrev={onPrev}
        onReset={onReset}
        onSetSpeed={onSetSpeed}
        onJumpStep={onJumpStep}
        isFrench={isFrench}
      />

      {/* Modale d'informations de la couche sélectionnée */}
      <OSILayerDetails
        layer={selectedLayer}
        isOpen={!!selectedLayer}
        onClose={() => setSelectedLayer(null)}
        onNavigateToProtocol={onNavigateToProtocol}
        isFrench={isFrench}
      />

      {/* Superposition de l'infographie avec animation à la fin de la simulation */}
      <OSIInfographicOverlay
        isOpen={showInfographic}
        onClose={() => setShowInfographic(false)}
        onReplay={onReset}
        isFrench={isFrench}
      />
    </div>
  );
}
