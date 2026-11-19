import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const urls = [
      'https://ssp-academy.com/assets/brand/ssp-academy-logo.png',
      'https://ssp-academy.com/assets/brand/og-image.png',
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { next: { revalidate: 86400 } });
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=604800, immutable',
            },
          });
        }
      } catch {
        // try next url
      }
    }
  } catch {
    // fallback below
  }

  // Fallback vector SVG if offline
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
    <rect width="100%" height="100%" fill="none"/>
    <g transform="translate(10, 10)">
      <path d="M40 5 L75 22.5 L40 40 L5 22.5 Z" fill="#ff7c28"/>
      <path d="M5 22.5 L40 40 L40 60 L5 42.5 Z" fill="#e06818"/>
      <path d="M75 22.5 L40 40 L40 60 L75 42.5 Z" fill="#f97316"/>
      <path d="M5 42.5 L40 60 L40 80 L5 62.5 Z" fill="#c2410c"/>
      <path d="M75 42.5 L40 60 L40 80 L75 62.5 Z" fill="#ea580c"/>
    </g>
    <text x="105" y="48" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#0f172a" letter-spacing="2">SSP</text>
    <text x="180" y="48" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="34" fill="#ff7c28" letter-spacing="2">ACADEMY</text>
    <text x="106" y="72" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12" fill="#64748b" letter-spacing="4">CENTRE DE FORMATION PROFESSIONNELLE</text>
  </svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
