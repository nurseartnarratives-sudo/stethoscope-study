export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, userId, userEmail } = req.body;
  if (!sessionId || !userId) return res.status(400).json({ error: 'Missing required fields' });

  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const validStatuses = ['paid', 'no_payment_required'];
    if (!validStatuses.includes(session.payment_status) && session.status !== 'complete') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Verify email matches
    const stripeEmail = session.customer_details?.email?.toLowerCase();
    if (userEmail && stripeEmail && stripeEmail !== userEmail.toLowerCase()) {
      return res.status(403).json({ error: 'Email mismatch' });
    }

    const productType = session.metadata?.productType;
    const TIER_MAP = {
      monthly: 'monthly',
      lifetime: 'lifetime',
      bundle: 'bundle',
      pdf: null, // PDF only — no app access
    };

    const accessTier = TIER_MAP[productType];

    // Set Clerk access tier if this product grants app access
    if (accessTier) {
      await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: { access_tier: accessTier },
        }),
      });
    }

    return res.status(200).json({ success: true, productType, accessTier });
  } catch (err) {
    console.error('Verify purchase error:', err);
    return res.status(500).json({ error: err.message });
  }
}
