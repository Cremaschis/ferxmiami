# Fer · Miami desde adentro

Sitio: https://fernanda-miami.vercel.app · Guía: /guia · Encuentro: /reservar

## Guía y publicación

El PDF original se sirve como `guia-miami.pdf`, con descarga directa sin formulario.
`npm run build` copia solo las páginas y recursos públicos a dist. El repositorio
está conectado a Vercel: main publica producción. Las notas y credenciales no se copian.

## Mercado Pago y Cal.com

Cada POST /api/mercadopago crea una preferencia de ARS 59.000, referencia
aleatoria y sesión firmada HttpOnly de 24 horas. Nunca acepta precios del navegador.
Al volver a /pago-resultado se consulta a Mercado Pago y se compara referencia,
moneda, importe y ausencia de devolución. Los parámetros de URL no aprueban pagos.
Si falta el payment_id, solo se buscan pagos de la referencia de la sesión firmada.

Después de aprobarse, POST /api/reservar-pago genera un enlace privado de Cal.com
con maxUsageCount: 1 para el evento 7694917, de 60 minutos. El visitante debe elegir
horario y completar Cal.com para confirmar la cita. PayPal continúa deshabilitado.
Precio activo: ARS 59.000, presentado como precio de lanzamiento. No se anuncia un precio anterior ficticio.

Variables Production (no incluir claves en Git):
- MERCADOPAGO_ACCESS_TOKEN: Secret.
- MERCADOPAGO_DYNAMIC_ENABLED: true.
- MERCADOPAGO_PRICE_ARS: 59000.
- CAL_API_KEY: Secret, debe renovarse antes de la caducidad elegida en Cal.com.
- CAL_EVENT_TYPE_ID: 7694917.
- BLOB_STORE_ID: almacén PRIVADO fer-reservas, limitado al proyecto.

El almacén conserva únicamente referencia, identificador del pago, importe y enlace
privado de reserva, sin nombre, email ni datos de tarjeta. Un claim inmutable por
compra impide que dos solicitudes simultáneas creen enlaces distintos. El resultado
se conserva aparte y se devuelve de nuevo al actualizar la página. Cal aplica el
límite de una reserva; el servidor nunca reactiva un enlace consumido.

## Recuperación y límites actuales

- No hay n8n ni webhooks nuevos. El enlace se prepara al volver a la web, no se envía
  automáticamente por email. La confirmación de cita la gestiona Cal.com.
- Volver desde el mismo navegador a /pago-resultado permite recuperar el acceso
  durante las 24 horas de la sesión. Si cambia de navegador o vence, Fer debe
  comprobar manualmente el comprobante y recuperar el enlace almacenado.
- Ante un timeout después de reclamar la compra, no se emite otro enlace a ciegas.
  El cliente recibe aviso de contactar a Fer sin repetir el pago. Revisar el claim,
  los enlaces de Cal y los registros antes de reconciliar una operación manualmente.
- El evento está oculto del perfil. Esto NO bloquea su URL directa. Los enlaces
  privados limitan el uso individual, pero no constituyen autenticación del evento
  base. No publicar su URL como acceso de compra ni considerar esto un muro de pago
  completo contra quien conozca esa URL. Para endurecerlo, usar reservas en la web
  y confirmación controlada en servidor antes del lanzamiento comercial.
- El titular confirmó que la reserva completa funciona y autorizó activar ARS 59.000. Los horarios permanecen sin cambios; revisar la protección del evento base y recuperación entre navegadores como mejoras pendientes.
- Revocar las antiguas claves de Mercado Pago y MailerLite que se expusieron en el
  historial público. Eliminar archivos actuales no revoca las copias históricas.

## Verificación

`node --test tests/*.test.mjs` cubre sesión, pago, importes, devoluciones, acceso
sin pago, concurrencia, recuperación de enlaces y fallos ambiguos de proveedores.
Estas pruebas usan simulaciones y no generan cobros. `npm run build` prepara el sitio.


Por decisión del titular, la página de compra muestra solo Argentina con Mercado Pago y ARS 59.000. La tarjeta internacional y las referencias a PayPal/USD quedan fuera de esta página por ahora.

