import { SITE, configuration, newOrder, signOrder, allowedOrigin, checkoutUrl } from '../lib/mercadopago.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const config = configuration();
  if (req.method === 'GET') return res.status(200).json({ ready: config.ready, amount: config.price, currency: 'ARS' });
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Método no permitido.' }); }
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'Origen no permitido.' });
  if (!config.ready) return res.status(503).json({ error: 'El cobro por compra todavía no está habilitado.' });
  // Never accept items, prices, callbacks or credentials from the browser.
  const order = newOrder(config.price);
  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        items: [{ id: 'cafe-fer-60', title: 'Café virtual con Fer - 60 minutos', quantity: 1, currency_id: 'ARS', unit_price: config.price }],
        external_reference: order.reference,
        metadata: { product: 'cafe-fer-60', version: 'dynamic-v1' },
        back_urls: { success: `${SITE}/pago-resultado`, failure: `${SITE}/pago-resultado`, pending: `${SITE}/pago-resultado` },
        auto_return: 'approved',
        payment_methods: { installments: 1 },
        expires: true, expiration_date_to: new Date(order.expires).toISOString(),
      }),
    });
    if (!response.ok) return res.status(502).json({ error: 'Mercado Pago no pudo crear el cobro. Intentá nuevamente.' });
    const data = await response.json();
    if (!checkoutUrl(data.init_point) || !data.id) throw new Error('Invalid checkout response');
    res.setHeader('Set-Cookie', `fer_order=${signOrder(order, config.token)}; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/`);
    return res.status(200).json({ init_point: data.init_point, preference_id: data.id, reference: order.reference, amount: config.price });
  } catch { return res.status(502).json({ error: 'No pudimos crear el cobro. Intentá nuevamente en unos instantes.' }); }
}
