const mp = document.getElementById('pay-ars');
const status = document.getElementById('ars-status');
async function initialiseCheckout() {
  try {
    const response = await fetch('/api/mercadopago', { cache: 'no-store' });
    if (!response.ok) throw new Error('No pudimos consultar la disponibilidad del cobro.');
    const config = await response.json();
    if (!config.ready) { status.textContent = 'Estamos terminando de habilitar este medio de pago.'; return; }
    mp.removeAttribute('aria-disabled');
    mp.classList.remove('unavailable');
    mp.setAttribute('role', 'button');
    mp.setAttribute('tabindex', '0');
    mp.textContent = `Pagar ARS ${new Intl.NumberFormat('es-AR').format(config.amount)}`;
    document.getElementById('ars-amount').textContent = new Intl.NumberFormat('es-AR').format(config.amount);
    status.textContent = 'Pago seguro con Mercado Pago. Después elegís tu horario.';
    let busy = false;
    async function startPayment(event) {
      event.preventDefault();
      if (busy) return;
      busy = true;
      mp.setAttribute('aria-disabled', 'true');
      status.textContent = 'Preparando tu pago seguro…';
      try {
        const result = await fetch('/api/mercadopago', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const data = await result.json();
        if (!result.ok) throw new Error(data.error || 'No pudimos crear el cobro.');
        const url = new URL(data.init_point);
        if (url.protocol !== 'https:' || !['www.mercadopago.com.ar','www.mercadopago.com','sandbox.mercadopago.com.ar'].includes(url.hostname)) throw new Error('No pudimos abrir el pago seguro.');
        window.location.assign(url.href);
      } catch (error) {
        status.textContent = error.message || 'No pudimos crear el cobro. Intentá nuevamente.';
        mp.removeAttribute('aria-disabled');
        busy = false;
      }
    }
    mp.addEventListener('click', startPayment);
    mp.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') startPayment(event); });
  } catch { status.textContent = 'El cobro no está disponible en este momento. Intentá más tarde.'; }
}
initialiseCheckout();
