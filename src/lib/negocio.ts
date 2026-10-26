/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  negocio.ts — FUENTE ÚNICA DE VERDAD del sitio de Papelería La Reforma
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Todo dato de negocio (contacto, ubicación, horarios, servicios, precios,
 *  promociones, pagos, redes y SEO) vive AQUÍ. Los componentes y páginas solo
 *  consumen este objeto: nunca escribas un teléfono, precio u horario "a mano"
 *  dentro de un componente.
 *
 *  ¿Cambió un precio o un horario? Edita este archivo, haz commit y push a
 *  `main`: Cloudflare Pages vuelve a publicar el sitio automáticamente.
 *
 *  Busca "TODO(Datos)" para ver los datos pendientes de confirmar.
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

/** 0 = domingo, 1 = lunes, … 6 = sábado (igual que `Date#getDay()`). */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Horas en formato 24 h "HH:MM", en la zona horaria del negocio. */
export interface Turno {
  abre: string;
  cierra: string;
}

export interface HorarioDia {
  dia: DiaSemana;
  nombre: string;
  /** Lista vacía = cerrado ese día. Varios turnos = hay receso entre ellos. */
  turnos: Turno[];
}

export type IconoServicio =
  | 'copy'
  | 'printer'
  | 'notebook'
  | 'id-card'
  | 'receipt'
  | 'gift'
  | 'smartphone';

export interface Precio {
  /** `null` = "Consulta en tienda". */
  monto: number | null;
  /** Muestra "desde" antes del monto. */
  desde?: boolean;
  /** Ej. "por hoja", "por juego". */
  unidad?: string;
  /** Aclaración corta bajo el precio. */
  nota?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  /** Nombre coloquial usado en SLP (engargolado, enmicado…). */
  alias?: string;
  descripcion: string;
  icono: IconoServicio;
  precio: Precio;
  /** Aparece en la página de inicio. */
  destacado?: boolean;
  /** Mensaje prellenado al pulsar "Consultar" (WhatsApp). */
  mensajeWhatsApp: string;
}

export interface Promocion {
  id: string;
  activa: boolean;
  titulo: string;
  /** Porcentaje de descuento (10 = 10 %). */
  descuento: number;
  descripcion: string;
  vigencia: string;
  condiciones: string[];
  mensajeWhatsApp: string;
}

export type IconoPago = 'banknote' | 'credit-card' | 'arrow-left-right';

export interface MetodoPago {
  id: string;
  nombre: string;
  icono: IconoPago;
  /** Compra mínima en MXN; `null` = sin mínimo. */
  minimo: number | null;
}

export interface RedSocial {
  nombre: 'Facebook' | 'Instagram' | 'TikTok';
  url: string;
  usuario: string;
}

// ─── Datos ───────────────────────────────────────────────────────────────────

const turnoCorrido: Turno = { abre: '09:00', cierra: '21:00' };

export const negocio = {
  nombre: 'Papelería La Reforma',
  nombreCorto: 'La Reforma',
  eslogan: 'Tu papelería de confianza en San Luis Potosí',

  experiencia: {
    /** Años operando (se muestra como "Más de 20 años"). */
    anios: 20,
    // TODO(Datos): confirmar año de fundación para mostrarlo en "Nosotros".
    anioFundacion: null as number | null,
  },

  contacto: {
    /** Formato para mostrar. */
    telefono: '444 450 5433',
    /** Formato E.164 para enlaces `tel:` y datos estructurados. */
    telefonoE164: '+524444505433',
    /** Número internacional sin "+" para enlaces wa.me. */
    whatsapp: '524444505433',
    // TODO(Datos): confirmar el correo oficial del negocio.
    correo: 'info@papeleriareforma.mx',
    mensajeWhatsAppGeneral:
      '¡Hola, Papelería La Reforma! Me gustaría pedir información / una cotización.',
  },

  ubicacion: {
    calle: 'Reforma Agraria 640',
    colonia: 'Col. Nuestra Señora de la Salud',
    ciudad: 'San Luis Potosí',
    estado: 'S.L.P.',
    estadoCompleto: 'San Luis Potosí',
    pais: 'MX',
    // TODO(Datos): agregar el código postal (p. ej. '78000').
    codigoPostal: null as string | null,
    /**
     * TODO(Datos): pegar coordenadas exactas desde Google Maps
     * (clic derecho sobre el local → copiar "lat, lng").
     * Mientras sean `null`, el mapa localiza el negocio por dirección.
     */
    coordenadas: null as { lat: number; lng: number } | null,
    /** Zona horaria IANA; San Luis Potosí no usa horario de verano desde 2022. */
    zonaHoraria: 'America/Mexico_City',
  },

  horarios: [
    { dia: 1, nombre: 'Lunes', turnos: [turnoCorrido] },
    { dia: 2, nombre: 'Martes', turnos: [turnoCorrido] },
    { dia: 3, nombre: 'Miércoles', turnos: [turnoCorrido] },
    { dia: 4, nombre: 'Jueves', turnos: [turnoCorrido] },
    { dia: 5, nombre: 'Viernes', turnos: [turnoCorrido] },
    { dia: 6, nombre: 'Sábado', turnos: [turnoCorrido] },
    { dia: 0, nombre: 'Domingo', turnos: [{ abre: '12:00', cierra: '17:00' }] },
  ] satisfies HorarioDia[] as HorarioDia[],

  servicios: [
    {
      id: 'fotocopias',
      nombre: 'Fotocopias',
      descripcion: 'Copias en blanco y negro y a color, nítidas y al momento.',
      icono: 'copy',
      precio: { monto: 1.5, unidad: 'por hoja B/N', nota: 'Color: consulta en tienda' },
      destacado: true,
      mensajeWhatsApp: 'Hola, quiero cotizar fotocopias.',
    },
    {
      id: 'impresion',
      nombre: 'Impresión digital',
      descripcion: 'Imprime tareas, documentos y trabajos a color o en blanco y negro.',
      icono: 'printer',
      precio: { monto: 3, desde: true, unidad: 'a color' },
      destacado: true,
      mensajeWhatsApp: 'Hola, quiero cotizar una impresión.',
    },
    {
      id: 'encuadernacion',
      nombre: 'Encuadernación',
      alias: 'Engargolado',
      descripcion: 'Engargolado para tesis, reportes, manuales y presentaciones.',
      icono: 'notebook',
      precio: { monto: 20, desde: true },
      destacado: true,
      mensajeWhatsApp: 'Hola, quiero cotizar un engargolado.',
    },
    {
      id: 'plastificado',
      nombre: 'Plastificado',
      alias: 'Enmicado',
      descripcion: 'Protege credenciales, actas, certificados y documentos importantes.',
      icono: 'id-card',
      precio: { monto: 10, desde: true },
      destacado: true,
      mensajeWhatsApp: 'Hola, quiero cotizar un enmicado.',
    },
    {
      id: 'pago-servicios',
      nombre: 'Pago de servicios',
      descripcion: 'Paga tus recibos en un solo lugar, cerca de casa y sin filas largas.',
      icono: 'receipt',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, ¿qué servicios puedo pagar con ustedes?',
    },
    {
      id: 'envoltorio',
      nombre: 'Envoltorio de regalos',
      descripcion: 'Envolvemos tus regalos con cuidado para cualquier ocasión.',
      icono: 'gift',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, quiero información sobre envoltura de regalos.',
    },
    {
      id: 'recargas',
      nombre: 'Recarga de tiempo aire',
      descripcion: 'Recarga saldo a tu celular en segundos mientras haces tus compras.',
      icono: 'smartphone',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, quiero información sobre recargas de tiempo aire.',
    },
  ] satisfies Servicio[] as Servicio[],

  promociones: [
    {
      id: 'listas-escolares',
      activa: true,
      titulo: 'Listas escolares completas',
      descuento: 10,
      descripcion:
        'Tráenos tu lista escolar completa y llévate un 10 % de descuento. Nosotros la surtimos por ti.',
      vigencia: 'Promoción de temporada escolar',
      condiciones: [
        'Aplica al surtir la lista escolar completa.',
        'Promoción estacional: consulta la vigencia en tienda.',
      ],
      mensajeWhatsApp:
        'Hola, quiero surtir mi lista escolar completa con el 10 % de descuento. ¿Les envío la lista por aquí?',
    },
  ] satisfies Promocion[] as Promocion[],

  pagos: {
    metodos: [
      { id: 'efectivo', nombre: 'Efectivo', icono: 'banknote', minimo: null },
      { id: 'tarjeta', nombre: 'Tarjeta de débito y crédito', icono: 'credit-card', minimo: 10 },
      { id: 'transferencia', nombre: 'Transferencia bancaria', icono: 'arrow-left-right', minimo: null },
    ] satisfies MetodoPago[] as MetodoPago[],
    moneda: 'MXN',
  },

  /**
   * TODO(Datos): agregar redes sociales cuando existan. Ejemplo:
   * { nombre: 'Facebook', url: 'https://facebook.com/papeleriareforma', usuario: '@papeleriareforma' }
   * El pie de página y los datos estructurados las muestran automáticamente.
   */
  redes: [] as RedSocial[],

  valores: [
    {
      titulo: 'Atención cercana',
      descripcion: 'Te conocemos por tu nombre. Te orientamos para que lleves exactamente lo que necesitas.',
      icono: 'heart',
    },
    {
      titulo: 'Rapidez',
      descripcion: 'Copias, impresiones y engargolados al momento, para que no pierdas tu día.',
      icono: 'zap',
    },
    {
      titulo: 'Precios justos',
      descripcion: 'Precios claros y publicados. Sin sorpresas al momento de pagar.',
      icono: 'tag',
    },
    {
      titulo: 'Compromiso local',
      descripcion: 'Somos parte de la colonia desde hace más de 20 años y crecemos con ella.',
      icono: 'store',
    },
  ] as const,

  sitio: {
    url: 'https://lapapeslp.com',
    idioma: 'es-MX',
    locale: 'es_MX',
    colorTema: '#023F77',
    navegacion: [
      { etiqueta: 'Inicio', href: '/' },
      { etiqueta: 'Servicios', href: '/servicios' },
      { etiqueta: 'Horarios y ubicación', href: '/ubicacion' },
      { etiqueta: 'Nosotros', href: '/nosotros' },
      { etiqueta: 'Contacto', href: '/contacto' },
    ],
  },

  seo: {
    tituloPorDefecto: 'Papelería La Reforma | Copias, impresiones y papelería en San Luis Potosí',
    descripcionPorDefecto:
      'Papelería en San Luis Potosí, S.L.P. Fotocopias desde $1.50, impresión, engargolado, enmicado, pago de servicios y recargas. Más de 20 años en Reforma Agraria 640.',
    palabrasClave: [
      'papelería San Luis Potosí',
      'papelería SLP',
      'copias San Luis Potosí',
      'impresiones SLP',
      'engargolado San Luis Potosí',
      'enmicado SLP',
      'listas escolares San Luis Potosí',
    ],
    hashtags: ['#PapeleríaLaReforma', '#SanLuisPotosí', '#SLP', '#PapeleríaSLP'],
    imagenOg: '/og-image.png',
  },
};

export type Negocio = typeof negocio;
