'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CommandPalette } from '../components/layout/CommandPalette';
import { ShortcutsModal } from '../components/layout/ShortcutsModal';
import { NetworkDiagram } from '../components/network/NetworkDiagram';
import { SequenceDiagram } from '../components/sequence/SequenceDiagram';
import { ProtocolOverview } from '../components/explanation/ProtocolOverview';
import { PacketFlowTable } from '../components/packet/PacketFlowTable';
import { PacketInspector } from '../components/packet/PacketInspector';
import { OSIExplorer } from '../components/osi';
import { TCPIPExplorer } from '../components/tcpip';
import { EncapsulationView } from '../components/encapsulation';
import { DHCPVideoOverlay } from '../components/dhcp';
import { HTTPVideoOverlay } from '../components/http';
import { SSPLandingPage } from '../components/home/SSPLandingPage';

import { PROTOCOLS_REGISTRY, getProtocol } from '../lib/protocols/registry';
import { SimulationEngine, SimulationSnapshot } from '../lib/simulation/SimulationEngine';
import { PacketEvent } from '../lib/simulation/types';
import { useTheme } from '../hooks/useTheme';
import { useInspector } from '../hooks/useInspector';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { GitCommit, Layers, Video, Sparkles } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function HomePage() {
  const [currentProtocolId, setCurrentProtocolId] = useState('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'topology' | 'sequence'>('topology');
  const [showDhcpVideo, setShowDhcpVideo] = useState(false);
  const [showHttpVideo, setShowHttpVideo] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { locale } = useLanguage();
  const inspector = useInspector();

  // Protocole actif (localisé selon la langue sélectionnée)
  const activeProtoId = currentProtocolId === 'welcome' ? 'osi' : currentProtocolId;
  const protocol = useMemo(() => getProtocol(activeProtoId, locale), [activeProtoId, locale]);

  const [engine, setEngine] = useState<SimulationEngine | null>(null);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot | null>(null);

  // Le moteur de simulation dépend du protocole sélectionné pour ne pas réinitialiser
  // la lecture lors d'un simple basculement de langue
  useEffect(() => {
    const protoId = currentProtocolId === 'welcome' ? 'osi' : currentProtocolId;
    const baseProto = getProtocol(protoId);
    const newEngine = new SimulationEngine(baseProto);
    setEngine(newEngine);
    const unsubscribe = newEngine.subscribe(setSnapshot);
    return () => {
      unsubscribe();
    };
  }, [currentProtocolId]);

  // Affichage automatique de la vidéo explicative à la fin du déroulement DHCP
  useEffect(() => {
    if (currentProtocolId === 'dhcp' && snapshot?.status === 'done') {
      setShowDhcpVideo(true);
    } else if (snapshot?.status !== 'done') {
      setShowDhcpVideo(false);
    }
  }, [currentProtocolId, snapshot?.status]);

  // Affichage automatique de la vidéo explicative à la fin du déroulement HTTP
  useEffect(() => {
    if (currentProtocolId === 'http' && snapshot?.status === 'done') {
      setShowHttpVideo(true);
    } else if (snapshot?.status !== 'done') {
      setShowHttpVideo(false);
    }
  }, [currentProtocolId, snapshot?.status]);

  // Contrôles de simulation
  const handleTogglePlay = useCallback(() => engine?.toggle(), [engine]);
  const handleStepForward = useCallback(() => engine?.step(), [engine]);
  const handleStepBackward = useCallback(() => engine?.prev(), [engine]);
  const handleJumpStep = useCallback((idx: number) => engine?.jump(idx), [engine]);
  const handleReset = useCallback(() => engine?.reset(), [engine]);
  const handleSetSpeed = useCallback((s: number) => engine?.setSpeed(s), [engine]);

  // Inspection de paquet
  const handleSelectPacket = useCallback(
    (packet: PacketEvent, index: number) => {
      inspector.open(packet, index);
    },
    [inspector]
  );

  // Raccourcis clavier globaux
  useKeyboardShortcuts({
    onTogglePlay: handleTogglePlay,
    onStepForward: handleStepForward,
    onStepBackward: handleStepBackward,
    onEscape: handleReset,
    onToggleView: () => setViewMode((v) => (v === 'topology' ? 'sequence' : 'topology')),
    onToggleList: () => setIsSidebarOpen((o) => !o),
    onToggleFocus: () => {},
    onOpenSearch: () => setIsSearchOpen(true),
    onOpenShortcuts: () => setIsShortcutsOpen(true),
    onChangeSpeed: (delta) => {
      const speeds = [0.5, 1, 1.5, 2];
      const curIdx = speeds.indexOf(snapshot?.speed ?? 1);
      const nextIdx = Math.max(0, Math.min(speeds.length - 1, curIdx + delta));
      handleSetSpeed(speeds[nextIdx]);
    },
  });

  // Page d'accueil style Google épurée "Welcome to SSP Academy"
  if (currentProtocolId === 'welcome') {
    return (
      <div className="h-screen w-screen overflow-auto bg-white dark:bg-[#080d1a]">
        <SSPLandingPage
          onSelectOSI={() => {
            setCurrentProtocolId('osi');
            inspector.close();
          }}
          onSelectTCPIP={() => {
            setCurrentProtocolId('tcpip');
            inspector.close();
          }}
          onSelectInteractiveProtocol={() => {
            setCurrentProtocolId('http');
            setIsSidebarOpen(true);
            inspector.close();
          }}
          onSelectProtocol={(id) => {
            setCurrentProtocolId(id);
            inspector.close();
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          isFrench={locale === 'fr'}
        />

        <CommandPalette
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelect={(id) => {
            setCurrentProtocolId(id);
            setIsSearchOpen(false);
            inspector.close();
          }}
        />

        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />
      </div>
    );
  }

  if (!snapshot) return null;

  const currentStep = protocol.steps[snapshot.activeStep];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      {/* 0. Entête Topbar Officielle */}
      <Topbar
        protocolLayer={protocol.layer}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
        viewMode={viewMode}
        onToggleView={() => setViewMode((v) => (v === 'topology' ? 'sequence' : 'topology'))}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectOSI={() => {
          setCurrentProtocolId('osi');
          inspector.close();
        }}
        onSelectTCPIP={() => {
          setCurrentProtocolId('tcpip');
          inspector.close();
        }}
        onSelectEncapsulation={() => {
          setCurrentProtocolId('encapsulation');
          inspector.close();
        }}
        onGoHome={() => {
          setCurrentProtocolId('welcome');
          inspector.close();
        }}
        isOSI={currentProtocolId === 'osi'}
        isTCPIP={currentProtocolId === 'tcpip'}
        isEncapsulation={currentProtocolId === 'encapsulation'}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Si c'est le Modèle OSI, TCP/IP ou Encapsulation, afficher la vue plein écran dédiée */}
        {currentProtocolId === 'osi' ? (
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
            <OSIExplorer
              snapshot={snapshot}
              onTogglePlay={handleTogglePlay}
              onStep={handleStepForward}
              onPrev={handleStepBackward}
              onReset={handleReset}
              onSetSpeed={handleSetSpeed}
              onJumpStep={handleJumpStep}
              onSelectPacket={handleSelectPacket}
              onNavigateToProtocol={(protoId) => {
                setCurrentProtocolId(protoId);
                inspector.close();
              }}
              isFrench={locale === 'fr'}
            />
          </main>
        ) : currentProtocolId === 'tcpip' ? (
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
            <TCPIPExplorer
              snapshot={snapshot}
              onTogglePlay={handleTogglePlay}
              onStep={handleStepForward}
              onPrev={handleStepBackward}
              onReset={handleReset}
              onSetSpeed={handleSetSpeed}
              onJumpStep={handleJumpStep}
              onSelectPacket={handleSelectPacket}
              onNavigateToProtocol={(protoId) => {
                setCurrentProtocolId(protoId);
                inspector.close();
              }}
              onNavigateToOSI={() => {
                setCurrentProtocolId('osi');
                inspector.close();
              }}
              isFrench={locale === 'fr'}
            />
          </main>
        ) : currentProtocolId === 'encapsulation' ? (
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
            <EncapsulationView
              onSelectOSI={() => {
                setCurrentProtocolId('osi');
                inspector.close();
              }}
              onSelectTCPIP={() => {
                setCurrentProtocolId('tcpip');
                inspector.close();
              }}
              isFrench={locale === 'fr'}
            />
          </main>
        ) : (
          <>
            {/* 1. Colonne de Gauche : Barre latérale (Pleine hauteur) */}
            <Sidebar
              currentProtocolId={currentProtocolId}
              onSelectProtocol={(id) => {
                setCurrentProtocolId(id);
                inspector.close();
              }}
              isOpen={isSidebarOpen}
              activeStep={snapshot.activeStep}
              onSelectStep={(protoId, stepIdx) => {
                if (protoId !== currentProtocolId) {
                  setCurrentProtocolId(protoId);
                }
                handleJumpStep(stepIdx);
              }}
              status={snapshot.status}
              onOpenSearch={() => setIsSearchOpen(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />

            {/* 2. Colonne Centrale : Scène (Topologie/Séquence) + Flux des paquets avec contrôles */}
            <main className="flex-1 flex flex-col min-w-0 h-full border-r border-border overflow-hidden bg-background">
              {/* Bannière vidéo DHCP récapitulative une fois la simulation terminée */}
              {currentProtocolId === 'dhcp' && snapshot.status === 'done' && (
                <div className="flex items-center justify-between p-3 m-3 mb-0 rounded-xl bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-amber-500/15 border border-amber-500/40 text-xs font-mono shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 shrink-0">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>
                      {locale === 'fr'
                        ? 'Simulation DHCP terminée ! Vidéo explicative disponible'
                        : 'DHCP simulation completed! Explanatory video available'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDhcpVideo(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{locale === 'fr' ? 'Voir la vidéo' : 'Watch Video'}</span>
                  </button>
                </div>
              )}

              {/* Bannière vidéo HTTP récapitulative une fois la simulation terminée */}
              {currentProtocolId === 'http' && snapshot.status === 'done' && (
                <div className="flex items-center justify-between p-3 m-3 mb-0 rounded-xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/40 text-xs font-mono shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 shrink-0">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Sparkles className="w-4 h-4 text-[#ff7c28] animate-pulse" />
                    <span>
                      {locale === 'fr'
                        ? 'Simulation HTTP terminée ! Vidéo explicative disponible'
                        : 'HTTP simulation completed! Explanatory video available'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHttpVideo(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff7c28] hover:bg-[#e06818] text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{locale === 'fr' ? 'Voir la vidéo' : 'Watch Video'}</span>
                  </button>
                </div>
              )}

              {/* Scène (Topologie ou Séquence) */}
              <div className="flex-1 min-h-0 relative">
                {/* Boutons Sélecteur Réseau / Séquence en haut à droite */}
                <div className="absolute top-3 right-3 z-30 flex items-center p-0.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-lg shadow-sm">
                  <button
                    onClick={() => setViewMode('topology')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                      viewMode === 'topology'
                        ? 'bg-[#ff7c28] text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Vue Réseau (Topologie)"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>RÉSEAU</span>
                  </button>
                  <button
                    onClick={() => setViewMode('sequence')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                      viewMode === 'sequence'
                        ? 'bg-[#ff7c28] text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Vue Diagramme de Séquence"
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>SÉQUENCE</span>
                  </button>
                </div>

                {viewMode === 'topology' ? (
                  <NetworkDiagram
                    visibleNodes={snapshot.visibleNodes}
                    protocolNodes={protocol.nodes}
                    labels={protocol.labels}
                    activePacket={snapshot.activePacket}
                    shownPackets={snapshot.shownPackets}
                    urlBarText={snapshot.urlBarText}
                    isRendered={snapshot.isRendered}
                    speed={snapshot.speed}
                    activeStep={snapshot.activeStep}
                    totalSteps={snapshot.totalSteps}
                    stepTitle={currentStep?.title}
                    status={snapshot.status}
                    theme={theme}
                    onSelectPacket={(pkt) => handleSelectPacket(pkt, snapshot.activePacketIndex)}
                  />
                ) : (
                  <SequenceDiagram
                    nodes={protocol.nodes}
                    labels={protocol.labels}
                    packets={snapshot.shownPackets}
                    activeIndex={snapshot.activePacketIndex}
                    onSelectPacket={handleSelectPacket}
                    theme={theme}
                  />
                )}
              </div>

              {/* Flux des paquets avec contrôles intégrés dans son en-tête */}
              <div className="h-60 shrink-0 border-t border-border">
                <PacketFlowTable
                  packets={snapshot.shownPackets}
                  activeIndex={snapshot.activePacketIndex}
                  onSelectPacket={handleSelectPacket}
                  legend={protocol.legend}
                  status={snapshot.status}
                  speed={snapshot.speed}
                  activeStep={snapshot.activeStep}
                  totalSteps={snapshot.totalSteps}
                  started={snapshot.started}
                  onTogglePlay={handleTogglePlay}
                  onStep={handleStepForward}
                  onPrev={handleStepBackward}
                  onReset={handleReset}
                  onSetSpeed={handleSetSpeed}
                />
              </div>
            </main>

            {/* 3. Colonne de Droite : Résumé / Explication (Pleine hauteur) */}
            <aside className="w-80 lg:w-96 shrink-0 h-full flex flex-col bg-surface overflow-y-auto">
              <ProtocolOverview
                protocol={protocol}
                activeStep={snapshot.activeStep}
                totalSteps={snapshot.totalSteps}
                status={snapshot.status}
                activePacket={snapshot.activePacket}
                onJumpStep={handleJumpStep}
                onInspectPacket={(pkt) => handleSelectPacket(pkt, snapshot.activePacketIndex)}
                onReset={handleReset}
                onWatchVideo={
                  currentProtocolId === 'dhcp'
                    ? () => setShowDhcpVideo(true)
                    : currentProtocolId === 'http'
                    ? () => setShowHttpVideo(true)
                    : undefined
                }
              />
            </aside>
          </>
        )}
      </div>

      {/* 4. Modales et Inspecteurs */}
      <PacketInspector
        packet={inspector.activePacket}
        index={inspector.inspectedIndex}
        totalPackets={snapshot.shownPackets.length}
        isOpen={inspector.isOpen}
        onClose={inspector.close}
        onPrevPacket={() => inspector.step(-1, snapshot.shownPackets)}
        onNextPacket={() => inspector.step(1, snapshot.shownPackets)}
      />

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(id) => {
          setCurrentProtocolId(id);
          inspector.close();
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* 5. Overlay Vidéo pour le protocole DHCP à la fin de la simulation */}
      <DHCPVideoOverlay
        isOpen={showDhcpVideo}
        onClose={() => setShowDhcpVideo(false)}
        onReplay={handleReset}
        isFrench={locale === 'fr'}
      />

      {/* 6. Overlay Vidéo pour le protocole HTTP à la fin de la simulation */}
      <HTTPVideoOverlay
        isOpen={showHttpVideo}
        onClose={() => setShowHttpVideo(false)}
        onReplay={handleReset}
        isFrench={locale === 'fr'}
      />
    </div>
  );
}
