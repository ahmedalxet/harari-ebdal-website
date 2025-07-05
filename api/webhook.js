// Stripe webhook endpoint
import Stripe from "stripe";
import { addDonation, generateId, corsHeaders } from "./utils/database.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === "POST") {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Get raw body for Stripe webhook verification
      const rawBody = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(req.body);
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Payment successful:", session);

        try {
          const donation = {
            id: generateId(),
            sessionId: session.id,
            amount: session.amount_total / 100,
            currency: session.currency,
            donorEmail: session.customer_email,
            status: "completed",
            createdAt: new Date().toISOString(),
            metadata: session.metadata,
          };

          await addDonation(donation);
          console.log("✅ Donation saved to database");
        } catch (err) {
          console.error("Error saving donation:", err);
        }

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}

// Important: Export config for raw body parsing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
