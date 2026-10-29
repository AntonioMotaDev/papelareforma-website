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
  | 'smartphone'
  | 'user'
  | 'file-text'
  | 'file-check';

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
  /** Sección de /productos donde aparece. */
  grupo: 'impresion' | 'tramites';
  precio: Precio;
  /** Aparece en la página de inicio. */
  destacado?: boolean;
  /** Mensaje prellenado al pulsar "Consultar" (WhatsApp). */
  mensajeWhatsApp: string;
}

export type IconoCatalogo =
  | 'backpack'
  | 'briefcase'
  | 'palette'
  | 'scissors'
  | 'gift'
  | 'package'
  | 'notebook'
  | 'pen'
  | 'highlighter'
  | 'sticky-note';

/**
 * Categoría o producto del catálogo. La foto se toma de `src/assets/images/<id>.jpg`
 * (o .png/.webp) si existe; si no, se muestra un relleno de marca con el ícono.
 */
export interface ArticuloCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: IconoCatalogo;
  mensajeWhatsApp: string;
}

/** Grupo de "Y mucho más" en /productos: productos sin foto, como lista de texto. */
export interface GrupoProductos {
  id: string;
  nombre: string;
  icono: 'gift' | 'shopping-bag' | 'sparkles' | 'headphones' | 'candy' | 'book-open' | 'calendar' | 'scissors';
  articulos: string[];
}

export type IconoNivel = 'palette' | 'backpack' | 'notebook' | 'graduation-cap';

export interface NivelEscolar {
  id: string;
  nombre: string;
  descripcion: string;
  icono: IconoNivel;
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

/** Reseña copiada tal cual del perfil de Google (sin editar el texto). */
export interface Resena {
  autor: string;
  /** De 1 a 5. */
  estrellas: number;
  texto: string;
  /**
   * Año aproximado. Google muestra fechas relativas ("Hace 3 meses") que en un
   * sitio estático se vuelven falsas con el tiempo; el año no.
   */
  fecha: string;
  /** Si Google le muestra la insignia de Local Guide. */
  guiaLocal?: boolean;
  /** Enlace a la reseña en Google Maps. */
  url: string;
}

// ─── Datos ───────────────────────────────────────────────────────────────────

const turnoCorrido: Turno = { abre: '09:00', cierra: '21:00' };
const anioFundacion = 2005;

export const negocio = {
  nombre: 'Papelería La Reforma',
  nombreCorto: 'La Reforma',
  eslogan: 'Tu papelería de confianza en San Luis Potosí',

  experiencia: {
    anioFundacion,
    /** Años completos seguros (se muestra como "Más de N años"); se recalcula en cada build. */
    anios: new Date().getFullYear() - anioFundacion - 1,
  },

  /**
   * Reseñas de Google: datos fijos, sin widgets ni APIs externas. Actualizar a mano
   * la calificación y el total de vez en cuando desde el perfil de Google Business.
   */
  resenas: {
    calificacion: 4.9,
    total: 44,
    urlPerfil: 'https://maps.app.goo.gl/Y8M3JQ3N5UcLM5818',
    // Copiadas tal cual del perfil (2026-10-29), sin corregir el texto. Fechas tomadas de
    // "Hace N meses/años" a esa fecha. Si la lista queda vacía, la sección muestra solo la calificación.
    destacadas: [
      {
        autor: 'Samuel Galicia Ortiz',
        estrellas: 5,
        texto:
          'Excelente servicio, son muy amables, está muy bien surtida y son muy rápidos. Definitivamente la mejor papelería de San Luis!!',
        fecha: '2026',
        url: 'https://maps.app.goo.gl/eEoCzLojXfkY8xT18',
      },
      {
        autor: 'Mar',
        estrellas: 5,
        texto:
          'papelería super completa, no solo hay productos de papelería,hay regalos, impresiones,mercería, bebidas,chucherías, maquillajes etc, si buscas algo puedes preguntar y las posibilidades de que tengan son muchas. También hay pago con tarjeta,y tener horario establecido super bien.',
        fecha: '2025',
        guiaLocal: true,
        url: 'https://maps.app.goo.gl/jfiXNYNyH4SsNGwr7',
      },
      {
        autor: 'Hector Davila',
        estrellas: 5,
        texto:
          'Sus precios son adecuados, incluso más económicos que la competencia cercana. Personal muy amable y paciente. Muy buen surtido',
        fecha: '2021',
        guiaLocal: true,
        url: 'https://maps.app.goo.gl/TEkbDrXD69odteMb6',
      },
      {
        autor: 'Lizeth Navarro',
        estrellas: 5,
        texto: 'Trato muy agradable, encuentras de todo en cada temporada.',
        fecha: '2025',
        guiaLocal: true,
        url: 'https://maps.app.goo.gl/qHKRAPfxNdYbMNQe8',
      },
      {
        autor: 'nanita bernal',
        estrellas: 5,
        texto:
          'Siempre encuentras lo q buscas, los empleados son muy amables y tienen muy amplio surtido en regalos y novedades',
        fecha: '2024',
        url: 'https://maps.app.goo.gl/AcH61JiKR9KPubZY6',
      },
      {
        autor: 'Elizaberh Banda',
        estrellas: 5,
        texto: 'Muy buen lugar con un amplio surtido en todo referente a productos escolares y de oficina',
        fecha: '2026',
        url: 'https://maps.app.goo.gl/cEqYyPzGqsKAGmTD9',
      },
      {
        autor: 'Lara Vega',
        estrellas: 5,
        texto: 'Muy surtida y muy rápido el servicio',
        fecha: '2026',
        guiaLocal: true,
        url: 'https://maps.app.goo.gl/5bAa6JgnTxQsiNF57',
      },
    ] satisfies Resena[] as Resena[],
  },

  contacto: {
    /** Formato para mostrar. */
    telefono: '444 450 5433',
    /** Formato E.164 para enlaces `tel:` y datos estructurados. */
    telefonoE164: '+524444505433',
    /** Número internacional sin "+" para enlaces wa.me. */
    whatsapp: '524444505433',
    correo: 'pape.lareforma1@gmail.com',
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
    codigoPostal: '78398' as string | null,
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
      grupo: 'impresion',
      precio: { monto: 1.5, desde: true, unidad: 'por hoja', nota: 'El precio baja en volumen. Color: consulta en tienda' },
      destacado: true,
      mensajeWhatsApp: 'Hola, quiero cotizar fotocopias.',
    },
    {
      id: 'impresion',
      nombre: 'Impresión digital',
      descripcion: 'Imprime tareas, documentos y trabajos a color o en blanco y negro.',
      icono: 'printer',
      grupo: 'impresion',
      precio: { monto: 1.5, desde: true, unidad: 'por hoja', nota: 'El precio baja en volumen' },
      destacado: true,
      mensajeWhatsApp: 'Hola, quiero cotizar una impresión.',
    },
    {
      id: 'encuadernacion',
      nombre: 'Encuadernación',
      alias: 'Engargolado',
      descripcion: 'Engargolado para tesis, reportes, manuales y presentaciones.',
      icono: 'notebook',
      grupo: 'impresion',
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
      grupo: 'impresion',
      precio: { monto: 10, desde: true },
      destacado: true,
      mensajeWhatsApp: 'Hola, quiero cotizar un enmicado.',
    },
    {
      id: 'curp',
      nombre: 'CURP',
      descripcion: 'La consultamos e imprimimos al momento, lista para tu trámite.',
      icono: 'user',
      grupo: 'tramites',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, quiero sacar mi CURP impresa.',
    },
    {
      id: 'acta-nacimiento',
      nombre: 'Acta de nacimiento',
      descripcion: 'Te ayudamos a sacar e imprimir tu acta de nacimiento.',
      icono: 'file-text',
      grupo: 'tramites',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, quiero sacar mi acta de nacimiento. ¿Qué necesito?',
    },
    {
      id: 'constancia-no-derechohabiencia',
      nombre: 'Constancia de no derechohabiencia',
      descripcion: 'La sacamos e imprimimos por ti, sin complicaciones.',
      icono: 'file-check',
      grupo: 'tramites',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, quiero sacar mi constancia de no derechohabiencia. ¿Qué necesito?',
    },
    {
      id: 'pago-servicios',
      nombre: 'Pago de servicios',
      descripcion: 'Paga tus recibos en un solo lugar, cerca de casa y sin filas largas.',
      icono: 'receipt',
      grupo: 'tramites',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, ¿qué servicios puedo pagar con ustedes?',
    },
    {
      id: 'envoltorio',
      nombre: 'Envoltorio de regalos',
      descripcion: 'Envolvemos tus regalos con cuidado para cualquier ocasión.',
      icono: 'gift',
      grupo: 'tramites',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, quiero información sobre envoltura de regalos.',
    },
    {
      id: 'recargas',
      nombre: 'Recarga de tiempo aire',
      descripcion: 'Recarga saldo a tu celular en segundos mientras haces tus compras.',
      icono: 'smartphone',
      grupo: 'tramites',
      precio: { monto: null },
      mensajeWhatsApp: 'Hola, quiero información sobre recargas de tiempo aire.',
    },
  ] satisfies Servicio[] as Servicio[],

  // TODO(Datos): confirmar que las descripciones reflejan lo que de verdad se vende.
  categorias: [
    {
      id: 'utiles-escolares',
      nombre: 'Útiles escolares',
      descripcion: 'Cuadernos, lápices, colores, juegos de geometría y todo lo de la lista.',
      icono: 'backpack',
      mensajeWhatsApp: 'Hola, quiero consultar útiles escolares.',
    },
    {
      id: 'papeleria-oficina',
      nombre: 'Papelería y oficina',
      descripcion: 'Hojas, folders, carpetas, clips, engrapadoras y lo del archivo.',
      icono: 'briefcase',
      mensajeWhatsApp: 'Hola, quiero consultar artículos de oficina.',
    },
    {
      id: 'escritura-dibujo',
      nombre: 'Escritura y dibujo',
      descripcion: 'Plumas, marcadores, plumones, colores y blocks de dibujo.',
      icono: 'palette',
      mensajeWhatsApp: 'Hola, quiero consultar artículos de escritura y dibujo.',
    },
    {
      id: 'manualidades',
      nombre: 'Manualidades',
      descripcion: 'Foami, cartulinas, papel de colores, pegamento y tijeras.',
      icono: 'scissors',
      mensajeWhatsApp: 'Hola, quiero consultar material para manualidades.',
    },
    {
      id: 'regalos-envolturas',
      nombre: 'Regalos y envolturas',
      descripcion: 'Papel para regalo, bolsas, moños y tarjetas. Y si quieres, lo envolvemos.',
      icono: 'gift',
      mensajeWhatsApp: 'Hola, quiero consultar regalos y envolturas.',
    },
    {
      id: 'mas-productos',
      nombre: 'Más productos',
      descripcion: '¿Buscas algo que no ves aquí? Pregúntanos: si no lo tenemos, lo conseguimos.',
      icono: 'package',
      mensajeWhatsApp: 'Hola, ¿tienen…?',
    },
  ] satisfies ArticuloCatalogo[] as ArticuloCatalogo[],

  /** Lo que se vende además de papelería (sección "Y mucho más" de /productos). */
  masProductos: [
    {
      id: 'regalos',
      nombre: 'Regalos',
      icono: 'gift',
      articulos: ['Perfumes', 'Joyería', 'Velas aromáticas'],
    },
    {
      id: 'bolsas-accesorios',
      nombre: 'Bolsas y accesorios',
      icono: 'shopping-bag',
      articulos: ['Bolsas de mujer', 'Accesorios para cabello'],
    },
    {
      id: 'belleza',
      nombre: 'Belleza y cuidado personal',
      icono: 'sparkles',
      articulos: ['Maquillaje', 'Tintes para cabello', 'Productos de higiene personal'],
    },
    {
      id: 'electronica',
      nombre: 'Electrónica y pilas',
      icono: 'headphones',
      articulos: ['Cargadores', 'Audífonos', 'Bocinas', 'Pilas Duracell', 'Pilas para reloj'],
    },
    {
      id: 'dulces-bebidas',
      nombre: 'Dulces, botanas y bebidas',
      icono: 'candy',
      articulos: ['Dulces', 'Chocolates', 'Botanas', 'Refrescos'],
    },
    {
      id: 'libros-juegos',
      nombre: 'Libros y juegos',
      icono: 'book-open',
      articulos: ['Libros para colorear', 'Cuentos', 'Juegos de mesa'],
    },
    {
      id: 'temporada',
      nombre: 'De temporada',
      icono: 'calendar',
      articulos: ['Disfraces y máscaras', 'Maquillaje y adornos de Halloween', 'Ropa para el frío'],
    },
    {
      id: 'merceria',
      nombre: 'Mercería',
      icono: 'scissors',
      articulos: ['Artículos de mercería'],
    },
  ] satisfies GrupoProductos[] as GrupoProductos[],

  /** Niveles de la página /lista-escolar. */
  listaEscolar: {
    niveles: [
      {
        id: 'preescolar',
        nombre: 'Preescolar',
        descripcion: 'Cuadernos, colores, pegamento, tijeras y el material para las manualidades de clase.',
        icono: 'palette',
        mensajeWhatsApp: 'Hola, quiero surtir la lista escolar de preescolar. Les mando la foto de la lista por aquí.',
      },
      {
        id: 'primaria',
        nombre: 'Primaria',
        descripcion: 'Cuadernos, lápices, colores, juego de geometría y lo que pida tu maestro.',
        icono: 'backpack',
        mensajeWhatsApp: 'Hola, quiero surtir la lista escolar de primaria. Les mando la foto de la lista por aquí.',
      },
      {
        id: 'secundaria',
        nombre: 'Secundaria',
        descripcion: 'Cuadernos, plumas, marcatextos, juego de geometría y lo que pida cada materia.',
        icono: 'notebook',
        mensajeWhatsApp: 'Hola, quiero surtir la lista escolar de secundaria. Les mando la foto de la lista por aquí.',
      },
      {
        id: 'bachillerato-universidad',
        nombre: 'Bachillerato y universidad',
        descripcion: 'Cuadernos, plumas, folders y, si los necesitas, copias, impresiones y engargolado de tus trabajos.',
        icono: 'graduation-cap',
        mensajeWhatsApp: 'Hola, quiero surtir mi lista de útiles de bachillerato o universidad. Les mando la foto por aquí.',
      },
    ] satisfies NivelEscolar[] as NivelEscolar[],
  },

  promociones: [
    {
      id: 'listas-escolares',
      activa: false,
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

  /** El pie de página y los datos estructurados las muestran automáticamente. */
  redes: [
    {
      nombre: 'Facebook',
      url: 'https://www.facebook.com/share/18ppE6eHEb/',
      usuario: 'Papelería La Reforma',
    },
    {
      nombre: 'Instagram',
      url: 'https://www.instagram.com/papelareforma',
      usuario: '@papelareforma',
    },
  ] satisfies RedSocial[] as RedSocial[],

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
      { etiqueta: 'Productos', href: '/productos' },
      { etiqueta: 'Nosotros', href: '/nosotros' },
      { etiqueta: 'Ubicación', href: '/ubicacion' },
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
      'imprimir CURP San Luis Potosí',
      'acta de nacimiento San Luis Potosí',
      'constancia de no derechohabiencia SLP',
    ],
    hashtags: ['#PapeleríaLaReforma', '#SanLuisPotosí', '#SLP', '#PapeleríaSLP'],
    imagenOg: '/og-image.png',
  },
};

export type Negocio = typeof negocio;
