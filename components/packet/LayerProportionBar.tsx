import React from 'react';
import { PacketLayerInfo } from '../../lib/packet/types';

export interface LayerProportionBarProps {
  layers: PacketLayerInfo[];
  totalBytes: number;
  onSelectLayer?: (layerId: string) => void;
}

export function LayerProportionBar({
  layers,
  totalBytes,
  onSelectLayer,
}: LayerProportionBarProps) {
  if (totalBytes === 0 || layers.length === 0) return null;

  const layerColors: Record<string, string> = {
    eth: 'bg-slate-500',
    ip: 'bg-sky-500',
    ipv6: 'bg-sky-600',
    tcp: 'bg-emerald-500',
    udp: 'bg-amber-500',
    dns: 'bg-blue-500',
    tls: 'bg-purple-500',
    http: 'bg-orange-500',
    icmp: 'bg-red-500',
    dhcp: 'bg-teal-500',
  };

  return (
    <div className="w-full flex h-6 rounded overflow-hidden border border-border select-none text-[11px] font-mono">
      {layers.map((l) => {
        const len = l.to - l.from;
        const pct = Math.max(5, (len / totalBytes) * 100);
        const bg = layerColors[l.id] || 'bg-slate-600';

        return (
          <button
            key={l.id}
            onClick={() => onSelectLayer?.(l.id)}
            style={{ width: `${pct}%` }}
            className={`${bg} text-white hover:brightness-110 transition-all flex items-center justify-between px-2 overflow-hidden truncate`}
            title={`${l.name} (${len} octets)`}
          >
            <span className="font-bold truncate text-[10px]">{l.id.toUpperCase()}</span>
            <span className="text-[9px] opacity-80 shrink-0">{len}B</span>
          </button>
        );
      })}
    </div>
  );
}
