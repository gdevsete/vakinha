export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const id = req.query.id || req.url.split('?id=')[1];
    if (!id) return res.status(400).json({ error: 'Missing id query parameter' });

    const publicKey = process.env.PODPAY_PUBLIC;
    const secretKey = process.env.PODPAY_SECRET;
    if (!publicKey || !secretKey) return res.status(500).json({ error: 'PodPay keys not configured on server.' });

    const auth = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64');

    const resp = await fetch(`https://api.podpay.pro/v1/transactions/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { Authorization: auth },
    });

    const data = await resp.json().catch((e) => ({ parseError: String(e) }));
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data.message || data.error || JSON.stringify(data) });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('get-transaction error', err);
    return res.status(500).json({ error: String(err) });
  }
}
