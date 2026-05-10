import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Map product types to Stripe price IDs and Clerk access tiers
// You'll fill in the price IDs after creating products in Stripe dashboard
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
    accessTier: null, // PDF only — no app access
  },
  bundle: {
    priceId: process.env.STRIPE_PRICE_BUNDLE,
    mode: 'payment',
    accessTier: 'bundle',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productType, userId, userEmail } = req.body;

  if (!productType || !PRODUCTS[productType]) {
    return res.status(400).json({ error: 'Invalid product type' });
  }

  const product = PRODUCTS[productType];
  const appUrl = process.env.VITE_APP_URL || 'https://study.thenuttynurse.com';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: product.mode,
      line_items: [{ price: product.priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&product=${productType}`,
      cancel_url: `${appUrl}`,
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
