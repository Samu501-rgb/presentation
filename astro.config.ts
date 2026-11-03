// Configurazione Astro: sito statico, Tailwind 4 via Vite, font self-hosted.
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { urlSito } from './src/data/negozio';

export default defineConfig({
  site: process.env.SITE_URL ?? urlSito(),
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Prefetch disattivato: niente richieste speculative non richieste.
  prefetch: false,
  integrations: [
    icon({ include: { lucide: ['*'] } }),
    sitemap({
      filter: (pagina) => !pagina.includes('/404'),
    }),
  ],
  // Font self-hosted (WOFF2, solo sottoinsieme latino). Astro genera i fallback
  // adattati alle metriche (size-adjust, ascent-override…) con Capsize: CLS zero.
  fonts: [
    {
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      provider: fontProviders.local(),
      display: 'optional',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/bricolage-grotesque-latin-wght-normal.woff2'],
            weight: '200 800',
            style: 'normal',
          },
        ],
      },
    },
    {
      name: 'Instrument Sans',
      cssVariable: '--font-instrument',
      provider: fontProviders.local(),
      display: 'optional',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/instrument-sans-latin-wght-normal.woff2'],
            weight: '400 700',
            style: 'normal',
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
