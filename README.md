# Fer · Miami desde adentro

## Enlaces

- Guía para compartir: https://fernanda-miami.vercel.app/guia
- PDF (se conserva el enlace anterior): https://fernanda-miami.vercel.app/guia-miami.pdf
- Encuentro privado: https://fernanda-miami.vercel.app/reunion
- Código: https://github.com/Cremaschis/ferxmiami
- Administración del sitio: https://vercel.com/cremaschis-projects/fernanda-miami

## Actualizar la guía

Reemplazar `guia-miami.pdf` por el PDF nuevo manteniendo ese nombre. Guardar el
cambio en la rama `main` de GitHub y verificar el despliegue de Vercel. Los enlaces
de las campañas y la página `/guia` siguen apuntando al mismo archivo.

El PDF publicado en esta actualización corresponde al original
`ebook-fer-fotos-corregidas.pdf` suministrado el 28 de octubre de 2026; no se
modificaron sus páginas. El encuentro se anuncia con la duración de 60 minutos
indicada en esa guía.

## Desarrollo y publicación

`npm run build` prepara `dist/` únicamente con las páginas, el PDF y las fotos.
Las notas internas y los archivos de credenciales no son recursos públicos.
Vercel publica `dist/` y las funciones de `api/`.

## Pendiente para reactivar pagos y reservas

Se mantienen como objetivo Mercado Pago en ARS y tarjeta/PayPal en USD.
No se han comprobado cobros ni reservas reales en esta recuperación.

- Revocar y reemplazar las credenciales antiguas de Mercado Pago y MailerLite:
  aparecían en este repositorio público. Retirarlas del código actual no invalida
  las copias del historial. No reutilizar esas credenciales.
- Guardar el nuevo token de Mercado Pago únicamente como
  `MERCADOPAGO_ACCESS_TOKEN` en las variables de entorno de Vercel.
- Revisar los eventos activos de Calendly, su duración, disponibilidad y cobro
  en USD desde la cuenta de Fer.
- Revisar n8n y MailerLite: las notas históricas registraban una prueba de n8n
  vencida. El estado actual de esas cuentas aún no está confirmado.
- Validar el pago en el servidor antes de habilitar una reserva; la página
  antigua `pago-confirmado` solo consulta parámetros del navegador y requiere
  sustitución antes de reactivar el circuito de Mercado Pago.
- Probar el circuito completo en modo de prueba antes de aceptar pagos.

La guía tiene descarga directa independiente de estas integraciones. El
formulario ya no confirma un envío por email si el servicio devuelve un error.

## Prueba de pago y acceso al café

- Página de selección y compra: `/reservar`.
- Todos los CTA del café en la portada y la guía llevan a esa página.
- Los enlaces históricos `/reunion` y `/checkout` redirigen a `/reservar`.
- Mercado Pago usa `https://mpago.la/1uxfiyH`, con un cobro real de prueba de ARS 59 autorizado por el propietario. El importe comercial futuro es ARS 59.000; deben actualizarse tanto el enlace de Mercado Pago como el precio de la web antes de vender.
- PayPal permanece deshabilitado hasta configurar el cobro con Cal.com.
- Esta prueba no confirma una cita ni habilita automáticamente una reserva. No hay integración nueva con n8n.
- La tipografía del sitio usa Trebuchet MS con Segoe UI como alternativa; ya no carga fuentes de Google.
