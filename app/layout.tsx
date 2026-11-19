import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'Protocol Explorer · Learn how the internet works',
  description:
    'Watch the internet work, packet by packet. Interactive lessons on HTTP, HTTPS, TCP, UDP, IP, DNS, TLS, WebRTC, BGP, WireGuard, with every packet decoded byte by byte.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col overflow-hidden">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
