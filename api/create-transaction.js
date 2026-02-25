export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = req.body;
    if (!body || typeof body.amount !== 'number') return res.status(400).json({ error: 'Invalid payload' });

    const amount = body.amount;
    if (amount < 1200) return res.status(400).json({ error: 'Minimum amount is 1200 (R$12.00)' });

    const publicKey = process.env.PODPAY_PUBLIC;
    const secretKey = process.env.PODPAY_SECRET;
    if (!publicKey || !secretKey) return res.status(500).json({ error: 'PodPay keys not configured on server.' });

    const auth = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64');

    // PodPay may expect amount in reais (e.g. 15.00) or in cents depending on the plan.
    // Normalize: if the incoming amount seems to be in cents (>=1000), convert to reais.
    const normalizedAmount = amount >= 1000 ? (amount / 100) : amount;

    // Build payload including required `items` field (PodPay requires an items list)
    const payload = {
      amount: normalizedAmount,
      paymentMethod: 'pix',
      currency: 'BRL',
      description: 'Doação - Vakinha dos Bastiões',
      items: [
        {
          name: 'Doação',
          quantity: 1,
          // many payment APIs accept unit price in the currency unit (reais). If PodPay expects cents, adjust accordingly.
          unit_amount: normalizedAmount,
        },
      ],
      customer: body.customer || undefined,
    };

    console.log('create-transaction payload ->', JSON.stringify(payload));

    const resp = await fetch('https://api.podpay.pro/v1/transactions', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch((e) => ({ parseError: String(e) }));
    console.log('create-transaction response status', resp.status, 'body ->', JSON.stringify(data));

    if (!resp.ok) {
      // Return detailed error for debugging (safe because this is server-side log),
      // but send a friendly message to the client as well.
      const errMsg = data.message || data.error || JSON.stringify(data);
      return res.status(resp.status).json({ error: errMsg });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('create-transaction error', err);
    return res.status(500).json({ error: String(err) });
  }
}
