import { put, get } from '@vercel/blob';
export function bookingConfigured() {
  return Boolean(process.env.CAL_API_KEY && /^\d+$/.test(process.env.CAL_EVENT_TYPE_ID || '') && (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN));
}
export function validBookingUrl(value) {
  try { const u = new URL(value); return u.origin === 'https://cal.com' && u.pathname.startsWith('/d/'); } catch { return false; }
}
export const blobStore = {
  async read(path) {
    const file = await get(path, { access: 'private', useCache: false });
    if (!file) return null;
    if (file.statusCode !== 200) throw new Error('No pudimos consultar la reserva.');
    return JSON.parse(await new Response(file.stream).text());
  },
  async write(path, value) {
    return put(path, JSON.stringify(value), { access: 'private', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/json', cacheControlMaxAge: 60 });
  },
};
// Immutable claim before Cal's external side effect. Never automatically clear it:
// a timeout may mean Cal created a link; creating again could grant two bookings.
export async function bookingForOrder(order, payment, store = blobStore, request = fetch) {
  if (!/^fer-[a-f0-9-]{36}$/.test(order.reference)) throw new Error('Referencia inválida.');
  const root = `paid-bookings/${order.reference}`;
  const existing = await store.read(`${root}/link.json`);
  if (existing) {
    if (!validBookingUrl(existing.url)) throw new Error('Enlace inválido.');
    return existing;
  }
  try {
    await store.write(`${root}/claim.json`, { paymentId: String(payment.id), reference: order.reference, amount: order.price, createdAt: new Date().toISOString() });
  } catch (error) {
    if (!await store.read(`${root}/claim.json`)) throw error;
    const completed = await store.read(`${root}/link.json`);
    if (completed && validBookingUrl(completed.url)) return completed;
    return { pending: true };
  }
  const response = await request(`https://api.cal.com/v2/event-types/${process.env.CAL_EVENT_TYPE_ID}/private-links`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.CAL_API_KEY}`, 'Content-Type': 'application/json', 'cal-api-version': '2024-09-04' },
    body: JSON.stringify({ maxUsageCount: 1 }), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Cal no pudo crear el enlace.');
  const result = await response.json();
  if (result.status !== 'success' || !validBookingUrl(result.data?.bookingUrl) || Number(result.data.eventTypeId) !== Number(process.env.CAL_EVENT_TYPE_ID)) throw new Error('Respuesta inválida de Cal.');
  const record = { url: result.data.bookingUrl, linkId: result.data.linkId, paymentId: String(payment.id), reference: order.reference, createdAt: new Date().toISOString() };
  await store.write(`${root}/link.json`, record);
  return record;
}
