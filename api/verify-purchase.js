export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, userId } = req.body;
  if (!sessionId || !userId) return res.status(400).json({ error: 'Missing required fields' });

  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log(`Verify purchase: status=${session.status} payment_status=${session.payment_status} product=${session.metadata?.productType}`);

    // Accept paid, free (100% coupon), or complete sessions
    const isValid = session.status === 'complete' ||
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required';

    if (!isValid) {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const productType = session.metadata?.productType;
    const TIER_MAP = {
      monthly: 'monthly',
      lifetime: 'lifetime',
      bundle: 'bundle',
      pdf: null,
    };

    const accessTier = TIER_MAP[productType];

    if (accessTier) {
      const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: { access_tier: accessTier },
        }),
      });

      if (!clerkRes.ok) {
        const errText = await clerkRes.text();
        console.error('Clerk update failed:', errText);
        return res.status(500).json({ error: 'Failed to activate access' });
      }

      console.log(`✅ Access tier "${accessTier}" set for user ${userId}`);
    }

    return res.status(200).json({ success: true, productType, accessTier });
  } catch (err) {
    console.error('Verify purchase error:', err);
    return res.status(500).json({ error: err.message });
  }
}
