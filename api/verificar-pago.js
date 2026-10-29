import { configuration, readOrder } from '../lib/mercadopago.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido.' });
  const config = configuration();
  if (!config.ready) return res.status(503).json({ error: 'La verificación de pagos no está disponible.' });
  const order = readOrder(req.headers.cookie, config.token);
  const id = req.query?.payment_id;
  if (!order || typeof id !== 'string' || !/^\d{1,24}$/.test(id)) return res.status(400).json({ error: 'No pudimos identificar este pago en tu sesión. Conservá el comprobante de Mercado Pago.' });
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${config.token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Payment lookup failed');
    const payment = await response.json();
    if (payment.external_reference !== order.reference || payment.currency_id !== 'ARS' || Number(payment.transaction_amount) !== order.price) return res.status(400).json({ error: 'El pago no coincide con esta compra.' });
    // A payment is not a booking. Never release a shared calendar link here.
    return res.status(200).json({ status: payment.status, approved: payment.status === 'approved', amount: order.price, reference: order.reference, booking_ready: false });
  } catch { return res.status(502).json({ error: 'No pudimos consultar el pago. Probá actualizar esta página en unos instantes.' }); }
}
