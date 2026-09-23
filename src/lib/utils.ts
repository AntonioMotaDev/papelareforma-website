/**
 * Helpers puros (sin DOM) reutilizados en el servidor (build) y en el cliente.
 * Toda la lógica de horarios vive aquí para que la tabla, el widget
 * "¿Abierto ahora?" y los datos estructurados nunca se contradigan.
 */
import { negocio, type DiaSemana, type HorarioDia, type Precio, type Turno } from './negocio';

// ─── Formato ─────────────────────────────────────────────────────────────────

const formatoMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

/** 1.5 → "$1.50" */
export function formatearPrecio(monto: number): string {
  return formatoMoneda.format(monto);
}

/** Texto completo de un precio: "$1.50", "Desde $20.00" o "Consulta en tienda". */
export function textoPrecio(precio: Precio): string {
  if (precio.monto === null) return 'Consulta en tienda';
  const monto = formatearPrecio(precio.monto);
  return precio.desde ? `Desde ${monto}` : monto;
}

/** "09:00" → "9:00" */
export function formatearHora(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
}

export function formatearTurno(turno: Turno): string {
  return `${formatearHora(turno.abre)} – ${formatearHora(turno.cierra)}`;
}

export function formatearTurnos(turnos: Turno[]): string {
  return turnos.length === 0 ? 'Cerrado' : turnos.map(formatearTurno).join(' · ');
}

// ─── Enlaces ─────────────────────────────────────────────────────────────────

export function urlWhatsApp(mensaje: string = negocio.contacto.mensajeWhatsAppGeneral): string {
  return `https://wa.me/${negocio.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export function urlTelefono(): string {
  return `tel:${negocio.contacto.telefonoE164}`;
}

export function urlCorreo(asunto?: string): string {
  const base = `mailto:${negocio.contacto.correo}`;
  return asunto ? `${base}?subject=${encodeURIComponent(asunto)}` : base;
}

/** Dirección en una línea: "Reforma Agraria 640, Col. …, San Luis Potosí, S.L.P." */
export function direccionCompleta(): string {
  const u = negocio.ubicacion;
  const cp = u.codigoPostal ? ` C.P. ${u.codigoPostal},` : '';
  return `${u.calle}, ${u.colonia},${cp} ${u.ciudad}, ${u.estado}`;
}

/** Consulta para mapas: coordenadas si existen; si no, la dirección. */
function consultaMapa(): string {
  const c = negocio.ubicacion.coordenadas;
  return c ? `${c.lat},${c.lng}` : `${negocio.nombre}, ${direccionCompleta()}, México`;
}

export function urlGoogleMaps(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consultaMapa())}`;
}

export function urlComoLlegar(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(consultaMapa())}`;
}

/** Mapa embebible sin API key. */
export function urlMapaEmbebido(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(consultaMapa())}&z=17&hl=es&output=embed`;
}

export function urlAbsoluta(ruta: string): string {
  return new URL(ruta, negocio.sitio.url).toString();
}

// ─── Horarios ────────────────────────────────────────────────────────────────

const nombresDia: Record<DiaSemana, string> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábado',
};

export function horarioDelDia(dia: DiaSemana, horarios: HorarioDia[] = negocio.horarios): HorarioDia {
  return horarios.find((h) => h.dia === dia) ?? { dia, nombre: nombresDia[dia], turnos: [] };
}

export interface GrupoHorario {
  etiqueta: string;
  dias: DiaSemana[];
  turnos: Turno[];
}

/** Agrupa días consecutivos con el mismo horario: "Lunes a sábado", "Domingo". */
export function agruparHorarios(horarios: HorarioDia[] = negocio.horarios): GrupoHorario[] {
  const grupos: { dias: HorarioDia[]; clave: string }[] = [];
  for (const h of horarios) {
    const clave = JSON.stringify(h.turnos);
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.clave === clave) ultimo.dias.push(h);
    else grupos.push({ dias: [h], clave });
  }
  return grupos.map(({ dias }) => {
    const primero = dias[0]!;
    const ultimo = dias.at(-1)!;
    const etiqueta =
      dias.length === 1
        ? primero.nombre
        : `${primero.nombre} a ${ultimo.nombre.toLowerCase()}`;
    return { etiqueta, dias: dias.map((d) => d.dia), turnos: primero.turnos };
  });
}

/** "Lunes a sábado: 9:00 – 16:00 · 17:00 – 21:00. Domingo: 12:00 – 17:00." */
export function resumenHorarios(horarios: HorarioDia[] = negocio.horarios): string {
  return agruparHorarios(horarios)
    .map((g) => `${g.etiqueta}: ${formatearTurnos(g.turnos)}.`)
    .join(' ');
}

/** Hora actual (día y minutos) en la zona horaria del negocio, sin importar la del visitante. */
export function ahoraEnNegocio(
  fecha: Date = new Date(),
  zonaHoraria: string = negocio.ubicacion.zonaHoraria,
): { dia: DiaSemana; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dia = dias.indexOf(valor('weekday')) as DiaSemana;
  const minutos = (Number(valor('hour')) % 24) * 60 + Number(valor('minute'));
  return { dia, minutos };
}

function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
}

export type Estado = 'abierto' | 'cierra-pronto' | 'receso' | 'cerrado';

export interface EstadoApertura {
  estado: Estado;
  abierto: boolean;
  titulo: string;
  detalle: string;
}

/** Minutos antes del cierre en que se muestra "Cierra pronto". */
const AVISO_CIERRE_MIN = 30;

/**
 * Calcula si el negocio está abierto en `fecha`, usando la hora de San Luis Potosí.
 */
export function estadoApertura(
  fecha: Date = new Date(),
  horarios: HorarioDia[] = negocio.horarios,
): EstadoApertura {
  const { dia, minutos } = ahoraEnNegocio(fecha);
  const hoy = horarioDelDia(dia, horarios);

  for (const [i, turno] of hoy.turnos.entries()) {
    const abre = aMinutos(turno.abre);
    const cierra = aMinutos(turno.cierra);
    if (minutos >= abre && minutos < cierra) {
      const siguiente = hoy.turnos[i + 1];
      const accion = siguiente ? 'Receso a las' : 'Cierra a las';
      const pronto = cierra - minutos <= AVISO_CIERRE_MIN;
      return {
        estado: pronto ? 'cierra-pronto' : 'abierto',
        abierto: true,
        titulo: pronto ? (siguiente ? 'Receso en breve' : 'Cierra pronto') : 'Abierto ahora',
        detalle: `${accion} ${formatearHora(turno.cierra)}`,
      };
    }
  }

  // ¿Receso entre dos turnos de hoy?
  const anterior = hoy.turnos.findLast((t) => aMinutos(t.cierra) <= minutos);
  const proximoHoy = hoy.turnos.find((t) => aMinutos(t.abre) > minutos);
  if (anterior && proximoHoy) {
    return {
      estado: 'receso',
      abierto: false,
      titulo: 'En receso',
      detalle: `Reabrimos a las ${formatearHora(proximoHoy.abre)}`,
    };
  }
  if (proximoHoy) {
    return {
      estado: 'cerrado',
      abierto: false,
      titulo: 'Cerrado ahora',
      detalle: `Abrimos hoy a las ${formatearHora(proximoHoy.abre)}`,
    };
  }

  // Buscar el siguiente día con horario.
  for (let salto = 1; salto <= 7; salto++) {
    const siguienteDia = ((dia + salto) % 7) as DiaSemana;
    const h = horarioDelDia(siguienteDia, horarios);
    const primero = h.turnos[0];
    if (primero) {
      const cuando = salto === 1 ? 'mañana' : `el ${nombresDia[siguienteDia]}`;
      return {
        estado: 'cerrado',
        abierto: false,
        titulo: 'Cerrado ahora',
        detalle: `Abrimos ${cuando} a las ${formatearHora(primero.abre)}`,
      };
    }
  }

  return { estado: 'cerrado', abierto: false, titulo: 'Cerrado', detalle: 'Consulta nuestros horarios' };
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export function promocionesActivas() {
  return negocio.promociones.filter((p) => p.activa);
}

/** Une clases condicionales: cx('a', cond && 'b') → "a b". */
export function cx(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(' ');
}
