/**
 * Adds i18n shell to all docs HTML pages:
 * 1. Changes lang="en" to lang="pt"
 * 2. Adds anti-FOUC script in <head>
 * 3. Adds lang switcher in header
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const docsDir = join(import.meta.dirname, '..', 'docs');
const files = readdirSync(docsDir).filter(f => f.endsWith('.html'));

let updated = 0;

for (const file of files) {
  const filepath = join(docsDir, file);
  let html = readFileSync(filepath, 'utf8');

  // Skip if already converted
  if (html.includes('data-lang-btn')) {
    console.log(`SKIP (already converted): ${file}`);
    continue;
  }

  // 1. Change lang="en" to lang="pt"
  html = html.replace('<html lang="en">', '<html lang="pt">');

  // 2. Add anti-FOUC script before </head>
  const antiFlash = `  <script>\n    (function(){var l=localStorage.getItem('ds-lang');if(l)document.documentElement.setAttribute('lang',l)})();\n  </script>\n</head>`;
  html = html.replace('</head>', antiFlash);

  // 3. Add lang switcher in header actions (before theme-switcher)
  const langSwitcher = `<div class="ds-lang-switcher" role="radiogroup" aria-label="Language">
      <button class="ds-lang-switcher__btn ds-lang-switcher__btn--active" data-lang-btn="pt" role="radio" aria-checked="true">PT</button>
      <button class="ds-lang-switcher__btn" data-lang-btn="en" role="radio" aria-checked="false">EN</button>
    </div>
    <div class="ds-theme-switcher">`;
  html = html.replace('<div class="ds-theme-switcher">', langSwitcher);

  // 4. Update mode toggle default text
  html = html.replace(
    'aria-label="Toggle dark mode">Dark</button>',
    'aria-label="Toggle dark mode">Escuro</button>'
  );

  writeFileSync(filepath, html, 'utf8');
  updated++;
  console.log(`UPDATED: ${file}`);
}

console.log(`\nDone. Updated ${updated}/${files.length} files.`);
