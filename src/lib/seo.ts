/**
 * Datos estructurados (JSON-LD) generados 100 % desde negocio.ts.
 * Validar en https://search.google.com/test/rich-results
 */
import { negocio, type DiaSemana } from './negocio';
import { urlAbsoluta, urlGoogleMaps } from './utils';

const diasSchema: Record<DiaSemana, string> = {
  0: 'https://schema.org/Sunday',
  1: 'https://schema.org/Monday',
  2: 'https://schema.org/Tuesday',
  3: 'https://schema.org/Wednesday',
  4: 'https://schema.org/Thursday',
  5: 'https://schema.org/Friday',
  6: 'https://schema.org/Saturday',
};

/** Agrupa por turno idéntico: un OpeningHoursSpecification por franja. */
function horariosSchema() {
  const porTurno = new Map<string, { opens: string; closes: string; dias: string[] }>();
  for (const h of negocio.horarios) {
    for (const t of h.turnos) {
      const clave = `${t.abre}-${t.cierra}`;
      const actual = porTurno.get(clave) ?? { opens: t.abre, closes: t.cierra, dias: [] };
      actual.dias.push(diasSchema[h.dia]);
      porTurno.set(clave, actual);
    }
  }
  return [...porTurno.values()].map((t) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: t.dias,
    opens: t.opens,
    closes: t.closes,
  }));
}

export function jsonLdNegocio() {
  const { contacto, ubicacion, pagos } = negocio;
  const id = `${negocio.sitio.url}/#negocio`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': id,
    name: negocio.nombre,
    description: negocio.seo.descripcionPorDefecto,
    slogan: negocio.eslogan,
    url: negocio.sitio.url,
    image: urlAbsoluta(negocio.seo.imagenOg),
    logo: urlAbsoluta('/favicon.svg'),
    telephone: contacto.telefonoE164,
    email: contacto.correo,
    priceRange: '$',
    currenciesAccepted: pagos.moneda,
    paymentAccepted: pagos.metodos.map((m) => m.nombre).join(', '),
    hasMap: urlGoogleMaps(),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${ubicacion.calle}, ${ubicacion.colonia}`,
      addressLocality: ubicacion.ciudad,
      addressRegion: ubicacion.estadoCompleto,
      addressCountry: ubicacion.pais,
      ...(ubicacion.codigoPostal ? { postalCode: ubicacion.codigoPostal } : {}),
    },
    ...(ubicacion.coordenadas
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: ubicacion.coordenadas.lat,
            longitude: ubicacion.coordenadas.lng,
          },
        }
      : {}),
    areaServed: { '@type': 'City', name: `${ubicacion.ciudad}, ${ubicacion.estado}` },
    openingHoursSpecification: horariosSchema(),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios',
      itemListElement: negocio.servicios.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.nombre, description: s.descripcion },
        ...(s.precio.monto !== null
          ? {
              priceSpecification: {
                '@type': 'PriceSpecification',
                priceCurrency: pagos.moneda,
                ...(s.precio.desde ? { minPrice: s.precio.monto } : { price: s.precio.monto }),
              },
            }
          : {}),
      })),
    },
    ...(negocio.redes.length > 0 ? { sameAs: negocio.redes.map((r) => r.url) } : {}),
    keywords: negocio.seo.palabrasClave.join(', '),
  };
}

export interface Miga {
  nombre: string;
  href: string;
}

export function jsonLdMigas(migas: Miga[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.nombre,
      item: urlAbsoluta(m.href),
    })),
  };
}
