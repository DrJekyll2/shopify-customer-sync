export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { customer_id, phone, address1, city, zip } = req.body;
  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id mancante' });
  }

  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  try {
    const result = await fetch(`https://${shop}/admin/api/2024-01/customers/${customer_id}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        customer: {
          id: customer_id,
          phone,
          default_address: {
            address1,
            city,
            zip
          }
        }
      })
    });

    const data = await result.json();
    if (!result.ok) {
      return res.status(result.status).json({ error: data.errors || 'Errore API' });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Errore server', details: err.message });
  }
}
