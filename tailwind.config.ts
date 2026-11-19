import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        layer: {
          eth: '#64748b',
          ip: '#0ea5e9',
          tcp: '#10b981',
          udp: '#f59e0b',
          dns: '#3b82f6',
          tls: '#8b5cf6',
          req: '#f97316',
          res: '#a855f7',
          lost: '#ef4444',
          pad: '#475569',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        phone: '380px',
        narrow: '640px',
        tablet: '900px',
        medium: '1100px',
        wide: '1440px',
      },
    },
  },
  plugins: [],
};

export default config;
