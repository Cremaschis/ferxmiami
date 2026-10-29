import { allowedOrigin } from '../lib/mercadopago.js';
import { paidOrder } from '../lib/paid-order.js';
import { bookingConfigured, bookingForOrder } from '../lib/booking.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'Origen no permitido.' });
  if (!bookingConfigured()) return res.status(503).json({ error: 'Estamos terminando de conectar la agenda. Tu pago no se pierde; no vuelvas a pagar.' });
  try {
    const { order, payment, approved } = await paidOrder(req);
    if (!approved) return res.status(409).json({ error: 'El pago todavía no está aprobado o tiene una devolución. No vuelvas a pagar si sigue pendiente.' });
    const booking = await bookingForOrder(order, payment);
    if (booking.pending) return res.status(202).json({ pending: true, message: 'Tu pago está confirmado. Estamos preparando tu acceso. Actualizá en unos instantes; si continúa así, contactá a Fer con tu comprobante. No vuelvas a pagar.' });
    return res.status(200).json({ booking_url: booking.url, reference: order.reference });
  } catch (error) {
    console.error('paid_booking_failed', error.name);
    return res.status(502).json({ error: 'Tu pago no se volverá a cobrar. No pudimos preparar la reserva; conservá el comprobante y contactá a Fer si el problema continúa.' });
  }
}
