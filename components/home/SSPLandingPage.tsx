'use client';

import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Layers,
  Network,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Globe,
} from 'lucide-react';
import { LanguageDropdown } from '../layout/LanguageDropdown';

export interface SSPLandingPageProps {
  onSelectOSI: () => void;
  onSelectTCPIP: () => void;
  onSelectInteractiveProtocol?: () => void;
  onSelectProtocol?: (protocolId: string) => void;
  onOpenSearch: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isFrench?: boolean;
}

export function SSPLandingPage({
  onSelectOSI,
  onSelectTCPIP,
  onSelectInteractiveProtocol,
  onSelectProtocol,
  onOpenSearch,
  theme,
  onToggleTheme,
  isFrench = true,
}: SSPLandingPageProps) {
  const [logoIndex, setLogoIndex] = useState(0);

  // Sources du logo officiel SSP Academy avec replis automatiques
  const logoSources = [
    'https://ssp-academy.com/assets/brand/ssp-academy-logo.png',
    'https://ssp-academy.com/assets/brand/og-image.png',
    '/api/ssp-logo',
  ];

  const handleLogoError = () => {
    if (logoIndex < logoSources.length - 1) {
      setLogoIndex((prev) => prev + 1);
    }
  };

  const currentLogoSrc = logoSources[logoIndex];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-white dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 select-none transition-colors duration-200">
      {/* 1. Barre supérieure minimale style Google */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#ff7c28]" />
          <span className="font-semibold tracking-wider uppercase">SSP Academy Network Lab</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Lien vers le site officiel */}
          <a
            href="https://ssp-academy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-sans text-slate-600 dark:text-slate-300 hover:text-[#ff7c28] dark:hover:text-[#ff7c28] transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
            title="Visiter le site officiel ssp-academy.com"
          >
            <span>ssp-academy.com</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* Sélecteur de langue */}
          <LanguageDropdown />

          {/* Bascule Thème Clair / Sombre */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={theme === 'dark' ? (isFrench ? 'Thème clair' : 'Light theme') : (isFrench ? 'Thème sombre' : 'Dark theme')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Centre principal : Style Google Minimaliste & Épuré */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10 max-w-5xl mx-auto w-full">
        {/* Logo officiel récupéré depuis https://ssp-academy.com */}
        <div className="mb-6 flex flex-col items-center justify-center group">
          <div className="relative p-2 transition-transform duration-300 hover:scale-105">
            <img
              src={currentLogoSrc}
              alt="SSP Academy"
              onError={handleLogoError}
              className="h-24 sm:h-28 md:h-32 w-auto max-w-[340px] sm:max-w-[420px] object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* Titre d'accueil Welcome to SSP Academy */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to <span className="text-[#ff7c28]">SSP Academy</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
            {isFrench
              ? 'Plateforme interactive d’exploration et de simulation des protocoles réseaux'
              : 'Interactive platform for exploring and simulating networking protocols'}
          </p>
        </div>

        {/* Barre de recherche style Google */}
        <div className="w-full max-w-xl mb-7">
          <div
            onClick={onOpenSearch}
            role="button"
            tabIndex={0}
            className="flex items-center gap-3 w-full px-5 py-3.5 rounded-full border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <Search className="w-5 h-5 text-slate-400 group-hover:text-[#ff7c28] transition-colors" />
            <span className="flex-1 text-sm text-slate-400 font-sans">
              {isFrench
                ? 'Rechercher un protocole, une couche (HTTP, DNS, TCP, IP...)'
                : 'Search a protocol, layer (HTTP, DNS, TCP, IP...)'}
            </span>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Les Trois Accès Réseau : Modèle OSI, Modèle TCP/IP & Interactive PROTOCOL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl lg:max-w-5xl">
          {/* Bouton 1 : MODÈLE OSI */}
          <button
            type="button"
            onClick={onSelectOSI}
            className="group relative w-full p-4 sm:py-4 sm:px-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 hover:border-[#ff7c28] hover:bg-orange-50/50 dark:hover:bg-orange-950/20 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-orange-500/15 text-[#ff7c28] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white group-hover:text-[#ff7c28] transition-colors truncate">
                    {isFrench ? 'Modèle OSI' : 'OSI Model'}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-[#ff7c28] shrink-0">
                    7 {isFrench ? 'Couches' : 'Layers'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5 line-clamp-1">
                  {isFrench ? 'Encapsulation & Décapsulation' : 'Full encapsulation & decapsulation'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-[#ff7c28] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Bouton 2 : MODÈLE TCP/IP */}
          <button
            type="button"
            onClick={onSelectTCPIP}
            className="group relative w-full p-4 sm:py-4 sm:px-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 shadow-sm hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-200 cursor-pointer text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Network className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors truncate">
                    {isFrench ? 'Modèle TCP/IP' : 'TCP/IP Model'}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
                    4 {isFrench ? 'Couches' : 'Layers'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5 line-clamp-1">
                  {isFrench ? 'Architecture d’Internet opérationnelle' : 'Operational Internet architecture'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Bouton 3 : INTERACTIVE PROTOCOL */}
          <button
            type="button"
            onClick={() => {
              if (onSelectInteractiveProtocol) {
                onSelectInteractiveProtocol();
              } else if (onSelectProtocol) {
                onSelectProtocol('http');
              }
            }}
            className="group relative w-full p-4 sm:py-4 sm:px-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-violet-500/30 hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 shadow-sm hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200 cursor-pointer text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors truncate">
                    Interactive <span className="text-[#ff7c28]">PROTOCOL</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 shrink-0">
                    40+ {isFrench ? 'Protocoles' : 'Protocols'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5 line-clamp-1">
                  {isFrench ? 'Catalogue & simulateur interactif' : 'Catalog & interactive simulator'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        </div>

        {/* Raccourcis rapides de protocoles en dessous */}
        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#ff7c28]" />
            <span>{isFrench ? 'Accès direct :' : 'Direct access:'}</span>
          </span>
          {['http', 'dns', 'tcp', 'ip', 'ethernet', 'bgp'].map((proto) => (
            <button
              key={proto}
              type="button"
              onClick={() => onSelectProtocol && onSelectProtocol(proto)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#ff7c28] transition-colors cursor-pointer uppercase font-bold text-[11px]"
            >
              {proto}
            </button>
          ))}
        </div>
      </main>

      {/* 3. Pied de page style Google */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b16] text-slate-500 dark:text-slate-400 text-xs font-sans">
        {/* Ligne 1 : Emplacement / Centre */}
        <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            Algérie · Alger, Birkhadem
          </span>
          <span className="text-[11px] text-slate-400">
            SSP Academy · Centre Agréé de Formation Professionnelle
          </span>
        </div>

        {/* Ligne 2 : Liens & Informations */}
        <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <a
              href="https://ssp-academy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ff7c28] transition-colors"
            >
              À propos de SSP Academy
            </a>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hover:text-[#ff7c28] transition-colors cursor-default">
              Formations Courants Faibles, Réseaux & Sécurité
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>© 2026 SSP Academy</span>
            <span className="text-[#ff7c28] font-bold">Interactive PROTOCOL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
