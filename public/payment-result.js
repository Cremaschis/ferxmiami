const params = new URLSearchParams(location.search);
const candidate = params.get('payment_id') || params.get('collection_id');
const id = candidate && /^\d+$/.test(candidate) ? candidate : '';
const result = document.getElementById('payment-result');
const reserve = document.getElementById('booking-action');
(async () => {
  try {
    const response = await fetch(`/api/verificar-pago${id ? `?payment_id=${encodeURIComponent(id)}` : ''}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    if (!data.approved) {
      result.textContent = data.status === 'not_found' ? 'Todavía no encontramos un pago para esta compra. Si acabás de pagar, actualizá esta página en unos instantes. No vuelvas a pagar.' : `El pago todavía no habilita la reserva. Estado: ${data.status}. Si está pendiente, no vuelvas a pagar.`;
      return;
    }
    result.textContent = `Mercado Pago confirmó tu pago de ARS ${data.amount}. Estamos preparando tu acceso a la agenda…`;
    if (!data.booking_ready) throw new Error('Tu pago está confirmado. La agenda todavía está en configuración. Conservá el comprobante; no vuelvas a pagar.');
    const bookingResponse = await fetch('/api/reservar-pago', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payment_id: data.payment_id }) });
    const booking = await bookingResponse.json();
    if (!bookingResponse.ok) throw new Error(booking.error);
    if (booking.pending) { result.textContent = booking.message; return; }
    const url = new URL(booking.booking_url);
    if (url.origin !== 'https://cal.com' || !url.pathname.startsWith('/d/')) throw new Error('No pudimos abrir la agenda. Conservá el comprobante.');
    reserve.href = url.href;
    reserve.hidden = false;
    result.textContent = `Tu pago de ARS ${data.amount} está confirmado. Elegí el día y horario de tu encuentro. Al reservar vas a encontrar unas preguntas opcionales para preparar la charla. Este enlace permite reservar una sola cita.`;
  } catch (error) { result.textContent = error.message || 'No pudimos preparar tu reserva. Conservá tu comprobante y no vuelvas a pagar.'; }
})();
