'use client';

import React, { useState } from 'react';
import {
  Search,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Keyboard,
  PanelLeft,
  Layout,
  ArrowLeft,
} from 'lucide-react';
import { LanguageDropdown } from './LanguageDropdown';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export interface TopbarProps {
  protocolLayer?: number;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  viewMode?: 'topology' | 'sequence';
  onToggleView?: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectOSI?: () => void;
  onSelectTCPIP?: () => void;
  onSelectEncapsulation?: () => void;
  onGoHome?: () => void;
  isOSI?: boolean;
  isTCPIP?: boolean;
  isEncapsulation?: boolean;
}

const OSI_LAYERS_FR = [
  'PHYSIQUE',
  'LIAISON DE DONNÉES',
  'RÉSEAU',
  'TRANSPORT',
  'SESSION',
  'PRÉSENTATION',
  'APPLICATION',
];

const OSI_LAYERS_EN = [
  'PHYSICAL',
  'DATA LINK',
  'NETWORK',
  'TRANSPORT',
  'SESSION',
  'PRESENTATION',
  'APPLICATION',
];

const TCPIP_LAYERS_FR = [
  'ACCÈS RÉSEAU',
  'INTERNET',
  'TRANSPORT',
  'APPLICATION',
];

const TCPIP_LAYERS_EN = [
  'NETWORK ACCESS',
  'INTERNET',
  'TRANSPORT',
  'APPLICATION',
];

export function Topbar({
  protocolLayer = 7,
  onToggleSidebar,
  isSidebarOpen,
  viewMode = 'topology',
  onToggleView,
  onOpenSearch,
  onOpenShortcuts,
  theme,
  onToggleTheme,
  onSelectOSI,
  onSelectTCPIP,
  onSelectEncapsulation,
  onGoHome,
  isOSI = false,
  isTCPIP = false,
  isEncapsulation = false,
}: TopbarProps) {
  const { locale } = useLanguage();
  const isFrench = locale === 'fr';
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const layersList = isTCPIP ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7];
  const maxLayer = isTCPIP ? 4 : 7;
  const activeLayer = Math.min(Math.max(protocolLayer || (isTCPIP ? 4 : 7), 1), maxLayer);
  const layerName = isTCPIP
    ? (isFrench ? TCPIP_LAYERS_FR : TCPIP_LAYERS_EN)[activeLayer - 1] || 'APPLICATION'
    : (isFrench ? OSI_LAYERS_FR : OSI_LAYERS_EN)[activeLayer - 1] || 'APPLICATION';

  return (
    <header className="h-[54px] min-h-[54px] border-b border-border bg-white dark:bg-[#080d1a] px-4 flex items-center justify-between z-30 select-none text-foreground shrink-0 shadow-2xs">
      {/* 1. Gauche : Logo avec coins cyber + Titres + Séparateur + Indicateur OSI */}
      <div className="flex items-center">
        {/* Cadre Logo + Titre cliquable pour retourner à l'accueil SSP Academy */}
        <div
          role="button"
          tabIndex={0}
          onClick={onGoHome}
          className={`flex items-center ${onGoHome ? 'cursor-pointer group' : ''}`}
          title={isFrench ? "Retour à l'accueil SSP Academy" : "Back to SSP Academy Home"}
        >
          {/* Cadre Logo avec 4 coins technologiques en orange vif */}
          <div className="relative w-12 h-10 flex items-center justify-center text-[#ff7c28] shrink-0 group-hover:scale-105 transition-transform">
            <span className="absolute w-2 h-2 border-t-2 border-l-2 border-[#ff7c28] left-0 top-0 pointer-events-none" />
            <span className="absolute w-2 h-2 border-t-2 border-r-2 border-[#ff7c28] right-0 top-0 pointer-events-none" />
            <span className="absolute w-2 h-2 border-b-2 border-l-2 border-[#ff7c28] left-0 bottom-0 pointer-events-none" />
            <span className="absolute w-2 h-2 border-b-2 border-r-2 border-[#ff7c28] right-0 bottom-0 pointer-events-none" />

            {/* Logo Cube Isométrique 3D en orange */}
            <svg className="w-7 h-7 text-[#ff7c28]" viewBox="0 0 64 64" fill="currentColor">
              <g fill="currentColor" strokeWidth="2.4" strokeLinejoin="round" className="stroke-white dark:stroke-[#080d1a]">
                <path d="M32 3 L58 16.5 L32 30 L6 16.5 Z" />
                <path d="M6 16.5 L32 30 L32 45.5 L6 32 Z" />
                <path d="M58 16.5 L32 30 L32 45.5 L58 32 Z" />
                <path d="M6 32 L32 45.5 L32 61 L6 47.5 Z" />
                <path d="M58 32 L32 45.5 L32 61 L58 47.5 Z" />
              </g>
            </svg>
          </div>

          {/* Titre & Sous-titre avec ligne d'accent */}
          <div className="ml-3.5 flex flex-col justify-center">
            <h1 className="text-lg md:text-[20px] font-extrabold tracking-[0.06em] whitespace-nowrap leading-tight flex items-center gap-1.5">
              <span className="text-slate-900 dark:text-[#dbeafe]">Interactive</span>
              <span className="text-[#ff7c28]">PROTOCOL</span>
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-mono tracking-[0.14em] text-slate-500 dark:text-slate-400 whitespace-nowrap leading-none mt-0.5">
              <span className="w-2.5 h-0.5 bg-[#ff7c28] rounded-full inline-block" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">by <strong className="text-[#ff7c28] font-extrabold tracking-wider">SSP</strong></span>
            </div>
          </div>
        </div>

        {/* Séparateur vertical */}
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-5 hidden md:block" />

        {/* Bouton de retour vers l'accueil lorsqu'on est sur le Modèle OSI, TCP/IP ou Encapsulation */}
        {(isOSI || isTCPIP || isEncapsulation) && onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer mr-2.5 group"
            title={isFrench ? "Retourner à la page d'accueil SSP Academy" : "Back to SSP Academy Home"}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
            <span>{isFrench ? 'ACCUEIL' : 'HOME'}</span>
          </button>
        )}

        {/* Bouton vers le Modèle OSI : affiché si on est sur TCP/IP, Encapsulation ou sur une page de protocole */}
        {!isOSI && onSelectOSI && (
          <button
            type="button"
            onClick={onSelectOSI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-[#ff7c28] border border-orange-500/40 hover:border-orange-500 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer mr-2.5 group"
            title={isFrench ? 'Modèle OSI (7 couches)' : 'OSI Model (7 layers)'}
          >
            {!isTCPIP && !isEncapsulation && <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />}
            <span>{isFrench ? 'MODÈLE OSI' : 'OSI MODEL'}</span>
          </button>
        )}

        {/* Bouton vers le Modèle TCP/IP : affiché si on est sur OSI, Encapsulation ou sur une page de protocole */}
        {!isTCPIP && onSelectTCPIP && (
          <button
            type="button"
            onClick={onSelectTCPIP}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-500 border border-sky-500/40 hover:border-sky-500 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer mr-2.5 group"
            title={isFrench ? 'Modèle TCP/IP (4 couches)' : 'TCP/IP Model (4 layers)'}
          >
            <span>{isFrench ? 'MODÈLE TCP/IP' : 'TCP/IP MODEL'}</span>
          </button>
        )}

        {/* Onglet vers Encapsulation et Décapsulation : placé directement à côté de MODÈLE TCP/IP */}
        {onSelectEncapsulation && (
          <button
            type="button"
            onClick={onSelectEncapsulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-xs cursor-pointer mr-3 group ${
              isEncapsulation
                ? 'bg-emerald-500 text-white border border-emerald-500 shadow-emerald-500/20'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 hover:border-emerald-500'
            }`}
            title={isFrench ? 'Vidéo & Guide : Encapsulation et Décapsulation' : 'Video & Guide: Encapsulation and Decapsulation'}
          >
            <span>{isFrench ? 'ENCAPSULATION ET DÉCAPSULATION' : 'ENCAPSULATION & DECAPSULATION'}</span>
          </button>
        )}

        {/* Indicateur Couche OSI ou TCP/IP (masqué sur Encapsulation pour laisser la place aux onglets) */}
        {!isEncapsulation && (
          <div
            onClick={isTCPIP ? onSelectTCPIP : onSelectOSI}
            className={`hidden md:flex flex-col ${isTCPIP ? 'w-[170px]' : 'w-[210px]'} ${(isTCPIP ? onSelectTCPIP : onSelectOSI) ? 'cursor-pointer group' : ''}`}
            title={
              isTCPIP
                ? (isFrench ? 'Explorer le Modèle TCP/IP en 4 couches' : 'Explore 4-layer TCP/IP Model')
                : (isFrench ? 'Explorer le Modèle OSI en 7 couches' : 'Explore 7-layer OSI Model')
            }
          >
            <div className="flex justify-between items-baseline leading-none">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#ff7c28] uppercase transition-colors">
                {isTCPIP ? (isFrench ? 'COUCHE TCP/IP' : 'TCP/IP LAYER') : (isFrench ? 'COUCHE OSI' : 'OSI LAYER')}
              </span>
              <span className={`text-[10px] font-mono font-extrabold tracking-wider ${isTCPIP ? 'text-sky-500' : 'text-[#ff7c28]'} uppercase`}>
                {layerName}
              </span>
            </div>
            <div className="flex gap-1 mt-1.5">
              {layersList.map((num) => {
                const isActive = num === activeLayer;
                return (
                  <div
                    key={num}
                    className={`flex-1 h-[22px] flex items-center justify-center rounded-[2px] text-xs font-mono font-bold transition-colors ${
                      isActive
                        ? (isTCPIP ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25' : 'bg-[#ff7c28] text-white shadow-sm shadow-orange-500/25')
                        : 'border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Droite : Recherche + Outils + Séparateur + Langue + Thème */}
      <div className="flex items-center gap-2">
        {/* Champ Recherche (Desktop) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden lg:flex items-center gap-2.5 w-64 h-9 px-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/90 hover:border-[#ff7c28]/60 rounded-xs text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{isFrench ? 'Rechercher' : 'Search'}</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Bouton Recherche (Mobile / Tablette) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="lg:hidden w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 rounded-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title={isFrench ? 'Rechercher' : 'Search'}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Outils d'affichage (4 boutons carrés) */}
        {/* 1. Basculer la barre latérale */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 rounded-xs flex items-center justify-center transition-colors cursor-pointer ${
            isSidebarOpen ? 'text-[#ff7c28] bg-orange-500/10 dark:bg-slate-800 border-orange-500/40' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          title={isFrench ? 'Afficher / Masquer la barre latérale' : 'Toggle sidebar'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* 2. Basculer Topologie / Séquence */}
        <button
          type="button"
          onClick={onToggleView}
          className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 rounded-xs flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isFrench ? 'Changer de vue (Topologie / Séquence)' : 'Switch view (Topology / Sequence)'}
        >
          <Layout className="w-4 h-4" />
        </button>

        {/* 3. Plein écran */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 rounded-xs flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isFrench ? 'Plein écran' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* 4. Raccourcis clavier */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 rounded-xs flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isFrench ? 'Raccourcis clavier' : 'Keyboard shortcuts'}
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Séparateur vertical */}
        <div className="w-px h-7 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Sélecteur de langue */}
        <LanguageDropdown />

        {/* Bascule Thème Clair / Sombre avec couleur orange de la charte */}
        <div className="flex h-9 border border-slate-200 dark:border-slate-700 rounded-xs overflow-hidden ml-1 bg-slate-100 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => theme === 'dark' && onToggleTheme()}
            className={`w-9 h-full flex items-center justify-center transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-[#ff7c28] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title={isFrench ? 'Thème clair' : 'Light theme'}
          >
            <Sun className="w-4 h-4" />
          </button>
          <div className="w-px h-full bg-slate-200 dark:bg-slate-700" />
          <button
            type="button"
            onClick={() => theme === 'light' && onToggleTheme()}
            className={`w-9 h-full flex items-center justify-center transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#ff7c28] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title={isFrench ? 'Thème sombre' : 'Dark theme'}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
