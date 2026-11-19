import React from 'react';
import { DissectedFrame, PacketField } from '../../lib/packet/types';

export interface DissectionTreeProps {
  frame: DissectedFrame;
  hoveredFieldRange: [number, number] | null;
  onHoverField: (range: [number, number] | null) => void;
}

export function DissectionTree({
  frame,
  hoveredFieldRange,
  onHoverField,
}: DissectionTreeProps) {
  const layerBorderColors: Record<string, string> = {
    eth: 'border-l-slate-500',
    ip: 'border-l-sky-500',
    tcp: 'border-l-emerald-500',
    udp: 'border-l-amber-500',
    dns: 'border-l-blue-500',
    tls: 'border-l-purple-500',
    http: 'border-l-orange-500',
  };

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {frame.layers.map((layer) => {
        const layerFields = frame.fields.filter((f) => f.layer === layer.id);
        const borderColor = layerBorderColors[layer.id] || 'border-l-slate-400';

        return (
          <section
            key={layer.id}
            data-layer={layer.id}
            className={`border-l-4 ${borderColor} pl-3 py-1 bg-surface-hover/20 rounded-r`}
          >
            {/* Titre de la couche */}
            <div className="flex items-center justify-between pb-1.5 border-b border-border/40 mb-1.5">
              <span className="font-bold text-foreground text-xs">
                {layer.name}
              </span>
              {layer.summary && (
                <span className="text-[11px] text-muted italic truncate ml-2">
                  {layer.summary}
                </span>
              )}
            </div>

            {/* Champs de la couche */}
            <div className="space-y-1">
              {layerFields.map((f, fIdx) => {
                const isHovered =
                  hoveredFieldRange &&
                  hoveredFieldRange[0] === f.from &&
                  hoveredFieldRange[1] === f.to;

                return (
                  <div
                    key={fIdx}
                    onMouseEnter={() => onHoverField([f.from, f.to])}
                    onMouseLeave={() => onHoverField(null)}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      isHovered
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'hover:bg-surface-hover text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted font-medium text-[11px]">
                        {f.name} :
                      </span>
                      <span className="font-semibold text-xs ml-2 text-right">
                        {f.value}
                        {f.example && (
                          <span className="ml-1 text-[9px] px-1 bg-amber-500/20 text-amber-400 rounded">
                            EX
                          </span>
                        )}
                      </span>
                    </div>

                    {f.note && (
                      <p
                        className={`text-[10px] mt-0.5 leading-snug font-sans ${
                          isHovered ? 'text-slate-900' : 'text-muted'
                        }`}
                      >
                        {f.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
