'use client';

import React from 'react';
import { NodeId, PacketEvent } from '../../lib/simulation/types';

export interface SequenceDiagramProps {
  nodes: NodeId[];
  labels?: Record<string, [string, string]>;
  packets: PacketEvent[];
  activeIndex: number;
  onSelectPacket: (packet: PacketEvent, index: number) => void;
  theme?: 'dark' | 'light';
}

export function SequenceDiagram({
  nodes,
  labels,
  packets,
  activeIndex,
  onSelectPacket,
  theme = 'light',
}: SequenceDiagramProps) {
  const isDark = theme === 'dark';

  // Calcul de la largeur et espacement des colonnes
  const activeNodes = React.useMemo(() => {
    const present = new Set<NodeId>();
    for (const p of packets) {
      present.add(p.from);
      present.add(p.to);
    }
    return nodes.filter((n) => present.has(n));
  }, [nodes, packets]);

  const columnWidth = 180;
  const totalWidth = Math.max(700, activeNodes.length * columnWidth);
  const rowHeight = 65;
  const totalHeight = Math.max(400, (packets.length + 1) * rowHeight + 80);

  const nodeX = (nodeId: NodeId) => {
    const idx = activeNodes.indexOf(nodeId);
    if (idx === -1) return 80;
    return idx * columnWidth + 100;
  };

  return (
    <div
      className={`w-full h-full ${
        isDark ? 'bg-[#0b1020]' : 'bg-[#f8fafc]'
      } overflow-auto select-none p-6 flex justify-center`}
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        className="transition-all duration-300 font-mono text-xs rounded-lg shadow-xs"
      >
        <defs>
          {/* Grille technique identique à celle du réseau */}
          <pattern
            id="seq-tech-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke={isDark ? '#172342' : '#e2e8f0'}
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Fond quadrillé identique à la topologie réseau */}
        <rect
          x="0"
          y="0"
          width={totalWidth}
          height={totalHeight}
          fill={isDark ? '#0b1020' : '#f8fafc'}
        />
        <rect
          x="0"
          y="0"
          width={totalWidth}
          height={totalHeight}
          fill="url(#seq-tech-grid)"
        />

        {/* Lignes de vie verticales */}
        {activeNodes.map((n) => {
          const x = nodeX(n);
          return (
            <g key={n}>
              {/* Boîte d'en-tête du nœud */}
              <rect
                x={x - 55}
                y={10}
                width={110}
                height={32}
                rx={8}
                fill={isDark ? '#11182c' : '#ffffff'}
                stroke={isDark ? '#1e2947' : '#c5d0e6'}
                strokeWidth={1.5}
                className="shadow-xs"
              />
              <text
                x={x}
                y={31}
                textAnchor="middle"
                fill={isDark ? '#f1f5f9' : '#0f172a'}
                className="font-bold text-xs uppercase tracking-wider font-sans"
              >
                {labels?.[n]?.[0] || n}
              </text>

              {/* Ligne verticale pointillée */}
              <line
                x1={x}
                y1={42}
                x2={x}
                y2={totalHeight - 20}
                stroke={isDark ? '#1e2947' : '#cbd5e1'}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </g>
          );
        })}

        {/* Flèches de paquets chronologiques */}
        {packets.map((pkt, idx) => {
          const y = 80 + idx * rowHeight;
          const x1 = nodeX(pkt.from);
          const x2 = nodeX(pkt.to);
          const isSelected = idx === activeIndex;

          const colorClasses: Record<string, string> = {
            blue: '#3b82f6',
            green: '#10b981',
            amber: '#ff7c28',
            violet: '#8b5cf6',
            red: '#ef4444',
          };
          const strokeColor = colorClasses[pkt.color] || '#ff7c28';

          return (
            <g
              key={idx}
              onClick={() => onSelectPacket(pkt, idx)}
              className="cursor-pointer group"
            >
              {/* Horodatage à gauche */}
              <text
                x={30}
                y={y + 4}
                textAnchor="middle"
                fill={isDark ? '#64748b' : '#64748b'}
                className="text-[10.5px] font-mono font-medium"
              >
                {pkt.row.time}
              </text>

              {/* Point de départ sur la ligne de vie émettrice */}
              <circle cx={x1} cy={y} r={3.5} fill={strokeColor} />

              {/* Ligne directionnelle */}
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y + 10}
                stroke={strokeColor}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all group-hover:stroke-width-3"
              />

              {/* Flèche d'arrivée */}
              <polygon
                points={
                  x2 > x1
                    ? `${x2},${y + 10} ${x2 - 8},${y + 5} ${x2 - 8},${y + 15}`
                    : `${x2},${y + 10} ${x2 + 8},${y + 5} ${x2 + 8},${y + 15}`
                }
                fill={strokeColor}
              />

              {/* Badge d'étiquette du paquet */}
              <g transform={`translate(${(x1 + x2) / 2}, ${y - 4})`}>
                <rect
                  x={-55}
                  y={-14}
                  width={110}
                  height={20}
                  rx={6}
                  fill={isDark ? '#0b1020' : '#ffffff'}
                  stroke={isSelected ? '#ff7c28' : isDark ? '#1e2947' : '#c5d0e6'}
                  strokeWidth={isSelected ? 2 : 1.2}
                  className="shadow-xs"
                />
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  fill={isDark ? '#f1f5f9' : '#0f172a'}
                  className="text-[10px] font-bold font-mono"
                >
                  {pkt.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
