# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Sitio público de Papelería La Reforma (San Luis Potosí). Astro 5 estático + Tailwind v4. Código, comentarios y textos en español; mantén ese idioma.
El README es la referencia completa (despliegue, variables, calidad); aquí solo lo esencial.

## Comandos

```bash
npm run dev        # http://localhost:4321 (sin _headers)
npm run build      # genera dist/
npm run check      # astro check — es lo que corre CI
npm run pages:dev  # build + wrangler en :8788: único modo que aplica _headers
node scripts/generar-iconos.mjs   # regenera favicons/PWA desde src/assets/logos/isotipo.png (o favicon.svg)
```

No hay tests ni linter. Verificación = `npm run check && npm run build` (igual que `.github/workflows/ci.yml`).
Despliegue: push a `main` → Cloudflare Pages publica solo. Node 22 (`.node-version`).

## Arquitectura

- **`src/lib/negocio.ts` es la fuente única de verdad**: contacto, horarios, servicios/precios,
  promociones, pagos, redes, SEO y navegación. Ningún componente escribe a mano un teléfono,
  precio u horario. Tabla de horarios, widget "¿Abierto ahora?", footer, meta y JSON-LD
  (`seo.ts`) se derivan de ahí.
- **`src/lib/utils.ts`**: formato (precios, horas), URLs (WhatsApp, tel, Maps) y la lógica de
  horario. `ahoraEnNegocio`/`estadoApertura` siempre usan `America/Mexico_City`, no la hora del
  visitante. Varios `turnos` en un día = receso entre ellos.
- **`src/lib/api.ts`**: capa para el futuro backend del sistema interno. Las páginas llaman
  `obtenerServicios()`/`obtenerPromociones()`, nunca `fetch`. Con `PUBLIC_API_URL` vacía (hoy)
  devuelven `negocio.ts`; con ella, leen del backend y caen a `negocio.ts` si falla. Como el
  sitio es estático, esto ocurre en **build**, no en el navegador.
- **`src/lib/carrito.ts`** y `crearCotizacion`/`consultarCredito`: solo scaffolding. Busca
  `TODO(Carrito)`, `TODO(API)`, `TODO(Crédito)`, `TODO(Datos)`. Rutas dinámicas futuras
  requerirían `@astrojs/cloudflare` + `prerender = false` solo en esas rutas.
- **Sin formularios ni backend**: el sitio es 100 % estático y todo el contacto es por WhatsApp
  (`urlWhatsApp()` con mensaje prellenado). Se quitó el formulario de contacto a propósito; el
  correo (`pape.lareforma1@gmail.com`) solo se muestra en `/contacto`. El futuro carrito debe
  terminar armando un mensaje de WhatsApp.
- **Pedidos por WhatsApp**: `Cotizador.astro` (en `/productos#cotizador`) suma cantidades × precio base de los
  servicios listados en `negocio.cotizador` y arma el mensaje con un script pequeño (sin JS se oculta y queda
  un `<noscript>`). `/lista-escolar` usa `negocio.listaEscolar.niveles`; si la promoción `listas-escolares`
  está activa, la página muestra el `PromoBanner`. Para agregar un renglón a la calculadora, basta añadirlo a
  `negocio.cotizador` con el `id` de un servicio con precio.
- **Layouts**: `BaseLayout` (meta, OG, JSON-LD) → `PageLayout` (páginas internas + migas).
- **Tailwind v4 sin `tailwind.config.js`**: tema (colores, fuentes, breakpoints) en `@theme` de
  `src/styles/global.css`. Alias `@/*` → `src/*`.
- **Diseño** (rediseño 2026-10-26 sobre un mockup de Antonio): fondos blancos y `celeste-50`, botón
  principal azul (`btn-primary`), WhatsApp en verde (`btn-whatsapp`), badges `.eyebrow`, manchas
  amarillo/coral del manual como decoración. Menú: Inicio · Productos · Nosotros · Ubicación
  (`/servicios` redirige a `/productos` vía `public/_redirects`; Contacto solo en el footer).
- **Fotos**: `Foto.astro` toma `src/assets/images/<nombre>.jpg` si existe y si no muestra un relleno
  de marca. Los nombres esperados están en la sección "Fotos" del README; se usan fotos reales del
  negocio, no generadas.
- **Logos**: `Logo.astro` usa el logo oficial a color tal cual (`src/assets/logos/logo-horizontal.png`),
  siempre sobre blanco: el header es blanco y en el footer (azul marino) va en un recuadro blanco.
  No recolorear ni generar variantes del logo. Origen y regeneración de favicon/OG: sección "Logos y fotos" del README.
- **Contacto solo por WhatsApp**: el negocio no toma llamadas; no agregues enlaces `tel:` ni
  botones de llamar. El número se muestra como WhatsApp.

## Cosas fáciles de romper

- `astro.config.mjs` usa `trailingSlash: 'never'` + `build.format: 'file'` (Cloudflare sirve
  `servicios.html` en `/servicios`). Enlaces internos sin `/` final.
- `public/_headers` define la **CSP**: `connect-src 'self'`, `font-src 'self'`, `frame-src` solo
  Google Maps. Cualquier fetch del navegador a otro dominio, fuente externa o iframe nuevo
  necesita actualizarla. También define caché (HTML 5 min, `/_astro/*` inmutable).
- Presupuesto de calidad del README: Lighthouse ~100, 0 violaciones axe, <10 KB de JS, sin
  frameworks de JS. Animaciones respetan `prefers-reduced-motion`; verde `#71B637` no sirve como
  texto sobre blanco → usar `green-700`.
- Astro está fijado en 5.x a propósito; los avisos de `npm audit` aplican a SSR y no a este sitio.

## Manual de marca

El manual (`../../Branding/BRANDING-GUIDELINES.md`) define azul marino `#023F77` (`navy`) +
acento `#0A5CB5` (`primary`) y tipografía única **Nunito** (aplicados el 2026-10-26;
`font-display` es solo un alias de `font-sans`). Al cambiar un color de marca, revisa también los
hex sueltos en `Hero.astro`, `PageLayout.astro`, `Logo.astro`, `favicon.svg`, `site.webmanifest`,
y `negocio.ts` (`colorTema`), y regenera los íconos.
Pendiente: el nombre en texto debe ser **"La Reforma"** (hoy "Papelería La Reforma" en
`negocio.ts`). Redes: Facebook y el Instagram @papelareforma ya están en `negocio.redes`. Datos de referencia: `../../Datos-Negocio.md`.
