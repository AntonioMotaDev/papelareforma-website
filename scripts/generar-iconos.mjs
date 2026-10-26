/**
 * Genera favicon.ico, apple-touch-icon.png e íconos PWA a partir de
 * public/favicon.svg (o de src/assets/logos/isotipo.png si existe).
 * Uso: node scripts/generar-iconos.mjs
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

const origen = existsSync('src/assets/logos/isotipo.png') ? 'src/assets/logos/isotipo.png' : 'public/favicon.svg';
const png = (size, pad = 0, fondo = { r: 0, g: 0, b: 0, alpha: 0 }) =>
  sharp(origen, { density: 512 })
    .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: fondo })
    .png()
    .toBuffer();

const navy = { r: 2, g: 63, b: 119, alpha: 1 };
await writeFile('public/apple-touch-icon.png', await png(180, 18, navy));
await writeFile('public/icons/icon-192.png', await png(192));
await writeFile('public/icons/icon-512.png', await png(512));
await writeFile('public/icons/icon-maskable-512.png', await png(512, 80, navy));

// favicon.ico con una imagen PNG de 32×32 (formato ICO con PNG embebido).
const ico32 = await png(32);
const cabecera = Buffer.alloc(22);
cabecera.writeUInt16LE(0, 0); // reservado
cabecera.writeUInt16LE(1, 2); // tipo: icono
cabecera.writeUInt16LE(1, 4); // nº de imágenes
cabecera.writeUInt8(32, 6); // ancho
cabecera.writeUInt8(32, 7); // alto
cabecera.writeUInt8(0, 8); // paleta
cabecera.writeUInt8(0, 9); // reservado
cabecera.writeUInt16LE(1, 10); // planos
cabecera.writeUInt16LE(32, 12); // bpp
cabecera.writeUInt32LE(ico32.length, 14); // tamaño
cabecera.writeUInt32LE(22, 18); // offset
await writeFile('public/favicon.ico', Buffer.concat([cabecera, ico32]));

console.log(`Íconos generados desde ${origen}`);
