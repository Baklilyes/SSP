'use client';

import React from 'react';
import { OSI_LAYERS_TOP_DOWN, OSILayer as IOSILayer } from '../../lib/simulation/scenarios/osi/osiLayers';
import { OSILayer } from './OSILayer';
import { OSIEncapsulationState } from '../../lib/simulation/scenarios/osi/osiPacket';
import { Layers, ArrowDown, ArrowUp, Zap } from 'lucide-react';

export interface OSIBuildingProps {
  activeLayer: number;
  completedLayers: number[];
  direction?: 'encapsulation' | 'transmission' | 'decapsulation';
  selectedLayerId?: string;
  onSelectLayer: (layer: IOSILayer) => void;
  onSelectProtocol?: (protocolId: string) => void;
  isFrench?: boolean;
  packetState?: OSIEncapsulationState;
}

export function OSIBuilding({
  activeLayer,
  completedLayers,
  direction = 'encapsulation',
  selectedLayerId,
  onSelectLayer,
  onSelectProtocol,
  isFrench = true,
  packetState,
}: OSIBuildingProps) {
  return (
    <div className="relative flex flex-col w-full h-full max-w-2xl mx-auto p-4 select-none">
      {/* 1. Entête du bâtiment OSI */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[#ff7c28]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">
              {isFrench ? 'TOUR DES 7 COUCHES DU MODÈLE OSI' : '7-LAYER OSI MODEL STACK'}
            </h2>
            <p className="text-[11px] text-muted">
              {isFrench
                ? 'Cliquez sur une couche pour explorer ses protocoles et spécifications'
                : 'Click any layer to explore protocols and technical specifications'}
            </p>
          </div>
        </div>

        {/* Badge de direction du flux */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono shadow-2xs">
          {direction === 'encapsulation' ? (
            <>
              <ArrowDown className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {isFrench ? 'Émetteur (L7 → L1)' : 'Sender (L7 → L1)'}
              </span>
            </>
          ) : direction === 'transmission' ? (
            <>
              <Zap className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
              <span className="text-teal-600 dark:text-teal-300 font-bold">
                {isFrench ? 'Câble / Média' : 'Wire / Medium'}
              </span>
            </>
          ) : (
            <>
              <ArrowUp className="w-3.5 h-3.5 text-purple-500 animate-bounce" />
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {isFrench ? 'Récepteur (L1 → L7)' : 'Receiver (L1 → L7)'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Pile des 7 couches (Ordre canonique : 7 en haut, 1 en bas) */}
      <div className="flex-1 flex flex-col justify-between gap-2">
        {OSI_LAYERS_TOP_DOWN.map((layer: IOSILayer) => {
          const isActive = layer.number === activeLayer;
          const isCompleted = completedLayers.includes(layer.number);

          // Tag d'action d'en-tête dynamique
          let headerTag: string | undefined;
          let isHeaderAdded = false;
          let isHeaderRemoved = false;

          if (isActive) {
            if (layer.number === 4) {
              if (direction === 'encapsulation') {
                headerTag = '+ TCP (20 B)';
                isHeaderAdded = true;
              } else if (direction === 'decapsulation') {
                headerTag = '- TCP (20 B)';
                isHeaderRemoved = true;
              }
            } else if (layer.number === 3) {
              if (direction === 'encapsulation') {
                headerTag = '+ IPv4 (20 B)';
                isHeaderAdded = true;
              } else if (direction === 'decapsulation') {
                headerTag = '- IPv4 (20 B)';
                isHeaderRemoved = true;
              }
            } else if (layer.number === 2) {
              if (direction === 'encapsulation') {
                headerTag = '+ Ethernet (14 B)';
                isHeaderAdded = true;
              } else if (direction === 'decapsulation') {
                headerTag = '- Ethernet (14 B)';
                isHeaderRemoved = true;
              }
            } else if (layer.number === 1) {
              headerTag = direction === 'transmission' ? 'Bits (0101...)' : 'PHY';
            } else if (layer.number === 7) {
              headerTag = direction === 'encapsulation' ? 'Payload (5 B)' : 'Delivered';
            }
          }

          return (
            <div key={layer.id} className="relative">
              <OSILayer
                layer={layer}
                active={isActive}
                completed={isCompleted}
                direction={direction}
                headerTag={headerTag}
                isHeaderAdded={isHeaderAdded}
                isHeaderRemoved={isHeaderRemoved}
                onClick={() => onSelectLayer(layer)}
                onSelectProtocol={onSelectProtocol}
                isFrench={isFrench}
              />
            </div>
          );
        })}
      </div>

      {/* 3. Base du média physique (Transmission Line) */}
      <div className="mt-3 pt-2 border-t border-dashed border-border flex items-center justify-between text-[11px] font-mono text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          <span>{isFrench ? 'Média de Transmission (Câble RJ45 / Fibre / Radio)' : 'Physical Medium (Ethernet / Fiber / Radio)'}</span>
        </span>
        <span className="text-muted">1000BASE-T · Full-Duplex</span>
      </div>
    </div>
  );
}
