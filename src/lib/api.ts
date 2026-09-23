/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  api.ts — Capa de datos preparada para el backend del sistema interno
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Hoy el sitio es 100 % estático y se alimenta de `negocio.ts`.
 *  Cuando el sistema interno (Vercel) exponga su API, basta con definir la
 *  variable de entorno `PUBLIC_API_URL` en Cloudflare Pages: estas funciones
 *  empezarán a leer del backend y, si algo falla, volverán a `negocio.ts`
 *  para que el sitio nunca se quede sin datos.
 *
 *  Reglas de diseño:
 *   - Agnóstico al backend: solo `fetch` + JSON, sin SDKs.
 *   - Las páginas llaman a `obtener*()`; nunca a `fetch` directamente.
 *   - Toda respuesta se normaliza a los tipos de `negocio.ts`.
 */
import { negocio, type Promocion, type Servicio } from './negocio';
import type { CarritoItem, Cotizacion } from './carrito';

// ─── Configuración ───────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const apiConfig = {
  baseUrl: BASE_URL,
  /** `false` mientras no exista `PUBLIC_API_URL`. */
  habilitada: BASE_URL.length > 0,
  timeoutMs: 8000,
} as const;

export type ResultadoApi<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

export async function solicitar<T>(ruta: string, init: RequestInit = {}): Promise<ResultadoApi<T>> {
  if (!apiConfig.habilitada) return { ok: false, error: 'api-deshabilitada' };

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), apiConfig.timeoutMs);
  try {
    const respuesta = await fetch(`${apiConfig.baseUrl}${ruta}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers },
      signal: controlador.signal,
    });
    if (!respuesta.ok) return { ok: false, error: respuesta.statusText, status: respuesta.status };
    return { ok: true, data: (await respuesta.json()) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'error-desconocido' };
  } finally {
    clearTimeout(temporizador);
  }
}

// ─── Catálogo (listo para usarse) ────────────────────────────────────────────

/**
 * Servicios y precios. Con la API deshabilitada devuelve `negocio.servicios`.
 * TODO(API): ajustar la ruta y el mapeo al contrato real del sistema interno.
 */
export async function obtenerServicios(): Promise<Servicio[]> {
  const r = await solicitar<Servicio[]>('/servicios');
  return r.ok && Array.isArray(r.data) && r.data.length > 0 ? r.data : negocio.servicios;
}

/** Promociones activas. Con la API deshabilitada devuelve `negocio.promociones`. */
export async function obtenerPromociones(): Promise<Promocion[]> {
  const r = await solicitar<Promocion[]>('/promociones');
  const lista = r.ok && Array.isArray(r.data) ? r.data : negocio.promociones;
  return lista.filter((p) => p.activa);
}

// ─── Carrito / Cotizador (NO implementado todavía) ───────────────────────────

/**
 * TODO(Carrito): enviar los artículos del carrito al backend y recibir una
 * cotización con folio. Endpoint sugerido: POST /cotizaciones
 */
export async function crearCotizacion(items: CarritoItem[]): Promise<ResultadoApi<Cotizacion>> {
  return solicitar<Cotizacion>('/cotizaciones', { method: 'POST', body: JSON.stringify({ items }) });
}

/**
 * TODO(Crédito): consultar el saldo de crédito de un cliente en el sistema
 * interno. Requiere autenticación; NO llamar desde el cliente sin un token
 * de sesión emitido por el backend. Endpoint sugerido: GET /clientes/:id/credito
 */
export async function consultarCredito(
  clienteId: string,
  token: string,
): Promise<ResultadoApi<{ saldo: number; limite: number }>> {
  return solicitar(`/clientes/${encodeURIComponent(clienteId)}/credito`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
