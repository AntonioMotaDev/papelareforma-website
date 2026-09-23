/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** URL base del backend del sistema interno (Vercel). Vacío = usar negocio.ts. */
  readonly PUBLIC_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
