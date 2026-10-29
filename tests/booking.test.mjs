import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingForOrder, validBookingUrl } from '../lib/booking.js';
import { newOrder } from '../lib/mercadopago.js';
import { paidOrder } from '../lib/paid-order.js';
import { signOrder } from '../lib/mercadopago.js';
function memoryStore() {
  const rows = new Map();
  return { rows, async read(k) { return rows.get(k) || null; }, async write(k,v) { if (rows.has(k)) throw Error('exists'); rows.set(k,v); } };
}
const result = { status: 'success', data: { eventTypeId: 7694917, linkId: 'test-link', bookingUrl: 'https://cal.com/d/test-link/cafe-virtual' } };
test('one approved order grants at most one private link, including concurrent refreshes', async () => {
  process.env.CAL_EVENT_TYPE_ID = '7694917';
  const order = newOrder(59), store = memoryStore(); let calls = 0;
  const request = async (url,opts) => {
    calls++;
    assert.equal(JSON.parse(opts.body).maxUsageCount,1);
    assert.match(url,/event-types\/7694917\/private-links$/);
    return { ok: true, json: async()=>result };
  };
  const simultaneous = await Promise.all(Array.from({length:12},()=>bookingForOrder(order,{id:123},store,request)));
  assert.equal(calls,1);
  assert(simultaneous.some(r=>r.url === result.data.bookingUrl));
  const again = await bookingForOrder(order,{id:456},store,request);
  assert.equal(again.url,result.data.bookingUrl);
  assert.equal(calls,1);
});
test('ambiguous Cal failure never automatically issues another private link', async()=>{
  const order=newOrder(59),store=memoryStore(); let calls=0;
  const request=async()=>{calls++;throw Error('timeout after external side effect')};
  await assert.rejects(bookingForOrder(order,{id:1},store,request));
  assert.deepEqual(await bookingForOrder(order,{id:1},store,request),{pending:true});
  assert.equal(calls,1);
});
test('storage failure prevents issuing a link; external URL cannot be returned',async()=>{
  let calls=0;
  const store={async read(){return null},async write(){throw Error('unavailable')}};
  await assert.rejects(bookingForOrder(newOrder(59),{id:1},store,async()=>{calls++}));
  assert.equal(calls,0);
  assert.equal(validBookingUrl('https://cal.com.evil.test/d/link'),false);
  assert.equal(validBookingUrl('https://cal.com/fer-dajvbk/cafe-virtual'),false);
});
test('recovery without payment ID only searches the signed order and rejects refunded payments',async()=>{
  const old=global.fetch;
  process.env.MERCADOPAGO_ACCESS_TOKEN='test'; process.env.MERCADOPAGO_DYNAMIC_ENABLED='true';
  const order=newOrder(59);
  const cookie=`fer_order=${signOrder(order,'test')}`;
  try {
    global.fetch=async url=>({ok:true,json:async()=>url.includes('/search?')?{results:[{id:123,status:'approved'}]}:{id:123,external_reference:order.reference,status:'approved',transaction_amount:59,currency_id:'ARS',transaction_amount_refunded:1}});
    assert.equal((await paidOrder({headers:{cookie}})).approved,false);
  } finally {global.fetch=old;delete process.env.MERCADOPAGO_ACCESS_TOKEN;delete process.env.MERCADOPAGO_DYNAMIC_ENABLED;}
});
