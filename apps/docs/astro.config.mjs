import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const base = process.env.DS_DOCS_BASE || '/ds-tis/next';

export default defineConfig({
  site: 'https://tis-experience.github.io',
  base,
  redirects: {
    '/': `${base}/pt-br/`,
    '/pt-br/react/registry/': `${base}/pt-br/react/`,
    '/en/react/registry/': `${base}/en/react/`,
  },
  integrations: [
    starlight({
      title: 'TIS Design System',
      description: 'Componentes, tokens e orientações do Design System TIS por tecnologia.',
      logo: {
        src: './src/assets/logo-tis-vnext.svg',
        alt: 'TIS Design System',
        replacesTitle: false,
      },
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'pt-br',
      locales: {
        'pt-br': {
          label: 'Português',
          lang: 'pt-BR',
        },
        en: {
          label: 'English',
          lang: 'en',
        },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/tis-experience/ds-tis',
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      sidebar: [
        {
          label: 'Começar',
          translations: { en: 'Start' },
          items: [
            { slug: 'index' },
            { slug: 'architecture' },
          ],
        },
        {
          label: 'Componentes',
          translations: { en: 'Components' },
          items: [{ slug: 'components' }],
        },
        {
          label: 'Integração',
          translations: { en: 'Integration' },
          items: [
            { slug: 'web' },
            { slug: 'react' },
            { slug: 'angular' },
            { slug: 'ai' },
          ],
        },
      ],
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        SiteTitle: './src/components/SiteTitle.astro',
      },
      lastUpdated: true,
    }),
  ],
});
