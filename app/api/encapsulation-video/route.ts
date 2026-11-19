import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOCAL_VIDEO_PATH = path.join(process.cwd(), 'Video', 'encapsulation.mp4');
const LOCAL_VIDEO_ALT = path.join(process.cwd(), 'Video', 'uploaded_media_1795015485747.mp4');
const VIDEO_PATH =
  'C:/Users/admin.bouira/.gemini/antigravity-cli/brain/ce300215-ce13-45b6-9889-a8bfa5b921b2/.user_uploaded/uploaded_media_1795015485747.mp4';
const B64_PATH =
  'C:/Users/admin.bouira/.gemini/antigravity-cli/brain/ce300215-ce13-45b6-9889-a8bfa5b921b2/scratch/osi_video_b64.txt';

export async function GET(request: NextRequest) {
  let fileBuffer: Buffer | null = null;

  if (fs.existsSync(LOCAL_VIDEO_PATH)) {
    fileBuffer = fs.readFileSync(LOCAL_VIDEO_PATH);
  } else if (fs.existsSync(LOCAL_VIDEO_ALT)) {
    fileBuffer = fs.readFileSync(LOCAL_VIDEO_ALT);
  } else if (fs.existsSync(VIDEO_PATH)) {
    fileBuffer = fs.readFileSync(VIDEO_PATH);
  } else if (fs.existsSync(B64_PATH)) {
    const b64 = fs.readFileSync(B64_PATH, 'utf8').trim();
    fileBuffer = Buffer.from(b64, 'base64');
  }

  if (!fileBuffer) {
    return new NextResponse('Video not found', { status: 404 });
  }

  const fileSize = fileBuffer.length;
  const range = request.headers.get('range');

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const chunk = fileBuffer.subarray(start, end + 1);

    return new NextResponse(new Uint8Array(chunk), {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
