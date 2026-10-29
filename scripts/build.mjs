import { cp, mkdir, copyFile } from 'node:fs/promises';

// Only website files are published. Notes and credentials are never public assets.
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'guia.html', 'guia-miami.pdf', 'reunion.html', 'reservar.html', 'pago-resultado.html',
  'checkout.html', 'gracias.html', 'pago-confirmado.html', 'pago-pendiente.html', 'pago-cancelado.html']) {
  await copyFile(file, `dist/${file}`);
}
await cp('public', 'dist/public', { recursive: true });
