// Only verified checkout links may be enabled here. Never use Calendly as a payment link.
const checkoutLinks = {
  mercadoPago: "https://mpago.la/1uxfiyH",
  paypal: null,
};
for (const [key, id, status] of [['mercadoPago', 'pay-ars', 'ars-status'], ['paypal', 'pay-usd', 'usd-status']]) {
  const value = checkoutLinks[key];
  if (!value) continue;
  const url = new URL(value);
  const allowed = key === 'mercadoPago'
    ? ['mpago.la', 'www.mercadopago.com.ar', 'link.mercadopago.com.ar']
    : ['www.paypal.com', 'paypal.com', 'www.paypal.me', 'paypal.me'];
  if (url.protocol !== 'https:' || !allowed.includes(url.hostname)) continue;
  const button = document.getElementById(id);
  button.href = url.href;
  button.removeAttribute('aria-disabled');
  button.classList.remove('unavailable');
  document.getElementById(status).textContent = key === 'mercadoPago' ? 'Cobro real de prueba · Mercado Pago' : 'Continuás al sitio de pago seguro.';
}
