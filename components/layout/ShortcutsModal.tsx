'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const { t } = useLanguage();
  const shortcutGroups = [
    {
      title: 'Simulation & Lecture',
      shortcuts: [
        { key: 'Espace', desc: 'Lecture / Pause' },
        { key: '→ / S', desc: 'Avancer d’un paquet ou d’une étape' },
        { key: '←', desc: 'Reculer d’un paquet ou d’une étape' },
        { key: '1 - 9', desc: 'Sauter directement à l’étape numéro 1 à 9' },
        { key: '[ / ]', desc: 'Réduire / Augmenter la vitesse de lecture' },
        { key: 'Échap', desc: 'Fermer l’inspecteur ou réinitialiser la simulation' },
      ],
    },
    {
      title: 'Vues & Affichage',
      shortcuts: [
        { key: 'V', desc: 'Basculer entre vue Topologie et Diagramme de Séquence' },
        { key: 'D', desc: 'Mode Focus : afficher le diagramme seul' },
        { key: 'L', desc: 'Afficher / Masquer la liste latérale des protocoles' },
        { key: 'F', desc: 'Basculer en mode Plein Écran' },
        { key: 'T', desc: 'Basculer entre Mode Sombre et Mode Clair' },
      ],
    },
    {
      title: 'Navigation & Recherche',
      shortcuts: [
        { key: 'Ctrl + K / /', desc: 'Ouvrir la palette de recherche rapide' },
        { key: 'N', desc: 'Passer au protocole suivant' },
        { key: 'P', desc: 'Revenir au protocole précédent' },
        { key: '?', desc: 'Ouvrir cette aide sur les raccourcis' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shortcutsTitle')} maxWidth="md">
      <div className="space-y-6">
        {shortcutGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">
              {group.title}
            </h3>
            <div className="space-y-2">
              {group.shortcuts.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0"
                >
                  <span className="text-foreground">{s.desc}</span>
                  <kbd className="px-2 py-1 bg-surface-hover border border-border rounded font-mono text-[11px] text-[#ea580c] dark:text-[#ff7c28] font-semibold shadow-xs">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
