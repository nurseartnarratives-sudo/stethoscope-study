import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Read raw body from request stream — required for Stripe signature verification
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// Clerk Backend API helper
async function setClerkAccessTier(userId, accessTier) {
  if (!userId || !accessTier) return;
  const response = await fetch(
    `https://api.clerk.com/v1/users/${userId}/metadata`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: { access_tier: accessTier },
      }),
    }
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Clerk metadata update failed: ${err}`);
  }
  console.log(`✅ Clerk access_tier set to "${accessTier}" for user ${userId}`);
}

// Look up Clerk user by email and set their access tier
async function setClerkAccessTierByEmail(email, accessTier) {
  if (!email || !accessTier) return false;

  // Search for user by email
  const searchRes = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}&limit=1`,
    {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }
  );

  if (!searchRes.ok) {
    console.error('Clerk user search failed:', await searchRes.text());
    return false;
  }

  const users = await searchRes.json();
  if (!users.length) {
    console.log(`No Clerk user found for email ${email} — will be set on first sign-in`);
    return false;
  }

  await setClerkAccessTier(users[0].id, accessTier);
  return true;
}

// Send PDF via Resend
async function sendPdfEmail(userEmail) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const pdfPath = path.join(process.cwd(), 'api', 'assets', 'Stethoscope_Study_Guide.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString('base64');

  await resend.emails.send({
    from: 'Stethoscope Study <study@thenuttynurse.com>',
    reply_to: 'nurse.artnarratives@gmail.com',
    to: userEmail,
    subject: '🩺 Your HESI A2 & TEAS 7 Master Study Guide',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8B0000; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #D4A017; margin: 0; font-size: 22px;">Stethoscope Study</h1>
          <p style="color: #fff; margin: 8px 0 0; font-size: 14px;">by The Nutty Nurse</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
          <h2 style="color: #8B0000;">Your Study Guide is Here! 🎉</h2>
          <p style="color: #555; line-height: 1.6;">
            Thank you for your purchase! Your <strong>HESI A2 &amp; TEAS 7 Master Study Guide</strong>
            is attached to this email as a PDF.
          </p>
          <p style="color: #555; line-height: 1.6;">Save it to your device so you can study anytime — even offline!</p>
          <div style="background: #FFF8E7; border: 1px solid #D4A017; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #8B0000; font-weight: bold;">💛 Study tip:</p>
            <p style="margin: 8px 0 0; color: #555; font-size: 14px;">
              Pair this guide with the interactive Stethoscope Study app at
              <a href="https://study.thenuttynurse.com" style="color: #8B0000;">study.thenuttynurse.com</a>
              for the best results!
            </p>
          </div>
          <p style="color: #555; font-size: 13px;">
            Questions? Reply to this email or reach us at
            <a href="mailto:nurse.artnarratives@gmail.com" style="color: #8B0000;">nurse.artnarratives@gmail.com</a>
          </p>
          <p style="color: #8B0000; font-weight: bold; margin-bottom: 0;">Good luck — you've got this! 🩺</p>
          <p style="color: #555; font-size: 13px; margin-top: 4px;">— Tina, The Nutty Nurse</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'HESI_A2_TEAS7_Master_Study_Guide.pdf',
        content: pdfBase64,
      },
    ],
  });
  console.log(`✅ PDF email sent to ${userEmail}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  // Get raw body BEFORE any parsing
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📨 Stripe event received: ${event.type}`);

  try {
    // ── One-time payment completed ──────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { productType, userId, accessTier } = session.metadata;
      const customerEmail = session.customer_details?.email;

      if (session.mode === 'payment') {
        // Set Clerk access tier — by userId if signed in, otherwise by email
        if (accessTier) {
          if (userId) {
            await setClerkAccessTier(userId, accessTier);
          } else if (customerEmail) {
            await setClerkAccessTierByEmail(customerEmail, accessTier);
          }
        }
        // Send PDF for pdf and bundle products
        if ((productType === 'pdf' || productType === 'bundle') && customerEmail) {
          await sendPdfEmail(customerEmail);
        }
      }

      // Subscription first payment
      if (session.mode === 'subscription') {
        if (userId) {
          await setClerkAccessTier(userId, 'monthly');
        } else if (customerEmail) {
          await setClerkAccessTierByEmail(customerEmail, 'monthly');
        }
      }
    }

    // ── Subscription renewed ────────────────────────────────────────────────
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (invoice.billing_reason === 'subscription_cycle') {
        const stripe2 = new Stripe(process.env.STRIPE_SECRET_KEY);
        const subscription = await stripe2.subscriptions.retrieve(invoice.subscription);
        const userId = subscription.metadata?.userId;
        if (userId) await setClerkAccessTier(userId, 'monthly');
      }
    }

    // ── Subscription cancelled or payment failed ────────────────────────────
    if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
      const stripe2 = new Stripe(process.env.STRIPE_SECRET_KEY);
      let userId;
      if (event.type === 'customer.subscription.deleted') {
        userId = event.data.object.metadata?.userId;
      } else {
        const sub = await stripe2.subscriptions.retrieve(event.data.object.subscription);
        userId = sub.metadata?.userId;
      }
      if (userId) await setClerkAccessTier(userId, 'monthly_expired');
    }

  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }

  res.status(200).json({ received: true });
}
