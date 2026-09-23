/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  carrito.ts — Scaffolding del carrito / cotizador (NO implementado)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  TODO(Carrito): cuando se active el ecommerce:
 *   1. `npm install nanostores @nanostores/persistent`
 *   2. Crear el store aquí, p. ej.:
 *        import { persistentMap } from '@nanostores/persistent';
 *        export const $carrito = persistentMap<Record<string, CarritoItem>>('carrito:', {});
 *   3. Descomentar el botón de carrito en `src/components/Header.astro`
 *      y los botones "Agregar" en `src/components/ServiceCard.astro`.
 *   4. Enviar la cotización con `crearCotizacion()` de `src/lib/api.ts`.
 *
 *  Nanostores funciona con islas de Astro de cualquier framework (o sin
 *  framework) y pesa < 1 KB, por eso es la opción recomendada.
 */

export interface CarritoItem {
  /** `Servicio.id` o SKU del producto en el sistema interno. */
  id: string;
  nombre: string;
  cantidad: number;
  /** Precio unitario en MXN al momento de agregarlo. */
  precioUnitario: number | null;
  notas?: string;
}

export interface Cotizacion {
  folio: string;
  items: CarritoItem[];
  subtotal: number;
  descuento: number;
  total: number;
  /** ISO 8601 */
  vigenteHasta: string;
}

/** Utilidad pura, lista para usarse desde el futuro store. */
export function calcularSubtotal(items: CarritoItem[]): number {
  return items.reduce((suma, i) => suma + (i.precioUnitario ?? 0) * i.cantidad, 0);
}
