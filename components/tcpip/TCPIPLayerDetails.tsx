'use client';

import React from 'react';
import { TCPIPLayer } from '../../lib/simulation/scenarios/tcpip/tcpipLayers';
import { X, ExternalLink, ShieldCheck, Box, BookOpen, Layers, ArrowLeftRight } from 'lucide-react';

export interface TCPIPLayerDetailsProps {
  layer: TCPIPLayer | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProtocol?: (protocolId: string) => void;
  isFrench?: boolean;
}

const PROTOCOL_ID_MAP: Record<string, string> = {
  HTTP: 'http',
  HTTPS: 'https',
  DNS: 'dns',
  DHCP: 'dhcp',
  SMTP: 'smtp',
  FTP: 'ftp',
  SSH: 'ssh',
  BGP: 'bgp',
  TCP: 'tcp',
  UDP: 'udp',
  QUIC: 'quic',
  IP: 'ip',
  IPV4: 'ip',
  IPV6: 'ipv6',
  ICMP: 'icmp',
  ETHERNET: 'ethernet',
  WIFI: 'wifi',
  'WI-FI': 'wifi',
  MODBUS: 'modbus',
  WEBSOCKET: 'websocket',
  SIP: 'sip',
};

export function TCPIPLayerDetails({
  layer,
  isOpen,
  onClose,
  onNavigateToProtocol,
  isFrench = true,
}: TCPIPLayerDetailsProps) {
  if (!isOpen || !layer) return null;

  const name = isFrench ? layer.nameFr : layer.nameEn;
  const unit = isFrench ? layer.unitFr : layer.unitEn;
  const description = isFrench ? layer.descriptionFr : layer.descriptionEn;
  const keyConcepts = isFrench ? (layer.conceptsFr || []) : (layer.conceptsEn || []);
  const osiEquivalent = isFrench ? layer.osiEquivalentFr : layer.osiEquivalentEn;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Détails Couche TCP/IP ${layer.number} - ${name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Entête avec couleur de la couche */}
        <div
          className="p-5 border-b border-border flex items-start justify-between"
          style={{ backgroundColor: `${layer.bgRgba}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg text-white shadow-md"
              style={{ backgroundColor: layer.color }}
            >
              {layer.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  {isFrench ? `Couche TCP/IP ${layer.number}` : `TCP/IP Layer ${layer.number}`}
                </span>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{
                    backgroundColor: `${layer.color}20`,
                    color: layer.color,
                    border: `1px solid ${layer.color}40`,
                  }}
                >
                  PDU : {unit}
                </span>
              </div>
              <h2 className="text-xl font-bold font-mono text-foreground mt-0.5">{name}</h2>
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

        {/* Corps des détails */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Description & Rôle */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#ff7c28]" />
              <span>{isFrench ? 'Rôle & Spécifications' : 'Role & Specifications'}</span>
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed font-sans">{description}</p>
          </div>

          {/* 2. Correspondance avec le Modèle OSI */}
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-start gap-3">
            <ArrowLeftRight className="w-4 h-4 text-[#ff7c28] mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-[#ff7c28] uppercase tracking-wider block mb-0.5">
                {isFrench ? 'Équivalence Modèle OSI (7 Couches)' : 'OSI Model Equivalence'}
              </span>
              <p className="text-xs text-foreground/90 font-sans">{osiEquivalent}</p>
            </div>
          </div>

          {/* 3. Unité de données (PDU) */}
          <div className="p-3 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <Box className="w-4 h-4 text-sky-400" />
              <span>{isFrench ? 'Unité de Données de Protocole (PDU)' : 'Protocol Data Unit (PDU)'}:</span>
            </div>
            <span className="text-xs font-mono font-bold text-foreground uppercase px-2 py-0.5 bg-background rounded border border-border">
              {unit}
            </span>
          </div>

          {/* 4. Protocoles associés & liens interactifs */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ff7c28]" />
              <span>{isFrench ? 'Protocoles Associés (Interactifs)' : 'Associated Protocols (Interactive)'}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {layer.protocols.map((proto) => {
                const upper = proto.toUpperCase();
                const matchedId = PROTOCOL_ID_MAP[upper];
                const isNavigable = !!matchedId && !!onNavigateToProtocol;

                return (
                  <button
                    key={proto}
                    type="button"
                    disabled={!isNavigable}
                    onClick={() => {
                      if (matchedId && onNavigateToProtocol) {
                        onClose();
                        onNavigateToProtocol(matchedId);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      isNavigable
                        ? 'bg-orange-500/10 hover:bg-orange-500/20 text-[#ff7c28] border border-orange-500/30 hover:border-orange-500 shadow-2xs cursor-pointer hover:scale-105'
                        : 'bg-surface-hover text-muted border border-border cursor-default'
                    }`}
                    title={
                      isNavigable
                        ? isFrench
                          ? `Ouvrir la simulation interactive de ${proto}`
                          : `Open ${proto} interactive simulation`
                        : undefined
                    }
                  >
                    <span>{upper}</span>
                    {isNavigable && <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Concepts clés */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff7c28]" />
              <span>{isFrench ? 'Concepts Clés de la Couche' : 'Layer Key Concepts'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {keyConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-hover border border-border text-xs text-foreground font-mono"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff7c28] shrink-0" />
                  <span>{concept}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="p-4 border-t border-border bg-surface-hover flex justify-end">
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
