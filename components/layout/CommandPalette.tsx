'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, CornerDownLeft } from 'lucide-react';
import { PROTOCOLS_LIST, ProtocolMeta } from '../../data/protocols';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (protocolId: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    if (!query.trim()) return PROTOCOLS_LIST;
    const q = query.toLowerCase();
    return PROTOCOLS_LIST.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.full.toLowerCase().includes(q) ||
        p.group.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Champ de saisie */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-surface">
          <Search className="w-5 h-5 text-muted mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <kbd className="text-[10px] text-muted border border-border px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Liste des résultats */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              {t('searchNoResults')}
            </div>
          ) : (
            results.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p.id);
                  onClose();
                }}
                className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                  idx === selectedIndex
                    ? 'bg-orange-500/10 text-[#ea580c] dark:text-[#ff7c28] border border-orange-500/30'
                    : 'text-foreground hover:bg-surface-hover border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm w-16">{p.name}</span>
                  <span className="text-xs text-muted">{p.full}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-surface-hover rounded text-muted">
                    {p.group}
                  </span>
                  <CornerDownLeft className="w-3.5 h-3.5 text-muted opacity-60" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pied de boîte */}
        <div className="px-4 py-2 border-t border-border bg-surface-hover/50 text-[11px] text-muted flex items-center justify-between">
          <span>Naviguer avec les flèches ↑ ↓ et valider avec Entrée</span>
          <span>{results.length} protocoles</span>
        </div>
      </div>
    </div>
  );
}
