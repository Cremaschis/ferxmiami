const params = new URLSearchParams(location.search);
const id = params.get('payment_id') || params.get('collection_id');
const result = document.getElementById('payment-result');
(async () => {
  try {
    if (!id) throw new Error('No encontramos un identificador de pago. Conservá tu comprobante de Mercado Pago.');
    const response = await fetch(`/api/verificar-pago?payment_id=${encodeURIComponent(id)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    result.textContent = data.approved
      ? `Mercado Pago confirmó el pago de ARS ${data.amount}. Esta es una prueba de cobro; no hay una cita reservada automáticamente.`
      : `El pago todavía no está aprobado. Estado informado por Mercado Pago: ${data.status}. No vuelvas a pagar si la operación sigue pendiente.`;
  } catch (error) { result.textContent = error.message || 'No pudimos verificar el pago. Conservá tu comprobante.'; }
})();
