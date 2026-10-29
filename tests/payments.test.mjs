import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/mercadopago.js';
import verify from '../api/verificar-pago.js';
import { newOrder, signOrder, readOrder, SITE } from '../lib/mercadopago.js';
const originalFetch = global.fetch;
function response() { return { headers: {}, code: 0, setHeader(k,v) { this.headers[k]=v; }, status(s) { this.code=s; return this; }, json(d) { this.data=d; return this; } }; }
test('dynamic checkout and payment validation', async t => {
  process.env.MERCADOPAGO_ACCESS_TOKEN = 'fake-local-test-token';
  process.env.MERCADOPAGO_PRICE_ARS = '59';
  process.env.MERCADOPAGO_DYNAMIC_ENABLED = 'true';
  try {
    await t.test('unconfigured checkout is not activated',async()=>{
      delete process.env.MERCADOPAGO_ACCESS_TOKEN;
      const r=response(); await handler({method:'GET'},r); assert.equal(r.data.ready,false);
      process.env.MERCADOPAGO_ACCESS_TOKEN='fake-local-test-token';
    });
    await t.test('new reference and checkout for each purchase; client cannot set price or callbacks',async()=>{
      const refs=[];
      global.fetch=async(url,options)=>{
        assert.equal(url,'https://api.mercadopago.com/checkout/preferences');
        const p=JSON.parse(options.body); refs.push(p.external_reference);
        assert.equal(p.items[0].unit_price,59); assert.equal(p.items[0].quantity,1); assert.equal(p.items[0].currency_id,'ARS');
        assert.equal(p.back_urls.success,`${SITE}/pago-resultado`); assert.equal(p.notification_url,undefined);
        return {ok:true,json:async()=>({id:`pref-${refs.length}`,init_point:`https://www.mercadopago.com.ar/checkout/v1/redirect?pref=${refs.length}`})};
      };
      for(let i=0;i<2;i++) {
        const r=response(); await handler({method:'POST',headers:{origin:SITE},body:{items:[{unit_price:1}],back_urls:{success:'https://example.com'}}},r);
        assert.equal(r.code,200); assert.match(r.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Lax/);
      }
      assert.notEqual(refs[0],refs[1]);
    });
    await t.test('foreign origins rejected before contacting the payment provider',async()=>{
      global.fetch=()=>{throw new Error('should not call')};
      const r=response(); await handler({method:'POST',headers:{origin:'https://example.com'}},r); assert.equal(r.code,403);
    });
    await t.test('provider errors do not disclose credentials',async()=>{
      global.fetch=async()=>({ok:false}); const r=response(); await handler({method:'POST',headers:{origin:SITE}},r); assert.equal(r.code,502); assert(!JSON.stringify(r.data).includes('fake-local-test-token'));
    });
    const order=newOrder(59); const cookie=`fer_order=${signOrder(order,'fake-local-test-token')}`;
    await t.test('signed session rejects tampering',()=>{assert(readOrder(cookie,'fake-local-test-token'));assert.equal(readOrder(cookie+'x','fake-local-test-token'),null);});
    await t.test('payment query string alone cannot assert approval',async()=>{
      const r=response(); await verify({method:'GET',headers:{},query:{payment_id:'123',status:'approved'}},r); assert.equal(r.code,400);
    });
    await t.test('approved payment checked against provider and order, but is not yet a booking',async()=>{
      global.fetch=async()=>({ok:true,json:async()=>({external_reference:order.reference,currency_id:'ARS',transaction_amount:59,status:'approved'})});
      const r=response(); await verify({method:'GET',headers:{cookie},query:{payment_id:'123'}},r); assert.equal(r.data.approved,true); assert.equal(r.data.booking_ready,false);
    });
    await t.test('wrong amount or unrelated purchase cannot be verified',async()=>{
      global.fetch=async()=>({ok:true,json:async()=>({external_reference:order.reference,currency_id:'ARS',transaction_amount:1,status:'approved'})});
      const r=response(); await verify({method:'GET',headers:{cookie},query:{payment_id:'123'}},r); assert.equal(r.code,400);
    });
  } finally { global.fetch=originalFetch; delete process.env.MERCADOPAGO_ACCESS_TOKEN;delete process.env.MERCADOPAGO_DYNAMIC_ENABLED;delete process.env.MERCADOPAGO_PRICE_ARS; }
});
