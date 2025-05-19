export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { customer_id, phone, address1, city, zip } = req.body;

  // Validazione base
  if (!customer_id || !phone || !address1 || !city || !zip) {
    return res.status(400).json({ error: 'Dati mancanti', received: req.body });
  }

  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!shop || !token) {
    return res.status(500).json({ error: 'Variabili di ambiente mancanti' });
  }

  try {
    const endpoint = `https://${shop}/admin/api/2024-01/customers/${customer_id}.json`;
    const bodyData = {
      customer: {
        id: customer_id,
        phone,
        default_address: {
          address1,
          city,
          zip,
        },
      },
    };

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log('Risposta Shopify:', data); // ✅ Log per debugging

    if (!response.ok) {
      console.error('Shopify API Error:', data);
      return res.status(response.status).json({ error: data.errors || data });
    }

    return res.status(200).json({
      success: true,
      message: 'Cliente aggiornato con successo',
      customer: data.customer,
    });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}
