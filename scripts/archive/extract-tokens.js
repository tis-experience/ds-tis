/**
 * extract-tokens.js
 * 
 * Extrai CSS custom properties de foundation.css, theme-light.css e theme-dark.css
 * e converte para JSON no formato DTCG.
 * 
 * Uso: node scripts/extract-tokens.js
 * 
 * Input:  css/tokens/foundation.css, css/tokens/theme-light.css, css/tokens/theme-dark.css
 * Output: tokens/foundation/colors.json, tokens/foundation/typography.json, 
 *         tokens/foundation/spacing.json, tokens/foundation/radius.json,
 *         tokens/foundation/shadows.json, tokens/foundation/opacity.json,
 *         tokens/foundation/stroke.json, tokens/semantic/light.json, tokens/semantic/dark.json
 */

const fs = require('fs');
const path = require('path');

// --- Helpers ---

function parseCSSVariables(cssContent) {
  const vars = {};
  // Match --ds-*: value; patterns inside :root or [data-*] blocks
  const varRegex = /--ds-([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(cssContent)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    vars[name] = value;
  }
  return vars;
}

function inferType(name, value) {
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) return 'color';
  if (value.startsWith('var(--ds-')) return 'color'; // alias — will be resolved
  if (name.includes('font-family')) return 'fontFamily';
  if (name.includes('font-size')) return 'dimension';
  if (name.includes('font-weight')) return 'number';
  if (name.includes('line-height')) return 'number';
  if (name.includes('letter-spacing')) return 'dimension';
  if (name.includes('spacing') || name.includes('space')) return 'dimension';
  if (name.includes('radius')) return 'dimension';
  if (name.includes('stroke') || name.includes('border-width')) return 'dimension';
  if (name.includes('opacity')) return 'number';
  if (name.includes('shadow')) return 'shadow';
  if (value.endsWith('px') || value.endsWith('rem') || value.endsWith('em')) return 'dimension';
  if (!isNaN(parseFloat(value))) return 'number';
  return 'color'; // default for theme tokens
}

function cssVarToTokenRef(value) {
  // Convert var(--ds-color-blue-500) to {foundation.color.blue.500}
  const varMatch = value.match(/var\(--ds-([\w-]+)\)/);
  if (varMatch) {
    const parts = varMatch[1].split('-');
    return `{foundation.${parts.join('.')}}`;
  }
  return value;
}

function nestToken(obj, pathParts, value, type) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!current[pathParts[i]]) current[pathParts[i]] = {};
    current = current[pathParts[i]];
  }
  const lastKey = pathParts[pathParts.length - 1];
  current[lastKey] = {
    "$type": type,
    "$value": value
  };
}

function categorizeFoundation(vars) {
  const categories = {
    colors: {},
    typography: {},
    spacing: {},
    radius: {},
    shadows: {},
    opacity: {},
    stroke: {}
  };

  for (const [name, value] of Object.entries(vars)) {
    const parts = name.split('-');
    const type = inferType(name, value);

    if (name.startsWith('color-') || (parts[0] === 'color')) {
      // color-blue-500 → foundation.color.blue.500
      const colorParts = parts.slice(1); // remove 'color'
      nestToken(categories.colors, ['foundation', 'color', ...colorParts], value, 'color');
    }
    else if (name.startsWith('font-') || name.startsWith('letter-') || name.startsWith('line-height')) {
      const typoParts = parts;
      nestToken(categories.typography, ['foundation', 'typography', ...typoParts], value, type);
    }
    else if (name.startsWith('spacing-') || name.startsWith('space-')) {
      const spaceParts = parts;
      nestToken(categories.spacing, ['foundation', ...spaceParts], value, 'dimension');
    }
    else if (name.startsWith('radius-')) {
      const radiusParts = parts;
      nestToken(categories.radius, ['foundation', ...radiusParts], value, 'dimension');
    }
    else if (name.startsWith('shadow-')) {
      // Shadows are complex values — store as-is
      const shadowParts = parts;
      nestToken(categories.shadows, ['foundation', ...shadowParts], value, 'shadow');
    }
    else if (name.startsWith('opacity-')) {
      const opacityParts = parts;
      nestToken(categories.opacity, ['foundation', ...opacityParts], value, 'number');
    }
    else if (name.startsWith('stroke-') || name.startsWith('border-width')) {
      const strokeParts = parts;
      nestToken(categories.stroke, ['foundation', ...strokeParts], value, 'dimension');
    }
    else if (name.startsWith('overlay-')) {
      // Overlays go into colors
      nestToken(categories.colors, ['foundation', 'color', ...parts], value, 'color');
    }
    else {
      // Uncategorized — log and skip
      console.warn(`⚠️  Uncategorized token: --ds-${name}: ${value}`);
    }
  }

  return categories;
}

function categorizeTheme(vars, themeVarPrefix) {
  const semantic = {};

  for (const [name, value] of Object.entries(vars)) {
    const type = inferType(name, value);
    const parts = name.split('-');

    // Convert var() references to token notation
    const resolvedValue = value.startsWith('var(') ? cssVarToTokenRef(value) : value;

    nestToken(semantic, ['semantic', ...parts], resolvedValue, type);
  }

  return semantic;
}

// --- Main ---

function main() {
  const rootDir = process.cwd();
  const cssTokensDir = path.join(rootDir, 'css', 'tokens');
  const outputDir = path.join(rootDir, 'tokens');

  // Check if CSS files exist
  const foundationPath = path.join(cssTokensDir, 'foundation.css');
  const lightPath = path.join(cssTokensDir, 'theme-light.css');
  const darkPath = path.join(cssTokensDir, 'theme-dark.css');

  if (!fs.existsSync(foundationPath)) {
    console.error(`❌ File not found: ${foundationPath}`);
    console.error('   Run this script from the root of the ds-tis repo.');
    process.exit(1);
  }

  console.log('📖 Reading CSS token files...');
  const foundationCSS = fs.readFileSync(foundationPath, 'utf-8');
  const lightCSS = fs.readFileSync(lightPath, 'utf-8');
  const darkCSS = fs.readFileSync(darkPath, 'utf-8');

  console.log('🔍 Parsing CSS custom properties...');
  const foundationVars = parseCSSVariables(foundationCSS);
  const lightVars = parseCSSVariables(lightCSS);
  const darkVars = parseCSSVariables(darkCSS);

  console.log(`   Foundation: ${Object.keys(foundationVars).length} variables`);
  console.log(`   Light theme: ${Object.keys(lightVars).length} variables`);
  console.log(`   Dark theme: ${Object.keys(darkVars).length} variables`);

  console.log('🔄 Categorizing foundation tokens...');
  const categories = categorizeFoundation(foundationVars);

  console.log('🔄 Processing semantic tokens...');
  const lightSemantic = categorizeTheme(lightVars);
  const darkSemantic = categorizeTheme(darkVars);

  // Create output directories
  const dirs = [
    path.join(outputDir, 'foundation'),
    path.join(outputDir, 'semantic'),
    path.join(outputDir, 'component')
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created: ${dir}`);
    }
  });

  // Write foundation files
  const foundationFiles = {
    'colors.json': categories.colors,
    'typography.json': categories.typography,
    'spacing.json': categories.spacing,
    'radius.json': categories.radius,
    'shadows.json': categories.shadows,
    'opacity.json': categories.opacity,
    'stroke.json': categories.stroke
  };

  for (const [filename, data] of Object.entries(foundationFiles)) {
    if (Object.keys(data).length > 0) {
      const filePath = path.join(outputDir, 'foundation', filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`✅ Written: ${filePath}`);
    }
  }

  // Write semantic files
  const lightPath2 = path.join(outputDir, 'semantic', 'light.json');
  const darkPath2 = path.join(outputDir, 'semantic', 'dark.json');
  fs.writeFileSync(lightPath2, JSON.stringify(lightSemantic, null, 2) + '\n');
  fs.writeFileSync(darkPath2, JSON.stringify(darkSemantic, null, 2) + '\n');
  console.log(`✅ Written: ${lightPath2}`);
  console.log(`✅ Written: ${darkPath2}`);

  // Create empty component directory placeholder
  const componentReadme = path.join(outputDir, 'component', 'README.md');
  if (!fs.existsSync(componentReadme)) {
    fs.writeFileSync(componentReadme, '# Component Tokens\n\nComponent-level tokens will be added here as each component is migrated.\n');
    console.log(`✅ Written: ${componentReadme}`);
  }

  // Summary
  console.log('\n📊 Extraction summary:');
  console.log(`   Foundation files: ${Object.values(foundationFiles).filter(d => Object.keys(d).length > 0).length}`);
  console.log(`   Semantic files: 2 (light.json, dark.json)`);
  console.log(`   Total foundation vars extracted: ${Object.keys(foundationVars).length}`);
  console.log(`   Total light theme vars extracted: ${Object.keys(lightVars).length}`);
  console.log(`   Total dark theme vars extracted: ${Object.keys(darkVars).length}`);
  console.log('\n⚠️  Review the output files for accuracy. The script infers types from naming patterns.');
  console.log('   Uncategorized tokens (if any) are logged above as warnings.');
  console.log('   Shadow values may need manual adjustment to DTCG composite format.');
  console.log('\n🔜 Next steps:');
  console.log('   1. Review generated JSON files');
  console.log('   2. Fix any type inference errors');
  console.log('   3. Configure Style Dictionary (style-dictionary.config.js)');
  console.log('   4. Validate: Style Dictionary output should match original CSS');
}

main();
