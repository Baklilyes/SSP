'use client';

import React, { useEffect } from 'react';
import { X, RotateCcw, Video, CheckCircle2 } from 'lucide-react';

export interface DHCPVideoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onReplay?: () => void;
  isFrench?: boolean;
}

export function DHCPVideoOverlay({
  isOpen,
  onClose,
  onReplay,
  isFrench = true,
}: DHCPVideoOverlayProps) {
  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isFrench ? 'Vidéo explicative du protocole DHCP' : 'DHCP Protocol Explanatory Video'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-300 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col max-w-3xl w-full max-h-[94vh] bg-surface border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/15 overflow-hidden animate-in zoom-in-95 fade-in duration-400 ease-out ring-1 ring-amber-500/30"
      >
        {/* 1. En-tête avec accentuation ambre / orange DHCP */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-hover/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-500 flex items-center justify-center shadow-xs">
              <Video className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold font-mono text-foreground uppercase tracking-wider">
                  {isFrench ? 'Le DHCP - Le Gardien de vos Adresses IP' : 'DHCP - Network IP Address Manager'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isFrench ? 'Cycle Terminé' : 'Completed'}</span>
                </span>
              </div>
              <p className="text-[11px] text-muted font-sans mt-0.5">
                {isFrench
                  ? 'Explication complète : processus DORA, bail DHCP & attribution dynamique d’IP'
                  : 'Complete overview: DORA process, DHCP lease & dynamic IP assignment'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            title={isFrench ? 'Fermer (Échap)' : 'Close (Esc)'}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Corps : Lecteur vidéo avec streaming optimisé et centrage */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 bg-background/60 flex items-center justify-center overflow-auto">
          <div className="relative group max-h-full w-full flex items-center justify-center">
            {/* Effet de brillance d'arrière-plan ambre/bleu */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-sky-500/10 to-emerald-500/15 rounded-2xl blur-xl opacity-60 pointer-events-none" />

            <video
              src="/api/dhcp-video"
              controls
              autoPlay
              playsInline
              preload="auto"
              className="relative max-h-[66vh] md:max-h-[72vh] w-full rounded-xl shadow-xl border border-border object-contain bg-black transition-transform duration-300"
            >
              {isFrench
                ? 'Votre navigateur ne prend pas en charge la balise vidéo.'
                : 'Your browser does not support HTML5 video playback.'}
            </video>
          </div>
        </div>

        {/* 3. Pied de page avec résumé du cycle DORA et actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-hover/50 shrink-0">
          <span className="text-[11px] font-mono text-muted hidden sm:inline">
            {isFrench
              ? 'DORA : 1. Discover → 2. Offer → 3. Request → 4. Acknowledge'
              : 'DORA: 1. Discover → 2. Offer → 3. Request → 4. Acknowledge'}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {onReplay && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReplay();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title={isFrench ? 'Rejouer le cycle complet' : 'Replay full cycle'}
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isFrench ? 'REVOIR LA SIMULATION' : 'REPLAY SIMULATION'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-foreground font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              {isFrench ? 'FERMER' : 'CLOSE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
