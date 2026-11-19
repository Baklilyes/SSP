import React from 'react';
import { DissectedFrame } from '../../lib/packet/types';

export interface HexAsciiViewerProps {
  frame: DissectedFrame;
  hoveredRange: [number, number] | null;
  onHoverByte: (offset: number | null) => void;
}

export function HexAsciiViewer({
  frame,
  hoveredRange,
  onHoverByte,
}: HexAsciiViewerProps) {
  const bytes = frame.bytes;
  const rows: { offset: number; slice: (number | null)[] }[] = [];

  for (let i = 0; i < bytes.length; i += 16) {
    rows.push({
      offset: i,
      slice: bytes.slice(i, i + 16),
    });
  }

  // Helper pour trouver la couche d'un octet donné
  const getLayerColor = (byteOffset: number): string => {
    const layer = frame.layers.find(
      (l) => byteOffset >= l.from && byteOffset < l.to
    );
    if (!layer) return 'text-slate-400';
    switch (layer.id) {
      case 'eth': return 'text-slate-400';
      case 'ip': return 'text-sky-400';
      case 'tcp': return 'text-emerald-400';
      case 'udp': return 'text-amber-400';
      case 'dns': return 'text-blue-400';
      case 'tls': return 'text-purple-400';
      case 'http': return 'text-orange-400';
      default: return 'text-sky-400';
    }
  };

  const isByteLit = (idx: number) => {
    if (!hoveredRange) return false;
    return idx >= hoveredRange[0] && idx < hoveredRange[1];
  };

  return (
    <div className="font-mono text-xs select-text space-y-1 overflow-x-auto">
      {rows.map(({ offset, slice }) => (
        <div key={offset} className="flex items-center gap-4 py-0.5 leading-none">
          {/* Offset */}
          <span className="text-[11px] text-muted w-10 shrink-0 select-none opacity-60">
            {offset.toString(16).padStart(4, '0')}
          </span>

          {/* Octets Hexadécimaux */}
          <div className="flex items-center gap-1.5 shrink-0">
            {slice.map((b, idx) => {
              const byteIdx = offset + idx;
              const lit = isByteLit(byteIdx);
              const color = getLayerColor(byteIdx);

              return (
                <span
                  key={idx}
                  onMouseEnter={() => onHoverByte(byteIdx)}
                  onMouseLeave={() => onHoverByte(null)}
                  className={`w-5 text-center cursor-pointer transition-colors rounded ${
                    lit
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : b === null
                      ? 'text-muted/40 font-normal'
                      : color
                  }`}
                >
                  {b === null ? '··' : b.toString(16).padStart(2, '0')}
                </span>
              );
            })}
          </div>

          {/* Caractères ASCII */}
          <div className="flex items-center shrink-0 border-l border-border pl-3 text-muted">
            {slice.map((b, idx) => {
              const byteIdx = offset + idx;
              const lit = isByteLit(byteIdx);

              const char =
                b === null
                  ? '·'
                  : b >= 32 && b < 127
                  ? String.fromCharCode(b)
                  : '.';

              return (
                <span
                  key={idx}
                  onMouseEnter={() => onHoverByte(byteIdx)}
                  onMouseLeave={() => onHoverByte(null)}
                  className={`w-2.5 text-center cursor-pointer transition-colors ${
                    lit
                      ? 'bg-sky-500 text-slate-950 font-bold rounded'
                      : b === null
                      ? 'opacity-30'
                      : 'text-foreground/80'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
