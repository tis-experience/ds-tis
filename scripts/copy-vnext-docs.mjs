import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(ROOT, 'apps', 'docs', 'dist');
const destination = path.join(ROOT, '_site', 'next');

if (!fs.existsSync(source)) {
  throw new Error('Build Astro ausente em apps/docs/dist. Rode npm run build:docs:vnext.');
}

assertNoSymlinks(source);
fs.mkdirSync(destination, { recursive: true });

for (const entry of fs.readdirSync(destination, { withFileTypes: true })) {
  if (['storybook', 'storybook-angular'].includes(entry.name) && entry.isDirectory()) continue;
  fs.rmSync(path.join(destination, entry.name), { recursive: true, force: true });
}

for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
  const from = path.join(source, entry.name);
  const to = path.join(destination, entry.name);
  fs.cpSync(from, to, { recursive: entry.isDirectory(), dereference: false });
}

console.log(`✅ Portal vNext copiado para ${path.relative(ROOT, destination)}/.`);

function assertNoSymlinks(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink não permitido no portal vNext: ${absolute}`);
    if (entry.isDirectory()) assertNoSymlinks(absolute);
  }
}
