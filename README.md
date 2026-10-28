# Papelería La Reforma — Sitio web

Sitio oficial de **Papelería La Reforma**, Reforma Agraria 640, Col. Nuestra Señora de la Salud, San Luis Potosí, S.L.P.

- **Stack:** Astro 5 + Vite · Tailwind CSS v4 (plugin de Vite) · TypeScript estricto
- **Hosting:** Cloudflare Pages (sitio 100 % estático; el contacto es por WhatsApp)
- **CI/CD:** GitHub → Cloudflare Pages (despliegue automático en cada push a `main`)
- **Lighthouse (móvil, local):** Rendimiento 99 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100

---

## Inicio rápido

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # genera dist/
npm run preview      # sirve dist/ localmente
npm run check        # verificación de tipos (Astro)
npm run pages:dev    # build + entorno Cloudflare local (aplica _headers) en :8788
```

Requiere Node 18.20.8 o superior (el proyecto fija Node 22 en `.node-version`).

---

## ✏️ Cómo actualizar datos del negocio

**Todo** vive en [`src/lib/negocio.ts`](src/lib/negocio.ts): la única fuente de verdad. Los componentes solo leen de ahí.

| Quiero cambiar…            | Edita en `negocio.ts`                      |
| -------------------------- | ------------------------------------------ |
| Teléfono / WhatsApp / correo | `contacto`                               |
| Dirección, C.P., coordenadas | `ubicacion`                              |
| Horarios                   | `horarios` (varios `turnos` en un día = hay receso) |
| Servicios y precios        | `servicios` (`precio.monto: null` = "Consulta en tienda") |
| Categorías y destacados    | `categorias`, `productosDestacados` (fotos: ver "Fotos") |
| Promociones                | `promociones` (`activa: false` para ocultarla) |
| Formas de pago             | `pagos.metodos`                            |
| Redes sociales             | `redes` (aparecen solas en el pie de página y en el JSON-LD) |
| Reseñas de Google          | `resenas` (calificación, total y reseñas fijas copiadas a mano del perfil) |
| Año de fundación           | `experiencia.anioFundacion` ("Más de N años" se calcula en cada build) |
| Títulos y descripciones SEO | `seo`                                     |
| Menú de navegación         | `sitio.navegacion`                         |
| Calculadora de cotización  | `cotizador` (renglones; el precio sale de `servicios`) |
| Niveles de la lista escolar | `listaEscolar.niveles`                    |

Después: `git commit` + `git push` a `main` y Cloudflare publica el cambio en ~1 minuto.

La tabla de horarios, el widget **"¿Abierto ahora?"**, el pie de página, los metadatos y los datos estructurados se generan de esos mismos datos, así que nunca se contradicen. El widget siempre usa la hora de San Luis Potosí (`America/Mexico_City`), no la del visitante.

### Datos pendientes de confirmar

Busca `TODO(Datos)` en el código:

- [x] Correo: `pape.lareforma1@gmail.com`
- [x] Código postal: 78398
- [x] Redes: Facebook e Instagram
- [ ] Coordenadas exactas del local (opcional; el mapa usa la dirección mientras tanto)
- [x] Año de fundación: 2005
- [ ] Historia real (página *Nosotros*)
- [ ] 3 o 4 reseñas reales para `resenas.destacadas` (hoy solo se muestra la calificación)
- [x] Dominio: `lapapeslp.com` (`sitio.url` en `negocio.ts` y la variable `SITE_URL`)

### Logos y fotos

Los archivos de marca salen de `PAPE/Branding/Oficial/`:

| Archivo | Origen | Se usa en |
| --- | --- | --- |
| `src/assets/logos/logo-horizontal.png` | `Logo_Horizontal_Bco_SinFondo.png` recortado, a color, tal cual | Header (blanco) y footer (sobre recuadro blanco) |
| `src/assets/logos/isotipo.png` | Ícono circular azul marino (1080×1080) | Fuente de `node scripts/generar-iconos.mjs` → favicon.ico, apple-touch-icon, íconos PWA |
| `public/favicon.svg` | `isotipo_Vector.svg` sin fondo y recortado | Isotipo decorativo en `CtaBand`; ya no es el favicon |
| `public/og-image.png` | `Logo_Horizontal_Bco_SinFondo.png` sobre blanco, 1200×630 | Imagen al compartir en redes |

### Fotos

Cada espacio de foto (`src/components/Foto.astro`) busca `src/assets/images/<nombre>.jpg` (o `.png`/`.webp`). Si el archivo existe, se publica optimizado; si no, se ve un relleno de colores de marca con un ícono. Solo hay que copiar la foto con el nombre exacto y publicar.

| Archivo | Dónde sale | Formato sugerido |
| --- | --- | --- |
| `hero.jpg` | Portada de inicio | Horizontal 4:3, mín. 1600 px |
| `utiles-escolares.jpg`, `papeleria-oficina.jpg`, `escritura-dibujo.jpg`, `manualidades.jpg`, `regalos-envolturas.jpg`, `mas-productos.jpg` | Tarjetas de categoría (inicio y Productos) | Horizontal 16:9, mín. 1200 px |
| `cuaderno-profesional.jpg`, `boligrafos-colores.jpg`, `marcadores-escolares.jpg`, `notas-adhesivas.jpg` | Productos destacados | Cuadrada, mín. 800 px, fondo claro |
| `equipo.jpg` | Nosotros | Horizontal 4:3, mín. 1200 px |

Los nombres son el `id` de cada categoría y producto en `negocio.ts` (`categorias`, `productosDestacados`): si agregas uno, su foto lleva su `id`.

---

## Estructura

```
├── public/
│   ├── _headers                # caché + cabeceras de seguridad (Cloudflare)
│   ├── favicon.svg / .ico, apple-touch-icon.png, icons/, site.webmanifest
│   └── og-image.png            # imagen para compartir en redes
├── scripts/generar-iconos.mjs
├── src/
│   ├── assets/{logos,images}/  # logos y fotos optimizados por Astro
│   ├── components/             # Header, Footer, Hero, ServiceCard, MapEmbed,
│   │                           # OpenStatus, ScheduleTable, PromoBanner, CopyAddress, Icon…
│   ├── layouts/                # BaseLayout (SEO, JSON-LD) y PageLayout (páginas internas + migas)
│   ├── lib/
│   │   ├── negocio.ts          # ⭐ fuente única de verdad
│   │   ├── utils.ts            # formato, enlaces, lógica de horarios
│   │   ├── seo.ts              # JSON-LD (Store, BreadcrumbList)
│   │   ├── api.ts              # capa para el backend futuro (Vercel)
│   │   └── carrito.ts          # scaffolding del carrito (tipos + TODO)
│   ├── pages/                  # index, servicios, ubicacion, contacto, nosotros, 404, robots.txt
│   └── styles/global.css       # Tailwind v4 + tema de marca (@theme)
└── astro.config.mjs
```

> **Tailwind v4:** no hay `tailwind.config.js`; el tema (colores, fuentes, breakpoints `sm 640 · lg 1024 · xl 1280`, sombras) se define con `@theme` en `src/styles/global.css`.

### Paleta

| Token        | Hex       | Uso                                     |
| ------------ | --------- | --------------------------------------- |
| `navy`       | `#023F77` | Primario, fondos de marca, títulos      |
| `primary`    | `#0A5CB5` | Enlaces, acentos, hover                 |
| `yellow`     | `#FEC513` | CTA principal, énfasis                  |
| `green`      | `#71B637` | Acentos decorativos e íconos            |
| `green-700`  | `#3F7A1C` | Verde para texto o botones con texto blanco (contraste AA) |
| `gray-*`     | `#F3F4F6` `#E5E7EB` `#9CA3AF` `#6B7280` `#374151` | Neutros |

El verde de marca `#71B637` no alcanza contraste AA como texto sobre blanco, por eso se usa `green-700` cuando lleva texto.

---

## 🚀 Despliegue en Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → elige este repo.
2. Configuración de build:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Production branch:** `main`
   - Node: se toma de `.node-version` (22). También puedes fijar la variable `NODE_VERSION=22`.
3. **Variables y secretos** (Settings → Variables and Secrets):

   | Variable            | Tipo    | Para qué                                                    |
   | ------------------- | ------- | ----------------------------------------------------------- |
   | `SITE_URL`          | texto   | Dominio público (canonical, sitemap, OG). Ej. `https://lapapeslp.com` |
   | `PUBLIC_API_URL`    | texto   | (Futuro) URL del backend del sistema interno                |

4. Guarda y despliega. Cada push a `main` publica producción; cada PR genera una URL de vista previa.
5. **Dominio propio:** Custom domains → agrega `lapapeslp.com` (y `www.lapapeslp.com`).

Además, GitHub Actions (`.github/workflows/ci.yml`) verifica tipos y build en cada push y PR.

### Caché y seguridad (`public/_headers`)

- HTML: `max-age=300` (5 min)
- `/_astro/*` (con hash): 1 año, `immutable`
- Íconos, favicon, imagen OG: 1 mes
- HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP
- Minificación: Astro ya entrega HTML/CSS/JS minificados. El CSS crítico va en línea (`inlineStylesheets: 'always'`).

---

## 🔮 Escalabilidad: carrito y sistema interno

Busca `TODO(Carrito)`, `TODO(API)` y `TODO(Crédito)`.

- **`src/lib/api.ts`:** capa agnóstica al backend. `obtenerServicios()` y `obtenerPromociones()` ya se usan en las páginas. Con `PUBLIC_API_URL` vacía devuelven `negocio.ts`, y con la variable definida leen del backend, con `negocio.ts` como respaldo ante fallos. También incluye `crearCotizacion()` y `consultarCredito()` como puntos de extensión.
- **`src/lib/carrito.ts`:** tipos (`CarritoItem`, `Cotizacion`) y los pasos para activar el store con **Nanostores** (menos de 1 KB, compatible con islas de Astro).
- **UI:** el botón de carrito está comentado en `Header.astro` y hay un punto para "Agregar a cotización" en `ServiceCard.astro`.
- Para páginas dinámicas (checkout, cuenta de crédito) agrega el adaptador `@astrojs/cloudflare` y marca solo esas rutas con `export const prerender = false`.

---

## ✅ Calidad

- **Accesibilidad (WCAG 2.1 AA):** 0 violaciones de axe-core en todas las páginas (móvil y escritorio). Incluye enlace "Saltar al contenido", foco visible, menú operable con teclado (Esc cierra), `aria-current`, `prefers-reduced-motion` y textos alternativos.
- **Animaciones:** aparición al hacer scroll (IntersectionObserver, solo con JS activo) y parallax ligero con *scroll-driven animations* de CSS, sin JavaScript. Los navegadores sin soporte muestran la versión estática.
- **SEO local:** meta y Open Graph por página, JSON-LD `Store` con horarios y catálogo, `BreadcrumbList`, `sitemap-index.xml`, `robots.txt` y `geo.region = MX-SLP`.
- **Rendimiento:** fuente autoalojada (Nunito variable, la del manual de marca) con `preload` y métricas de respaldo (sin CLS), cero frameworks de JS (menos de 10 KB de JS en total) y mapa en diferido.

### Nota sobre versiones

El proyecto usa **Astro 5.x** por requisito. `npm audit` reporta avisos de Astro que solo se corrigen en Astro 7. Casi todos afectan a SSR, islas de servidor, `define:vars` o transiciones de vista, y este sitio es estático y no usa ninguno. `sharp` está forzado a la versión corregida mediante `overrides`. Conviene planear la migración a Astro 7 al activar SSR para el carrito.
