/**
 * sd.config.js — Style Dictionary v5 configuration
 *
 * Transforms DTCG JSON tokens into CSS custom properties.
 * Usage: npx style-dictionary build --config sd.config.js
 */

export default {
  source: [
    'tokens/foundation/**/*.json',
    'tokens/semantic/light.json',
    'tokens/component/**/*.json'
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'ds',
      buildPath: 'css/tokens/generated/',
      files: [
        {
          destination: 'foundation.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('foundation'),
          options: { selector: ':root' }
        },
        {
          destination: 'theme-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic/light'),
          options: { selector: ':root' }
        }
      ]
    }
  }
};
