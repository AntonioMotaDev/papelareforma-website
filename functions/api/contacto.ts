/**
 * Cloudflare Pages Function — POST /api/contacto
 *
 * Recibe el formulario de contacto y lo envía por correo con Resend
 * (https://resend.com, plan gratuito suficiente). Configurar en
 * Cloudflare Pages → Settings → Variables and Secrets:
 *
 *   RESEND_API_KEY      (secreto)  API key de Resend
 *   CONTACTO_DESTINO               correo que recibe los mensajes
 *   CONTACTO_REMITENTE             remitente verificado en Resend, ej. "Sitio web <sitio@papeleriareforma.mx>"
 *
 * Sin RESEND_API_KEY responde 503 y el sitio ofrece WhatsApp como respaldo.
 * Responde JSON a `fetch` y HTML simple a envíos sin JavaScript.
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACTO_DESTINO?: string;
  CONTACTO_REMITENTE?: string;
}

interface Datos {
  nombre: string;
  correo: string;
  telefono: string;
  mensaje: string;
  empresa: string;
}

const LIMITES = { nombre: 80, correo: 120, telefono: 20, mensaje: 2000 } as const;
const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const quiereJson = (request.headers.get('Accept') ?? '').includes('application/json');

  // Protección básica: solo aceptar envíos desde el propio sitio.
  const origen = request.headers.get('Origin');
  if (origen && new URL(origen).host !== new URL(request.url).host) {
    return responder(quiereJson, 403, false, 'Origen no permitido.');
  }

  let datos: Datos;
  try {
    datos = await leerDatos(request);
  } catch {
    return responder(quiereJson, 400, false, 'No pudimos leer el formulario.');
  }

  // Honeypot: si un bot llenó el campo oculto, fingimos éxito.
  if (datos.empresa) return responder(quiereJson, 200, true);

  const error = validar(datos);
  if (error) return responder(quiereJson, 422, false, error);

  if (!env.RESEND_API_KEY || !env.CONTACTO_DESTINO) {
    return responder(quiereJson, 503, false, 'El envío por correo no está configurado.');
  }

  const asunto = `Nuevo mensaje del sitio web — ${datos.nombre}`;
  const texto = [
    `Nombre: ${datos.nombre}`,
    `Correo: ${datos.correo}`,
    `Teléfono: ${datos.telefono || '—'}`,
    '',
    datos.mensaje,
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;color:#374151;line-height:1.6">
      <h2 style="color:#023F76;margin:0 0 16px">Nuevo mensaje desde el sitio web</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 16px 4px 0;color:#6B7280">Nombre</td><td><strong>${escapar(datos.nombre)}</strong></td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:#6B7280">Correo</td><td><a href="mailto:${escapar(datos.correo)}">${escapar(datos.correo)}</a></td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:#6B7280">Teléfono</td><td>${escapar(datos.telefono || '—')}</td></tr>
      </table>
      <p style="margin-top:20px;padding:16px;background:#F3F4F6;border-radius:12px;white-space:pre-wrap">${escapar(datos.mensaje)}</p>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACTO_REMITENTE ?? 'Sitio web <onboarding@resend.dev>',
        to: env.CONTACTO_DESTINO.split(',').map((c) => c.trim()),
        reply_to: datos.correo,
        subject: asunto,
        text: texto,
        html,
      }),
    });
    if (!r.ok) {
      console.error('Resend respondió', r.status, await r.text());
      return responder(quiereJson, 502, false, 'No pudimos enviar tu mensaje.');
    }
  } catch (e) {
    console.error('Error al contactar Resend', e);
    return responder(quiereJson, 502, false, 'No pudimos enviar tu mensaje.');
  }

  return responder(quiereJson, 200, true);
};

export const onRequest: PagesFunction<Env> = async () =>
  new Response('Método no permitido', { status: 405, headers: { Allow: 'POST' } });

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function leerDatos(request: Request): Promise<Datos> {
  const tipo = request.headers.get('Content-Type') ?? '';
  const crudo: Record<string, unknown> = tipo.includes('application/json')
    ? await request.json()
    : Object.fromEntries(await request.formData());
  const campo = (k: keyof Datos) => (typeof crudo[k] === 'string' ? (crudo[k] as string).trim() : '');
  return {
    nombre: campo('nombre'),
    correo: campo('correo'),
    telefono: campo('telefono'),
    mensaje: campo('mensaje'),
    empresa: campo('empresa'),
  };
}

function validar(d: Datos): string | null {
  if (d.nombre.length < 2) return 'Escribe tu nombre.';
  if (!CORREO_RE.test(d.correo)) return 'Escribe un correo válido.';
  if (d.telefono && !/^[0-9+()\s-]{10,20}$/.test(d.telefono)) return 'Escribe un teléfono válido.';
  if (d.mensaje.length < 10) return 'Tu mensaje es muy corto.';
  for (const [k, max] of Object.entries(LIMITES)) {
    if (d[k as keyof typeof LIMITES].length > max) return 'Uno de los campos es demasiado largo.';
  }
  return null;
}

function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function responder(json: boolean, status: number, ok: boolean, error?: string): Response {
  if (json) {
    return Response.json(ok ? { ok } : { ok, error }, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  // Respaldo sin JavaScript: página mínima con enlace de regreso.
  const titulo = ok ? '¡Mensaje enviado!' : 'No pudimos enviar tu mensaje';
  const cuerpo = ok
    ? 'Gracias por escribirnos. Te responderemos lo antes posible en horario de atención.'
    : `${escapar(error ?? '')} Puedes escribirnos por WhatsApp o llamarnos.`;
  const html = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${titulo} | Papelería La Reforma</title></head>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#F3F4F6;color:#374151">
<main style="max-width:28rem;padding:2.5rem;background:#fff;border-radius:1.5rem;text-align:center">
<h1 style="color:#023F76">${titulo}</h1><p>${cuerpo}</p>
<p><a href="/contacto" style="color:#0051A3;font-weight:600">Volver al sitio</a></p></main></body></html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
