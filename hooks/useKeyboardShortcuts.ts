'use client';

import { useEffect } from 'react';

export interface ShortcutHandlers {
  onTogglePlay?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onJumpStep?: (stepIndex: number) => void;
  onToggleView?: () => void;
  onToggleFocus?: () => void;
  onToggleList?: () => void;
  onToggleFullscreen?: () => void;
  onToggleTheme?: () => void;
  onNextProtocol?: () => void;
  onPrevProtocol?: () => void;
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
  onEscape?: () => void;
  onChangeSpeed?: (delta: number) => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer les raccourcis si l'utilisateur est dans un champ de saisie
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ctrl+K / Cmd+K -> Palette de recherche
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onOpenSearch?.();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlers.onTogglePlay?.();
          break;
        case 'ArrowRight':
        case 's':
        case 'S':
          e.preventDefault();
          handlers.onStepForward?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlers.onStepBackward?.();
          break;
        case 'Escape':
          e.preventDefault();
          handlers.onEscape?.();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          handlers.onToggleView?.();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          handlers.onToggleFocus?.();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          handlers.onToggleList?.();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handlers.onToggleFullscreen?.();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          handlers.onToggleTheme?.();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          handlers.onNextProtocol?.();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          handlers.onPrevProtocol?.();
          break;
        case '/':
          e.preventDefault();
          handlers.onOpenSearch?.();
          break;
        case '?':
          e.preventDefault();
          handlers.onOpenShortcuts?.();
          break;
        case '[':
          e.preventDefault();
          handlers.onChangeSpeed?.(-1);
          break;
        case ']':
          e.preventDefault();
          handlers.onChangeSpeed?.(1);
          break;
        default: {
          const num = parseInt(e.key, 10);
          if (!isNaN(num) && num >= 1 && num <= 9) {
            e.preventDefault();
            handlers.onJumpStep?.(num - 1);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
