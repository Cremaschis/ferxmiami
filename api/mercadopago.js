export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, payer, back_urls } = req.body;

  const token = 'APP_USR-6731698582633261-060911-5c539d365957c645aaed0caf01b47cb7-513267317';

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items,
        payer,
        back_urls,
        auto_return: 'approved',
        notification_url: 'https://nicocremaschi.app.n8n.cloud/webhook/mp-notificacion'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json({
      init_point: data.init_point,
      preference_id: data.id,
      sandbox_init_point: data.sandbox_init_point
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
