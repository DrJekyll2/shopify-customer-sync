export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.devs-store.it');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST ammesso' });
  }

  const { customer_id, phone, address1, city, zip, first_name, last_name } = req.body;

  if (!customer_id || !phone || !address1 || !city || !zip || !first_name) {
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
        first_name,
        last_name,
        phone,
        addresses: [
          {
            address1,
            city,
            zip,
            default: true
          }
        ]
      }
    };

    const shopifyRes = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify(bodyData)
    });

    const data = await shopifyRes.json();

    if (!shopifyRes.ok) {
      console.error('Errore da Shopify:', data);
      return res.status(shopifyRes.status).json({ error: data });
    }

    return res.status(200).json({ success: true, customer: data.customer });

  } catch (err) {
    console.error('Errore server interno:', err);
    return res.status(500).json({ error: 'Errore interno', details: err.message });
  }
}
