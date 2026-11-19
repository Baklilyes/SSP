'use client';

import React from 'react';
import { TCPIPEncapsulationState } from '../../lib/simulation/scenarios/tcpip/tcpipPacket';
import { Layers, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export interface TCPIPPacketInspectorProps {
  packetState?: TCPIPEncapsulationState;
  isFrench?: boolean;
  highlightHeader?: 'access' | 'internet' | 'transport' | 'payload';
}

export function TCPIPPacketInspector({
  packetState,
  isFrench = true,
  highlightHeader,
}: TCPIPPacketInspectorProps) {
  if (!packetState) return null;

  const hasAccess = !!packetState.networkAccessHeader;
  const hasIp = !!packetState.networkHeader;
  const hasTransport = !!packetState.transportHeader;
  const isTcp = packetState.transportType === 'TCP';

  return (
    <div className="bg-surface border border-border rounded-xl p-4 text-xs font-mono shadow-xs select-none">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Layers className="w-4 h-4 text-[#ff7c28]" />
          <span>{isFrench ? "STRUCTURE DE L'EN-TÊTE ACTUEL" : 'CURRENT HEADER STRUCTURE'}</span>
        </div>
        <div className="text-[11px] text-muted font-normal">
          {packetState.rawBytesLength} {isFrench ? 'octets totaux' : 'total bytes'}
        </div>
      </div>

      <div className="space-y-2.5">
        {/* 1. Couche 1 Hôte-Réseau (Ethernet / Wi-Fi) */}
        {hasAccess && (
          <div
            className={`p-2.5 rounded-lg border transition-all ${
              highlightHeader === 'access'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/80 shadow-xs'
                : 'bg-surface-hover/50 dark:bg-slate-950/60 border-border hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {packetState.networkAccessType || 'ETHERNET II'} (L1 · 14 B)
              </span>
              <span className="text-[10px] text-muted font-normal">
                Type : {packetState.networkAccessHeader?.etherType}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-foreground">
              <div>
                <span className="text-muted">Dst MAC:</span>{' '}
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                  {packetState.networkAccessHeader?.destinationMAC}
                </span>
              </div>
              <div>
                <span className="text-muted">Src MAC:</span>{' '}
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                  {packetState.networkAccessHeader?.sourceMAC}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Couche 2 Internet (IPv4) */}
        {hasIp && (
          <div
            className={`p-2.5 rounded-lg border transition-all ${
              highlightHeader === 'internet'
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500/80 shadow-xs'
                : 'bg-surface-hover/50 dark:bg-slate-950/60 border-border hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                IPv4 (L2 · 20 B)
              </span>
              <span className="text-[10px] text-muted font-normal">
                TTL: {packetState.networkHeader?.ttl} · Proto: {packetState.networkHeader?.protocol}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-foreground">
              <div>
                <span className="text-muted">Src IP:</span>{' '}
                <span className="text-sky-800 dark:text-sky-300 font-medium">
                  {packetState.networkHeader?.sourceIP}
                </span>
              </div>
              <div>
                <span className="text-muted">Dst IP:</span>{' '}
                <span className="text-sky-800 dark:text-sky-300 font-medium">
                  {packetState.networkHeader?.destinationIP}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Couche 3 Transport (TCP / UDP) */}
        {hasTransport && (
          <div
            className={`p-2.5 rounded-lg border transition-all ${
              highlightHeader === 'transport'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500/80 shadow-xs'
                : 'bg-surface-hover/50 dark:bg-slate-950/60 border-border hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {packetState.transportType} (L3 · {packetState.transportHeader?.lengthBytes} B)
              </span>
              <span className="text-[10px] text-muted font-normal">
                {isTcp
                  ? `Seq: ${packetState.transportHeader?.seq} · Flags: [${packetState.transportHeader?.flags}]`
                  : 'Mode sans connexion / Datagramme'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-foreground">
              <div>
                <span className="text-muted">Src Port:</span>{' '}
                <span className="text-indigo-800 dark:text-indigo-300 font-medium">
                  {packetState.transportHeader?.sourcePort}
                </span>
              </div>
              <div>
                <span className="text-muted">Dst Port:</span>{' '}
                <span className="text-indigo-800 dark:text-indigo-300 font-medium">
                  {packetState.transportHeader?.destinationPort}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Couche 4 Application (Données / Payload) */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            highlightHeader === 'payload'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500/80 shadow-xs'
              : 'bg-surface-hover/50 dark:bg-slate-950/60 border-border hover:border-slate-400 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {isFrench ? 'DONNÉES / CHARGE UTILE' : 'DATA / PAYLOAD'} (L4 · 5 B)
            </span>
            <span className="text-[10px] text-muted font-normal">UTF-8 / ASCII</span>
          </div>
          <div className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900/80 p-2 rounded border border-border">
            <span className="text-amber-900 dark:text-amber-200 font-bold tracking-wider">
              "{packetState.applicationData}"
            </span>
            <span className="text-muted font-mono text-[10px]">Hex: 48 65 6c 6c 6f</span>
          </div>
        </div>

        {/* 5. Signal Physique (L1 Bits) */}
        {packetState.physicalBits && (
          <div className="p-2.5 rounded-lg border border-teal-300 dark:border-teal-500/50 bg-teal-50 dark:bg-teal-950/30">
            <div className="flex items-center justify-between text-teal-700 dark:text-teal-400 font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 animate-pulse text-teal-600 dark:text-teal-300" />
                {isFrench ? 'SIGNAL PHYSIQUE (L1 · FLUX BINAIRE)' : 'PHYSICAL SIGNAL (L1 · BITSTREAM)'}
              </span>
              <span className="text-[10px] text-teal-700/80 dark:text-teal-300/80">
                {isFrench ? 'Électrique / Optique' : 'Electrical / Optical'}
              </span>
            </div>
            <div className="p-1.5 rounded bg-white dark:bg-slate-950 border border-teal-200 dark:border-teal-500/20 overflow-x-auto text-[11px] text-teal-900 dark:text-teal-300 font-mono tracking-wider">
              {packetState.physicalBits}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
