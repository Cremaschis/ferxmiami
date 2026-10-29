import { configuration, readOrder } from './mercadopago.js';
export async function paidOrder(req) {
  const config = configuration();
  if (!config.ready) throw new Error('Verificación no disponible.');
  const order = readOrder(req.headers.cookie, config.token);
  if (!order) throw new Error('Sesión no encontrada.');
  let id = req.query?.payment_id || req.body?.payment_id;
  const options = () => ({ headers: { Authorization: `Bearer ${config.token}` }, signal: AbortSignal.timeout(15000) });
  if (!id) {
    const search = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(order.reference)}&sort=date_created&criteria=desc&limit=10`, options());
    if (!search.ok) throw new Error('Consulta no disponible.');
    const data = await search.json();
    id = String(data.results?.find(p => p.status === 'approved')?.id || data.results?.[0]?.id || '');
    if (!id) return { order, payment: { status: 'not_found' }, approved: false };
  }
  if (typeof id !== 'string' || !/^\d{1,24}$/.test(id)) throw new Error('Pago inválido.');
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, options());
  if (!response.ok) throw new Error('Consulta no disponible.');
  const payment = await response.json();
  if (payment.external_reference !== order.reference || payment.currency_id !== 'ARS' || Number(payment.transaction_amount) !== order.price) throw new Error('Pago no corresponde a la compra.');
  return { order, payment, approved: payment.status === 'approved' && !(Number(payment.transaction_amount_refunded) > 0) };
}
