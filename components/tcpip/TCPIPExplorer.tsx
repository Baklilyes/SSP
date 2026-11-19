'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SimulationSnapshot } from '../../lib/simulation/SimulationEngine';
import { PacketEvent } from '../../lib/simulation/types';
import { getTcpipSteps } from '../../lib/simulation/scenarios/tcpip/tcpipEvents';
import { TCPIPLayer } from '../../lib/simulation/scenarios/tcpip/tcpipLayers';
import { TCPIPStack } from './TCPIPStack';
import { TCPIPPacket } from './TCPIPPacket';
import { TCPIPPacketInspector } from './TCPIPPacketInspector';
import { TCPIPTimeline } from './TCPIPTimeline';
import { TCPIPEventDetails } from './TCPIPEventDetails';
import { TCPIPControls } from './TCPIPControls';
import { TCPIPLayerDetails } from './TCPIPLayerDetails';
import { TCPIPComparison } from './TCPIPComparison';
import { TCPIPRouterPath } from './TCPIPRouterPath';
import { TCPIPInfographicOverlay } from './TCPIPInfographicOverlay';
import { Sparkles, Scale, Layers, Video } from 'lucide-react';

export interface TCPIPExplorerProps {
  snapshot: SimulationSnapshot;
  onTogglePlay: () => void;
  onStep: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
  onJumpStep: (stepIndex: number) => void;
  onSelectPacket?: (packet: PacketEvent, index: number) => void;
  onNavigateToProtocol?: (protocolId: string) => void;
  onNavigateToOSI?: () => void;
  isFrench?: boolean;
}

export function TCPIPExplorer({
  snapshot,
  onTogglePlay,
  onStep,
  onPrev,
  onReset,
  onSetSpeed,
  onJumpStep,
  onSelectPacket,
  onNavigateToProtocol,
  onNavigateToOSI,
  isFrench = true,
}: TCPIPExplorerProps) {
  const [selectedLayer, setSelectedLayer] = useState<TCPIPLayer | null>(null);
  const [transportType, setTransportType] = useState<'TCP' | 'UDP'>('TCP');
  const [networkAccessType, setNetworkAccessType] = useState<'Ethernet' | 'Wi-Fi'>('Ethernet');
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isHybridOpen, setIsHybridOpen] = useState(false);

  const isDone = snapshot.status === 'done';
  const [showInfographic, setShowInfographic] = useState(false);

  useEffect(() => {
    if (isDone) {
      setShowInfographic(true);
    } else {
      setShowInfographic(false);
    }
  }, [isDone]);

  const steps = useMemo(
    () => getTcpipSteps(isFrench ? 'fr' : 'en', transportType, networkAccessType),
    [isFrench, transportType, networkAccessType]
  );

  const currentStep = useMemo(() => {
    const idx = Math.min(snapshot.activeStep, steps.length - 1);
    return steps[idx] || steps[0];
  }, [snapshot.activeStep, steps]);

  const meta = currentStep.tcpipMeta;

  // Détermination des couches complétées selon l'étape actuelle (1 à 4)
  const completedLayers = useMemo(() => {
    const step = snapshot.activeStep;
    if (step === 0) return [];
    if (step === 1) return [4];
    if (step === 2) return [4, 3];
    if (step === 3) return [4, 3, 2];
    if (step >= 4 && step <= 7) return [4, 3, 2, 1];
    if (step === 8) return [1];
    if (step === 9) return [1, 2];
    if (step === 10) return [1, 2, 3];
    if (step >= 11) return [1, 2, 3, 4];
    return [];
  }, [snapshot.activeStep]);

  // En-tête mis en évidence selon l'action actuelle
  const highlightHeader = useMemo<'access' | 'internet' | 'transport' | 'payload' | undefined>(() => {
    if (meta.action === 'frame-created' || meta.action === 'frame-processed') return 'access';
    if (meta.action === 'ip-header-added' || meta.action === 'ip-header-processed' || meta.action === 'router-hop')
      return 'internet';
    if (meta.action === 'transport-header-added' || meta.action === 'transport-header-processed')
      return 'transport';
    if (meta.action === 'application-data-created' || meta.action === 'application-data-delivered')
      return 'payload';
    return undefined;
  }, [meta.action]);

  const handleInspect = () => {
    if (snapshot.activePacket && onSelectPacket) {
      onSelectPacket(snapshot.activePacket, snapshot.activePacketIndex);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden">
      {/* Zone Principale à 3 Colonnes */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Colonne 1 (Gauche) : Chronologie verticale des 12 étapes */}
        <div className="w-72 lg:w-80 shrink-0 h-full border-r border-border overflow-hidden flex flex-col">
          <TCPIPTimeline
            activeStep={snapshot.activeStep}
            totalSteps={snapshot.totalSteps}
            onJumpStep={onJumpStep}
            transportType={transportType}
            isFrench={isFrench}
          />
        </div>

        {/* Colonne 2 (Centre) : Paquet animé, Topologie Routage & Pile des 4 couches TCP/IP */}
        <div className="flex-1 min-h-0 flex flex-col border-r border-border overflow-y-auto p-4 gap-4 bg-background">
          {/* Bannière de fin de cycle */}
          {isDone && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sky-500/15 via-orange-500/10 to-sky-500/15 border border-sky-500/40 text-xs font-mono shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 shrink-0">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
                <span>
                  {isFrench
                    ? 'Déroulement terminé ! Modèle TCP/IP prêt pour la synthèse'
                    : 'Simulation finished! TCP/IP Model ready for summary'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInfographic(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                  title={isFrench ? 'Voir la vidéo explicative TCP/IP' : 'Watch TCP/IP Explanatory Video'}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{isFrench ? 'Voir la vidéo' : 'Watch Video'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsComparisonOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-foreground font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isFrench ? 'Comparatif OSI' : 'OSI Comparison'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Représentation animée du paquet en transit */}
          <TCPIPPacket
            packetState={meta.packetState}
            activeLayer={meta.layer}
            direction={meta.direction}
            onInspect={handleInspect}
            isFrench={isFrench}
          />

          {/* Topologie de routage IP si étape de transit/routage */}
          <TCPIPRouterPath
            currentHop={meta.packetState.routerHopCount ?? (meta.node === 'router1' ? 1 : 0)}
            routerInfo={meta.routerInfo}
            isFrench={isFrench}
          />

          {/* Pile des 4 couches TCP/IP */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <TCPIPStack
              activeLayer={meta.layer}
              completedLayers={completedLayers}
              direction={meta.direction}
              selectedLayerId={selectedLayer?.id}
              onSelectLayer={setSelectedLayer}
              onSelectProtocol={onNavigateToProtocol}
              transportType={transportType}
              onSelectTransport={setTransportType}
              networkAccessType={networkAccessType}
              onSelectNetworkAccess={setNetworkAccessType}
              onOpenComparison={() => setIsComparisonOpen(true)}
              onOpenHybrid={() => setIsComparisonOpen(true)}
              isFrench={isFrench}
              packetState={meta.packetState}
            />
          </div>
        </div>

        {/* Colonne 3 (Droite) : Détails de l'étape & Structure d'en-tête */}
        <div className="w-full md:w-80 lg:w-[380px] xl:w-[420px] shrink-0 h-full flex flex-col bg-surface border-t md:border-t-0 border-border overflow-y-auto">
          {/* Détails explicatifs de l'événement */}
          <div className="flex-1 min-h-0">
            <TCPIPEventDetails
              activeStep={snapshot.activeStep}
              totalSteps={snapshot.totalSteps}
              onInspectPacket={handleInspect}
              transportType={transportType}
              isFrench={isFrench}
            />
          </div>

          {/* Décomposition visuelle des en-têtes */}
          <div className="p-4 border-t border-border bg-surface-hover/30">
            <TCPIPPacketInspector
              packetState={meta.packetState}
              isFrench={isFrench}
              highlightHeader={highlightHeader}
            />
          </div>
        </div>
      </div>

      {/* Barre Inférieure : Contrôles de simulation unifiés */}
      <TCPIPControls
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
      <TCPIPLayerDetails
        layer={selectedLayer}
        isOpen={!!selectedLayer}
        onClose={() => setSelectedLayer(null)}
        onNavigateToProtocol={onNavigateToProtocol}
        isFrench={isFrench}
      />

      {/* Modale d'analyse comparative OSI ↔ TCP/IP et modèle hybride 5 couches */}
      <TCPIPComparison
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onNavigateToOSI={onNavigateToOSI}
        isFrench={isFrench}
      />

      {/* Superposition de l'infographie avec animation à la fin de la simulation TCP/IP */}
      <TCPIPInfographicOverlay
        isOpen={showInfographic}
        onClose={() => setShowInfographic(false)}
        onReplay={onReset}
        isFrench={isFrench}
      />
    </div>
  );
}
