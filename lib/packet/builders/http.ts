import { PacketBuilder } from '../PacketBuilder';

export function buildHttpRequest(opts: {
  method: string;
  path: string;
  host: string;
  headers?: [string, string][];
}): PacketBuilder {
  const http = new PacketBuilder('http', 'HTTP/1.1 Request');
  http.summary = `${opts.method} ${opts.path} HTTP/1.1`;

  const requestLine = `${opts.method} ${opts.path} HTTP/1.1\r\n`;
  http.field('Request Line', `${opts.method} ${opts.path} HTTP/1.1`, () => http.ascii(requestLine), {
    heading: true,
  });

  const allHeaders: [string, string][] = [
    ['Host', opts.host],
    ['User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'],
    ['Accept', 'text/html,application/xhtml+xml'],
    ['Connection', 'keep-alive'],
    ...(opts.headers ?? []),
  ];

  for (const [name, val] of allHeaders) {
    http.field(name, val, () => http.ascii(`${name}: ${val}\r\n`));
  }
  http.field('End of Headers', '\\r\\n', () => http.ascii('\r\n'));

  return http;
}

export function buildHttpResponse(opts: {
  statusCode: number;
  statusText: string;
  contentType?: string;
  body?: string;
}): PacketBuilder {
  const http = new PacketBuilder('http', 'HTTP/1.1 Response');
  http.summary = `HTTP/1.1 ${opts.statusCode} ${opts.statusText}`;

  const statusLine = `HTTP/1.1 ${opts.statusCode} ${opts.statusText}\r\n`;
  http.field('Status Line', `${opts.statusCode} ${opts.statusText}`, () => http.ascii(statusLine), {
    heading: true,
  });

  const bodyText = opts.body ?? '<!DOCTYPE html><html><head><title>Example</title></head><body><h1>Example Domain</h1></body></html>';
  const cType = opts.contentType ?? 'text/html; charset=utf-8';

  const headers: [string, string][] = [
    ['Content-Type', cType],
    ['Content-Length', `${bodyText.length}`],
    ['Connection', 'keep-alive'],
    ['Date', new Date().toUTCString()],
  ];

  for (const [name, val] of headers) {
    http.field(name, val, () => http.ascii(`${name}: ${val}\r\n`));
  }
  http.field('End of Headers', '\\r\\n', () => http.ascii('\r\n'));

  http.field('Response Body', `${bodyText.length} bytes (${cType})`, () => http.ascii(bodyText), {
    note: 'Corps textuel HTML de la réponse',
  });

  return http;
}
