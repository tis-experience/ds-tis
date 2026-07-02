import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import { existsSync, writeFileSync } from 'fs';

// Register DTCG-compatible transforms from tokens-studio
register(StyleDictionary);

// ─── Custom name transform ───
// Strips layer prefix and intermediate grouping to match CSS convention:
//   foundation.color.blue.500     → --ds-color-blue-500
//   foundation.typography.font.*  → --ds-font-*
//   foundation.color.overlay.*    → --ds-overlay-*
//   semantic.background.default   → --ds-background-default
//   component.button.height.sm    → --ds-button-height-sm
StyleDictionary.registerTransform({
  name: 'name/strip-layer',
  type: 'name',
  transform: (token) => {
    const path = [...token.path];

    // Strip layer prefix (foundation/semantic/component)
    path.shift();

    // Strip 'typography' group: foundation.typography.font.* → font-*
    if (path[0] === 'typography') path.shift();

    // Strip 'color' only before overlay: foundation.color.overlay.* → overlay-*
    // Keep 'color' for palettes: foundation.color.blue.* → color-blue-*
    if (path[0] === 'color' && path[1] === 'overlay') path.shift();

    return 'ds-' + path.join('-');
  }
});

// Shared transforms: SD built-in + tokens-studio + custom name
const transforms = [
  'attribute/cti',
  'fontFamily/css',
  'cubicBezier/css',
  'shadow/css/shorthand',
  'ts/size/lineheight',
  'ts/size/css/letterspacing',
  'ts/color/css/hexrgba',
  'ts/size/px',
  'ts/opacity',
  'ts/resolveMath',
  'name/strip-layer',
];

// Suppress expected "filtered out references" warnings
const log = { verbosity: 'silent' };

const buildPath = 'css/tokens/generated/';

// ─── Foundation ───
const foundation = new StyleDictionary({
  log,
  source: ['tokens/foundation/**/*.json'],
  platforms: {
    css: {
      transforms,
      buildPath,
      files: [{
        destination: 'foundation.css',
        format: 'css/variables',
        options: { selector: ':root', outputReferences: false }
      }]
    }
  }
});

// ─── Semantic Light ───
const semanticLight = new StyleDictionary({
  log,
  include: ['tokens/foundation/**/*.json'],
  source: ['tokens/semantic/light.json'],
  platforms: {
    css: {
      transforms,
      buildPath,
      files: [{
        destination: 'theme-light.css',
        format: 'css/variables',
        filter: (token) => token.path[0] === 'semantic',
        options: { selector: ':root,\n[data-mode="light"]', outputReferences: true }
      }]
    }
  }
});

// ─── Semantic Dark ───
const semanticDark = new StyleDictionary({
  log,
  include: ['tokens/foundation/**/*.json'],
  source: ['tokens/semantic/dark.json'],
  platforms: {
    css: {
      transforms,
      buildPath,
      files: [{
        destination: 'theme-dark.css',
        format: 'css/variables',
        filter: (token) => token.path[0] === 'semantic',
        options: { selector: '[data-mode="dark"]', outputReferences: true }
      }]
    }
  }
});

// ─── Component ───
// Component tokens are mode-invariant contracts for component anatomy
// (ADR-019). They may reference Semantic vars; outputReferences keeps the
// generated CSS pointing to the Semantic custom properties so theme changes
// still flow through at runtime.
const hasComponentTokens = existsSync('tokens/component');
const component = hasComponentTokens ? new StyleDictionary({
  log,
  include: ['tokens/foundation/**/*.json', 'tokens/semantic/light.json'],
  source: ['tokens/component/**/*.json'],
  platforms: {
    css: {
      transforms,
      buildPath,
      files: [{
        destination: 'component.css',
        format: 'css/variables',
        filter: (token) => token.path[0] === 'component',
        options: { selector: ':root', outputReferences: true }
      }]
    }
  }
}) : null;

// ─── Build ───
console.log('Building tokens...');
await foundation.buildAllPlatforms();
await semanticLight.buildAllPlatforms();
await semanticDark.buildAllPlatforms();
if (component) await component.buildAllPlatforms();

// ─── Generate index.css ───
const indexCss = `/* Auto-generated — do not edit. Run: npm run build:tokens */
@import 'foundation.css';
@import 'theme-light.css';
@import 'theme-dark.css';
${component ? "@import 'component.css';\n" : ""}`;
writeFileSync(`${buildPath}index.css`, indexCss);

console.log('Done. Output (Foundation/Core → Semantic/System → Component):');
console.log('  css/tokens/generated/foundation.css');
console.log('  css/tokens/generated/theme-light.css');
console.log('  css/tokens/generated/theme-dark.css');
if (component) console.log('  css/tokens/generated/component.css');
console.log('  css/tokens/generated/index.css');
