#!/usr/bin/env node

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = path.join(ROOT, '_site');
const host = readArgument('--host') || '127.0.0.1';
const port = Number.parseInt(readArgument('--port') || '4177', 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Porta inválida. Use --port entre 1 e 65535.');
  process.exit(1);
}

const portalEntry = path.join(SITE, 'next', 'pt-br', 'index.html');
const storybookEntry = path.join(SITE, 'next', 'storybook', 'index.html');
const angularStorybookEntry = path.join(SITE, 'next', 'storybook-angular', 'index.html');

if (!existsSync(portalEntry) || !existsSync(storybookEntry) || !existsSync(angularStorybookEntry)) {
  console.error(
    'Preview vNext incompleta. Rode npm run build:preview:vnext para gerar Astro + Storybook.',
  );
  process.exit(2);
}

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const server = createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') {
    response.writeHead(302, { Location: '/ds-tis/next/pt-br/' }).end();
    return;
  }
  if (pathname === '/ds-tis' || pathname === '/ds-tis/') pathname = '/';
  else pathname = pathname.replace(/^\/ds-tis\//, '/');

  let file = path.resolve(SITE, pathname.replace(/^\/+/, ''));
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');

  if (
    !file.startsWith(`${SITE}${path.sep}`) ||
    !existsSync(file) ||
    !statSync(file).isFile()
  ) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`✅ Preview vNext: http://${host}:${port}/ds-tis/next/pt-br/`);
  console.log(`   Storybook:     http://${host}:${port}/ds-tis/next/storybook/`);
  console.log(`   Angular:       http://${host}:${port}/ds-tis/next/storybook-angular/`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
  });
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
