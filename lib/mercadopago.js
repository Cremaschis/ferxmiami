import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
export const SITE = 'https://fernanda-miami.vercel.app';
export function configuration() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const price = Number(process.env.MERCADOPAGO_PRICE_ARS || '59000');
  const enabled = process.env.MERCADOPAGO_DYNAMIC_ENABLED === 'true';
  return { token, price, ready: Boolean(enabled && token && Number.isFinite(price) && price > 0 && Number.isInteger(price * 100)) };
}
export function newOrder(price) { return { reference: `fer-${randomUUID()}`, price, expires: Date.now() + 86400000 }; }
function signature(value, key) { return createHmac('sha256', key).update(`fer-checkout-session-v1:${value}`).digest('base64url'); }
export function signOrder(order, key) {
  const value = Buffer.from(JSON.stringify(order)).toString('base64url');
  return `${value}.${signature(value, key)}`;
}
export function readOrder(cookie, key) {
  try {
    const value = cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('fer_order='))?.slice(10);
    const [payload, supplied] = (value || '').split('.');
    const expected = signature(payload, key);
    if (!supplied || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
    const order = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (order.expires < Date.now() || !/^fer-[a-f0-9-]{36}$/.test(order.reference) || !(order.price > 0)) return null;
    return order;
  } catch { return null; }
}
export function allowedOrigin(origin) {
  if (!origin) return false;
  return origin === SITE || (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`);
}
export function checkoutUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && ['www.mercadopago.com.ar','www.mercadopago.com','sandbox.mercadopago.com.ar'].includes(url.hostname); } catch { return false; }
}

