const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://swiftcart-ai-ecommerce.vercel.app',
  'https://ai-enabled-ecommerce-app.vercel.app',
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const KEY_ID = process.env.RAZORPAY_KEY_ID;
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!KEY_ID || !KEY_SECRET) {
    console.error('[create-order] Missing Razorpay credentials');
    res.status(500).json({ error: 'Payment gateway not configured' });
    return;
  }

  const { amount, currency = 'INR', receipt } = req.body || {};

  if (!amount || typeof amount !== 'number' || amount < 100) {
    res.status(400).json({ error: 'Invalid amount — must be paise >= 100' });
    return;
  }

  try {
    const basicAuth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
      }),
    });

    const data = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error('[create-order] Razorpay error:', data);
      res.status(rzpRes.status).json({ error: data?.error?.description || 'Order creation failed' });
      return;
    }

    // Return ONLY what the client needs — KEY_SECRET never leaves this function
    res.status(200).json({
      razorpay_order_id: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (err) {
    console.error('[create-order] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}