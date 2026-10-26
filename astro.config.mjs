// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Dominio público. Cámbialo en Cloudflare Pages con la variable SITE_URL
// (o aquí) cuando el dominio definitivo esté listo.
const SITE_URL = process.env.SITE_URL ?? 'https://lapapeslp.com';

export default defineConfig({
  site: SITE_URL,
  // Cloudflare Pages sirve `servicios.html` en `/servicios` sin redirecciones.
  trailingSlash: 'never',
  build: {
    format: 'file',
    // CSS crítico en línea: sin hojas de estilo que bloqueen el render.
    inlineStylesheets: 'always',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
