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

    // The client sends `amount` in cents (e.g. R$15.00 -> 1500). We'll forward amounts in cents
    // to PodPay (many APIs expect integer cents) and include items.unit_amount in cents.
    const amountInCents = amount;

    // Build payload including required `items` field (PodPay requires an items list)
    const payload = {
      amount: amountInCents,
      paymentMethod: 'pix',
      currency: 'BRL',
      description: 'Doação - Vakinha dos Bastiões',
      items: [
        {
          // PodPay requires these fields: title, unitPrice and tangible
          title: 'Doação',
          quantity: 1,
          // unitPrice in cents (integer)
          unitPrice: amountInCents,
          tangible: false,
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
