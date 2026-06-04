import crypto from 'crypto';

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

  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!KEY_SECRET) {
    console.error('[verify-payment] Missing RAZORPAY_KEY_SECRET');
    res.status(500).json({ error: 'Payment gateway not configured' });
    return;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: 'Missing required payment fields' });
    return;
  }

  try {
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(message)
      .digest('hex');

    // Constant-time comparison prevents timing attacks
    let verified = false;
    if (expected.length === razorpay_signature.length) {
      verified = crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(razorpay_signature)
      );
    }

    res.status(200).json({ verified });
  } catch (err) {
    console.error('[verify-payment] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}