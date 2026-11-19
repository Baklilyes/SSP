'use client';

import React, { useState, useCallback } from 'react';
import { PacketEvent } from '../../lib/simulation/types';
import { DissectedFrame, PacketField } from '../../lib/packet/types';
import { LayerProportionBar } from './LayerProportionBar';
import { DissectionTree } from './DissectionTree';
import { HexAsciiViewer } from './HexAsciiViewer';
import { Button } from '../ui/Button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface PacketInspectorProps {
  packet: PacketEvent | null;
  index: number | null;
  totalPackets: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevPacket: () => void;
  onNextPacket: () => void;
}

export function PacketInspector({
  packet,
  index,
  totalPackets,
  isOpen,
  onClose,
  onPrevPacket,
  onNextPacket,
}: PacketInspectorProps) {
  const [hoveredRange, setHoveredRange] = useState<[number, number] | null>(null);

  const frame: DissectedFrame | undefined = packet?.wire;

  // Lorsqu'un octet de la vue hex est survolé, on recherche le champ le plus précis
  const handleHoverByte = useCallback(
    (offset: number | null) => {
      if (offset === null || !frame) {
        setHoveredRange(null);
        return;
      }
      // Trouver le champ le plus spécifique (le plus court) contenant cet offset
      const matchingFields = frame.fields
        .filter((f) => offset >= f.from && offset < f.to)
        .sort((a, b) => a.to - a.from - (b.to - b.from));

      if (matchingFields.length > 0) {
        setHoveredRange([matchingFields[0].from, matchingFields[0].to]);
      } else {
        setHoveredRange([offset, offset + 1]);
      }
    },
    [frame]
  );

  if (!isOpen || !packet || !frame) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
      {/* En-tête de l'inspecteur */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-surface shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-orange-500/10 text-[#ea580c] dark:text-[#ff7c28] font-mono font-bold text-xs border border-orange-500/20">
              #{(index ?? 0) + 1}
            </span>
            <span className="font-bold text-sm text-foreground">
              {packet.label}
            </span>
          </div>

          <div className="text-xs text-muted font-mono hidden md:flex items-center gap-3">
            <span>{packet.row.time}</span>
            <span>•</span>
            <span>{packet.row.src} → {packet.row.dst}</span>
            <span>•</span>
            <span className="font-semibold text-foreground">{packet.row.proto}</span>
            <span>•</span>
            <span>{packet.row.len}</span>
          </div>
        </div>

        {/* Commandes : Précédent, Suivant, Fermer */}
        <div className="flex items-center gap-2">
          <Button
            variant="icon"
            size="sm"
            onClick={onPrevPacket}
            disabled={index === 0}
            title="Paquet précédent (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-xs font-mono text-muted">
            {(index ?? 0) + 1} / {totalPackets}
          </span>

          <Button
            variant="icon"
            size="sm"
            onClick={onNextPacket}
            disabled={index === totalPackets - 1}
            title="Paquet suivant (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <Button
            variant="icon"
            size="sm"
            onClick={onClose}
            title="Fermer l'inspecteur (Échap)"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Barre de proportion des couches */}
      <div className="px-6 py-2 border-b border-border/50 bg-surface-hover/30 shrink-0">
        <LayerProportionBar
          layers={frame.layers}
          totalBytes={frame.bytes.length}
          onSelectLayer={(layerId) => {
            const el = document.querySelector(`[data-layer="${layerId}"]`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      </div>

      {/* Double panneau : Arbre de dissection (gauche) & Hex/ASCII dump (droite) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
        {/* Arbre de dissection */}
        <div className="p-6 overflow-y-auto">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Arbre de Dissection des Protocoles
          </h4>
          <DissectionTree
            frame={frame}
            hoveredFieldRange={hoveredRange}
            onHoverField={setHoveredRange}
          />
        </div>

        {/* Dump Hexadécimal & ASCII */}
        <div className="p-6 overflow-y-auto bg-surface/50">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Octets Bruts de la Trame (Hexadécimal & ASCII)
          </h4>
          <HexAsciiViewer
            frame={frame}
            hoveredRange={hoveredRange}
            onHoverByte={handleHoverByte}
          />
        </div>
      </div>
    </div>
  );
}
