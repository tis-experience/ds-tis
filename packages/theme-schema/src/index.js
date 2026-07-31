export const THEME_SCHEMA_VERSION = '1.0.0-draft.1';

const HEX = /^#[0-9a-fA-F]{6}$/;
const RADIUS = new Set(['sharp', 'default', 'round', 'soft']);
const MODES = new Set(['light', 'dark']);
const STEPS = new Set(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
const ROOT_KEYS = new Set(['brand', 'radius', 'typography', 'mode']);
const BRAND_KEYS = new Set(['seed', 'chromaBoost', 'scale']);
const TYPOGRAPHY_KEYS = new Set(['sans', 'mono', 'display']);

export function validateThemeConfig(input) {
  const errors = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['O tema deve ser um objeto JSON.'] };
  }

  reportUnknownKeys(input, ROOT_KEYS, 'tema', errors);

  if (input.brand !== undefined) {
    if (!input.brand || typeof input.brand !== 'object' || Array.isArray(input.brand)) {
      errors.push('brand deve ser um objeto.');
    } else {
      reportUnknownKeys(input.brand, BRAND_KEYS, 'brand', errors);
      if (!HEX.test(input.brand.seed ?? '')) errors.push('brand.seed deve usar o formato #RRGGBB.');
      if (
        input.brand.chromaBoost !== undefined
        && (
          typeof input.brand.chromaBoost !== 'number'
          || input.brand.chromaBoost < 0.5
          || input.brand.chromaBoost > 1.5
        )
      ) {
        errors.push('brand.chromaBoost deve estar entre 0.5 e 1.5.');
      }
      if (input.brand.scale !== undefined) {
        if (!input.brand.scale || typeof input.brand.scale !== 'object' || Array.isArray(input.brand.scale)) {
          errors.push('brand.scale deve ser um objeto.');
        } else {
          for (const [step, value] of Object.entries(input.brand.scale)) {
            if (!STEPS.has(step)) errors.push(`brand.scale.${step} não é um step suportado.`);
            if (typeof value !== 'string' || !HEX.test(value)) {
              errors.push(`brand.scale.${step} deve usar o formato #RRGGBB.`);
            }
          }
        }
      }
    }
  }

  if (input.radius !== undefined && !RADIUS.has(input.radius)) {
    errors.push('radius deve ser sharp, default, round ou soft.');
  }
  if (input.mode !== undefined && !MODES.has(input.mode)) {
    errors.push('mode deve ser light ou dark.');
  }
  if (input.typography !== undefined) {
    if (!input.typography || typeof input.typography !== 'object' || Array.isArray(input.typography)) {
      errors.push('typography deve ser um objeto.');
    } else {
      reportUnknownKeys(input.typography, TYPOGRAPHY_KEYS, 'typography', errors);
      for (const key of TYPOGRAPHY_KEYS) {
        if (
          input.typography[key] !== undefined
          && (typeof input.typography[key] !== 'string' || !input.typography[key].trim())
        ) {
          errors.push(`typography.${key} deve ser uma string não vazia.`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function reportUnknownKeys(value, allowedKeys, path, errors) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) errors.push(`${path}.${key} não é uma propriedade suportada.`);
  }
}
