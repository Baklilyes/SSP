'use client';

import React, { useState } from 'react';
import { HYBRID_5_LAYERS } from '../../lib/simulation/scenarios/tcpip/tcpipLayers';
import { X, Scale, Layers, ArrowRight, BookOpen, Check } from 'lucide-react';

export interface TCPIPComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOSI?: () => void;
  isFrench?: boolean;
}

export function TCPIPComparison({
  isOpen,
  onClose,
  onNavigateToOSI,
  isFrench = true,
}: TCPIPComparisonProps) {
  const [activeTab, setActiveTab] = useState<'comparison' | 'hybrid'>('comparison');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isFrench ? 'Comparatif Modèle OSI vs TCP/IP' : 'OSI vs TCP/IP Model Comparison'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col max-w-3xl w-full max-h-[92vh] bg-surface border border-orange-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Entête avec onglets */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-hover/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/15 text-[#ff7c28] border border-orange-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-foreground uppercase tracking-wide">
                {isFrench ? 'Analyse Comparative : Modèle OSI ↔ TCP/IP' : 'Comparative Analysis: OSI ↔ TCP/IP'}
              </h2>
              <p className="text-xs text-muted font-sans mt-0.5">
                {isFrench
                  ? 'Architecture théorique (7 couches ISO) vs Implémentation réelle d’Internet (4 couches DoD)'
                  : 'Theoretical framework (7 ISO layers) vs Real Internet architecture (4 DoD layers)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            title={isFrench ? 'Fermer (Échap)' : 'Close (Esc)'}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre d'onglets : [ Comparatif 7 vs 4 ] [ Modèle Hybride 5 Couches ] */}
        <div className="flex border-b border-border bg-surface px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'comparison'
                ? 'border-[#ff7c28] text-[#ff7c28]'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {isFrench ? '1. Correspondance Modèle OSI (7) ↔ TCP/IP (4)' : '1. OSI (7) ↔ TCP/IP (4) Mapping'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hybrid')}
            className={`pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'hybrid'
                ? 'border-[#ff7c28] text-[#ff7c28]'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {isFrench ? '2. Référence Hybride (5 Couches)' : '2. Hybrid (5 Layers) Reference'}
          </button>
        </div>

        {/* Corps du comparatif */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-5">
          {activeTab === 'comparison' ? (
            <>
              {/* Tableau comparatif visuel côte à côte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Colonne Gauche : Modèle OSI (7 couches) */}
                <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Modèle OSI (7 Couches)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted font-bold">
                      ISO / CEI 7498-1
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 flex justify-between">
                      <span className="font-bold text-[#ff7c28]">7 · Application</span>
                      <span className="text-muted">HTTP, DNS, DHCP</span>
                    </div>
                    <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/30 flex justify-between">
                      <span className="font-bold text-pink-500">6 · Présentation</span>
                      <span className="text-muted">Chiffrement TLS, Encodage</span>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 flex justify-between">
                      <span className="font-bold text-purple-500">5 · Session</span>
                      <span className="text-muted">Gestion du dialogue</span>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex justify-between">
                      <span className="font-bold text-indigo-500">4 · Transport</span>
                      <span className="text-muted">TCP, UDP</span>
                    </div>
                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 flex justify-between">
                      <span className="font-bold text-sky-500">3 · Réseau</span>
                      <span className="text-muted">IP, Routage, ICMP</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex justify-between">
                      <span className="font-bold text-emerald-500">2 · Liaison de données</span>
                      <span className="text-muted">Ethernet, MAC, Wi-Fi</span>
                    </div>
                    <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 flex justify-between">
                      <span className="font-bold text-teal-500">1 · Physique</span>
                      <span className="text-muted">Bits, Câble, Signaux</span>
                    </div>
                  </div>
                </div>

                {/* Colonne Droite : Modèle TCP/IP (4 couches) */}
                <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-mono text-xs font-bold text-[#ff7c28] uppercase tracking-wider">
                      Modèle TCP/IP (4 Couches)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-[#ff7c28] font-bold">
                      DoD / IETF RFC 1122
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    {/* L4 Application = OSI 7, 6, 5 */}
                    <div className="p-3.5 rounded-lg bg-orange-500/15 border border-orange-500/40">
                      <div className="flex justify-between font-bold text-[#ff7c28] mb-1">
                        <span>4 · APPLICATION</span>
                        <span className="text-[10px] font-normal uppercase">Fusionne OSI 7, 6 et 5</span>
                      </div>
                      <p className="text-[11px] text-foreground/80 font-sans">
                        {isFrench
                          ? 'Gère les données applicatives, le formatage, le chiffrement et la session directement au sein du protocole (HTTP, TLS, etc.).'
                          : 'Manages user data, formatting, TLS encryption, and sessions directly within application protocols.'}
                      </p>
                    </div>

                    {/* L3 Transport = OSI 4 */}
                    <div className="p-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/40">
                      <div className="flex justify-between font-bold text-indigo-500 mb-1">
                        <span>3 · TRANSPORT</span>
                        <span className="text-[10px] font-normal uppercase">Identique à OSI 4</span>
                      </div>
                      <p className="text-[11px] text-foreground/80 font-sans">
                        {isFrench
                          ? 'Assure le multiplexage par ports et la fiabilité (TCP) ou la faible latence (UDP).'
                          : 'Handles port multiplexing and reliability (TCP) or low latency (UDP).'}
                      </p>
                    </div>

                    {/* L2 Internet = OSI 3 */}
                    <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/40">
                      <div className="flex justify-between font-bold text-sky-500 mb-1">
                        <span>2 · INTERNET</span>
                        <span className="text-[10px] font-normal uppercase">Identique à OSI 3</span>
                      </div>
                      <p className="text-[11px] text-foreground/80 font-sans">
                        {isFrench
                          ? 'Cœur universel de l’Internet : adressage IP logique et routage indépendant du matériel.'
                          : 'Universal core: logical IP addressing and hardware-independent packet routing.'}
                      </p>
                    </div>

                    {/* L1 Hôte-Réseau = OSI 2, 1 */}
                    <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40">
                      <div className="flex justify-between font-bold text-emerald-500 mb-1">
                        <span>1 · HÔTE-RÉSEAU (ACCÈS RÉSEAU)</span>
                        <span className="text-[10px] font-normal uppercase">Fusionne OSI 2 et 1</span>
                      </div>
                      <p className="text-[11px] text-foreground/80 font-sans">
                        {isFrench
                          ? 'Prend en charge la trame locale (MAC/Ethernet/Wi-Fi) et le support physique sans sur-spécification rigide.'
                          : 'Manages local frames (MAC/Ethernet/Wi-Fi) and the physical transmission media.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synthèse explicative */}
              <div className="p-4 rounded-xl bg-surface-hover border border-border space-y-2 text-xs font-sans">
                <h4 className="font-mono font-bold text-foreground text-xs uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#ff7c28]" />
                  <span>{isFrench ? 'Pourquoi cette différence ?' : 'Why this architectural difference?'}</span>
                </h4>
                <p className="text-muted leading-relaxed">
                  {isFrench
                    ? 'Le modèle OSI a été conçu par des comités de normalisation théorique (ISO), qui ont créé 7 couches très strictes. Le modèle TCP/IP, quant à lui, est né de la mise en œuvre pratique de l’ARPANET (DARPA/DoD). Il a privilégié l’efficacité : les développeurs d’applications web préfèrent gérer leur session et chiffrement (HTTPS/TLS) dans la même couche que l’application, plutôt que dans des couches système séparées.'
                    : 'The OSI model was conceived by theoretical standards bodies (ISO), establishing 7 strictly separated layers. The TCP/IP model emerged pragmatically from ARPANET/DARPA. It prioritized real-world efficiency: application developers manage encryption (TLS) and session tokens directly within application protocols rather than in separate sub-layers.'}
                </p>
              </div>
            </>
          ) : (
            /* Onglet 2 : Modèle Hybride 5 Couches */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs font-sans">
                <h3 className="font-mono font-bold text-sky-500 uppercase mb-1">
                  {isFrench ? 'Le Modèle Hybride Moderne à 5 Couches' : 'The Modern 5-Layer Hybrid Model'}
                </h3>
                <p className="text-muted">
                  {isFrench
                    ? 'La plupart des universités et certifications réseaux (Cisco CCNA, cursus universitaires) enseignent aujourd’hui une pile hybride à 5 couches : elle conserve la clarté applicative de TCP/IP tout en séparant la Liaison de données et le Physique pour mieux expliquer les commutateurs (Switches) et les câbles.'
                    : 'Most modern universities and network certifications (Cisco CCNA, academic curricula) teach a 5-layer hybrid stack: keeping the pragmatic Application layer of TCP/IP while separating Data Link and Physical to clearly distinguish switches and cables.'}
                </p>
              </div>

              <div className="space-y-2">
                {HYBRID_5_LAYERS.map((hl) => (
                  <div
                    key={hl.number}
                    className="p-3 rounded-xl border border-border bg-surface-hover flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: hl.color }}
                      >
                        {hl.number}
                      </div>
                      <span className="font-bold text-foreground">
                        {isFrench ? hl.nameFr : hl.nameEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-muted">
                      <span>TCP/IP : <strong className="text-foreground">{hl.tcpipLayer}</strong></span>
                      <span>OSI : <strong className="text-foreground">{hl.osiLayer}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="px-6 py-3.5 border-t border-border bg-surface-hover/50 flex items-center justify-between shrink-0">
          {onNavigateToOSI ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToOSI();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-[#ff7c28] border border-orange-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isFrench ? 'Ouvrir le Modèle OSI (7 Couches)' : 'Open OSI Model (7 Layers)'}</span>
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#ff7c28] text-white font-mono text-xs font-bold hover:bg-[#e06818] transition-colors cursor-pointer"
          >
            {isFrench ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
