import { paidOrder } from '../lib/paid-order.js';
import { configuration } from '../lib/mercadopago.js';
import { bookingConfigured } from '../lib/booking.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido.' });
  if (!configuration().ready) return res.status(503).json({ error: 'La verificación de pagos no está disponible.' });
  try {
    const { order, payment, approved } = await paidOrder(req);
    return res.status(200).json({ status: payment.status, approved, amount: order.price, reference: order.reference, payment_id: payment.id ? String(payment.id) : null, booking_ready: bookingConfigured() });
  } catch { return res.status(400).json({ error: 'No pudimos verificar este pago en tu sesión. Conservá el comprobante y no vuelvas a pagar.' }); }
}
