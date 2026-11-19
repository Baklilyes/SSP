'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { SUPPORTED_LOCALES, Locale } from '../../lib/i18n/translations';

export function LanguageDropdown() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 px-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xs text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Changer de langue / Change language"
        aria-label="Language selector"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        <span className="uppercase text-xs font-mono font-bold">{locale}</span>
        <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 stroke-[2.5]" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-surface border border-border shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-muted uppercase border-b border-border mb-1">
            Languages
          </div>
          {SUPPORTED_LOCALES.map((item) => {
            const isSelected = item.code === locale;
            return (
              <button
                key={item.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(item.code as Locale);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors duration-150 ${
                  isSelected
                    ? 'bg-orange-500/10 text-[#ea580c] dark:text-[#ff7c28] font-medium'
                    : 'text-foreground hover:bg-surface-hover'
                }`}
              >
                <div className="flex flex-col">
                  <span>{item.native}</span>
                  <span className="text-[10px] text-muted">{item.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#ff7c28] ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
