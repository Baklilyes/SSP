'use client';

import React, { useRef } from 'react';
import {
  Film,
  Sparkles,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Layers,
  Network,
  RotateCcw,
  CheckCircle2,
  Package,
  ShieldCheck,
} from 'lucide-react';

export interface EncapsulationViewProps {
  onSelectOSI?: () => void;
  onSelectTCPIP?: () => void;
  isFrench?: boolean;
}

export function EncapsulationView({
  onSelectOSI,
  onSelectTCPIP,
  isFrench = true,
}: EncapsulationViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-background text-foreground select-none">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* 1. En-tête : Titre & Présentation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-emerald-500/30 shadow-sm shadow-emerald-500/5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
              <Film className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg md:text-xl font-extrabold font-mono text-foreground tracking-tight">
                  {isFrench ? 'Encapsulation et Décapsulation' : 'Encapsulation and Decapsulation'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {isFrench ? 'Guide Vidéo Officiel' : 'Official Video Guide'}
                </span>
              </div>
              <p className="text-xs text-muted font-sans mt-1">
                {isFrench
                  ? 'Voyage complet des données : ajout d’en-têtes à l’émission et extraction méthodique à la réception'
                  : 'Complete data journey: header addition on transmission and methodical extraction on reception'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover hover:bg-surface border border-border text-foreground font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title={isFrench ? 'Recommencer la vidéo au début' : 'Restart video from start'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFrench ? 'Recommencer' : 'Restart'}</span>
            </button>
          </div>
        </div>

        {/* 2. Centre : Lecteur Vidéo Principal */}
        <div className="relative group w-full rounded-2xl overflow-hidden border border-emerald-500/40 bg-black shadow-xl shadow-emerald-500/10">
          {/* Effet de brillance d'arrière-plan */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-sky-500/5 to-emerald-500/10 pointer-events-none" />

          <video
            ref={videoRef}
            src="/api/encapsulation-video"
            controls
            autoPlay
            playsInline
            preload="auto"
            className="w-full max-h-[64vh] md:max-h-[70vh] object-contain mx-auto bg-black"
          >
            {isFrench
              ? 'Votre navigateur ne prend pas en charge la lecture de vidéos HTML5.'
              : 'Your browser does not support HTML5 video.'}
          </video>
        </div>

        {/* 3. Résumé Visuel : Émetteur vs Récepteur (2 Cartes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Carte 1 : Émetteur (Encapsulation) */}
          <div className="p-4 rounded-xl bg-surface border border-sky-500/30 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold text-xs">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-sm text-foreground">
                  {isFrench ? 'Côté Émetteur : Encapsulation' : 'Sender Side: Encapsulation'}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                {isFrench ? 'Ajout d’enveloppe' : 'Adding headers'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>5. Application</span>
                <span className="text-muted">Données brutes créées</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>4. Transport</span>
                <span className="text-sky-500 font-bold">+ Ports source/destination → Segment</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>3. Réseau</span>
                <span className="text-sky-500 font-bold">+ Adresses IP source/destination → Paquet</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>2. Liaison</span>
                <span className="text-sky-500 font-bold">+ Adresses MAC source/destination → Trame</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>1. Physique</span>
                <span className="text-emerald-500 font-bold">Signal électrique / optique → Bits</span>
              </div>
            </div>
          </div>

          {/* Carte 2 : Récepteur (Décapsulation) */}
          <div className="p-4 rounded-xl bg-surface border border-emerald-500/30 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-sm text-foreground">
                  {isFrench ? 'Côté Récepteur : Décapsulation' : 'Receiver Side: Decapsulation'}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                {isFrench ? 'Retrait d’enveloppe' : 'Stripping headers'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>1. Physique</span>
                <span className="text-emerald-500 font-bold">Signal reçu et reconstitué en bits</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>2. Liaison</span>
                <span className="text-muted">Validation MAC → En-tête liaison retiré</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>3. Réseau</span>
                <span className="text-muted">Validation IP → En-tête IP retiré</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>4. Transport</span>
                <span className="text-muted">Lecture port → En-tête transport retiré</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border flex items-center justify-between">
                <span>5. Application</span>
                <span className="text-emerald-500 font-bold">Données originales remises intactes</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Navigation rapide vers les Modèles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-border text-xs font-mono">
          <span className="text-muted">
            {isFrench
              ? 'Prêt pour explorer les protocoles en action ?'
              : 'Ready to explore protocols in action?'}
          </span>
          <div className="flex items-center gap-2">
            {onSelectOSI && (
              <button
                type="button"
                onClick={onSelectOSI}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-[#ff7c28] border border-orange-500/40 hover:border-orange-500 font-bold transition-all shadow-xs cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isFrench ? 'Modèle OSI (7 Couches)' : 'OSI Model (7 Layers)'}</span>
              </button>
            )}
            {onSelectTCPIP && (
              <button
                type="button"
                onClick={onSelectTCPIP}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-500 border border-sky-500/40 hover:border-sky-500 font-bold transition-all shadow-xs cursor-pointer"
              >
                <Network className="w-3.5 h-3.5" />
                <span>{isFrench ? 'Modèle TCP/IP (4 Couches)' : 'TCP/IP Model (4 Layers)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
