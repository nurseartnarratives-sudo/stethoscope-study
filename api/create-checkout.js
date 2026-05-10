export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check required env vars
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const PRODUCTS = {
    monthly: {
      priceId: process.env.STRIPE_PRICE_MONTHLY,
      mode: 'subscription',
      accessTier: 'monthly',
    },
    lifetime: {
      priceId: process.env.STRIPE_PRICE_LIFETIME,
      mode: 'payment',
      accessTier: 'lifetime',
    },
    pdf: {
      priceId: process.env.STRIPE_PRICE_PDF,
      mode: 'payment',
      accessTier: null,
    },
    bundle: {
      priceId: process.env.STRIPE_PRICE_BUNDLE,
      mode: 'payment',
      accessTier: 'bundle',
    },
  };

  const { productType, userId, userEmail } = req.body;

  if (!productType || !PRODUCTS[productType]) {
    return res.status(400).json({ error: 'Invalid product type' });
  }

  const product = PRODUCTS[productType];

  if (!product.priceId) {
    console.error(`Missing price ID for product: ${productType}`);
    return res.status(500).json({ error: 'Product not configured' });
  }

  const appUrl = process.env.VITE_APP_URL || 'https://study.thenuttynurse.com';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: product.mode,
      line_items: [{ price: product.priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&product=${productType}`,
      cancel_url: `${appUrl}`,
      allow_promotion_codes: true,
      customer_email: userEmail || undefined,
      metadata: {
        productType,
        userId: userId || '',
        accessTier: product.accessTier || '',
      },
      ...(product.mode === 'subscription' && {
        subscription_data: {
          metadata: {
            productType,
            userId: userId || '',
          },
        },
      }),
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message });
  }
}
