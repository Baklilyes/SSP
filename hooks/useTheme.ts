'use client';

import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('protocol-explorer:theme') as Theme | null;
      if (saved) {
        setTheme(saved);
        document.documentElement.dataset.theme = saved;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = prefersDark ? 'dark' : 'light';
        setTheme(initial);
        document.documentElement.dataset.theme = initial;
      }
    } catch {
      // fallback
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('protocol-explorer:theme', next);
    } catch {
      // ignore
    }
  };

  return { theme, toggleTheme, mounted };
}
