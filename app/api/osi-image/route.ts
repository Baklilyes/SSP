import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const possiblePaths = [
    'C:/Users/admin.bouira/.gemini/antigravity-cli/brain/ce300215-ce13-45b6-9889-a8bfa5b921b2/.user_uploaded/uploaded_media_1795009713423.jpg',
    path.join(process.cwd(), 'scratch', 'uploaded_media_1795009713423.jpg'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const buffer = fs.readFileSync(p);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  }

  const b64Path = 'C:/Users/admin.bouira/.gemini/antigravity-cli/brain/ce300215-ce13-45b6-9889-a8bfa5b921b2/scratch/b64.txt';
  if (fs.existsSync(b64Path)) {
    const b64 = fs.readFileSync(b64Path, 'utf8').trim();
    const buffer = Buffer.from(b64, 'base64');
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return new NextResponse('Image not found', { status: 404 });
}
