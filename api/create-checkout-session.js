// Create Stripe checkout session endpoint
import Stripe from "stripe";
import { corsHeaders } from "./utils/database.js";

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
    try {
      const { amount, currency = "usd", donorEmail } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: "Donation to Harari Culture Preservation",
                description:
                  "Supporting the preservation of Harari culture for future generations",
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${
          process.env.FRONTEND_URL || "https://harari-ebdal.vercel.app"
        }/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${
          process.env.FRONTEND_URL || "https://harari-ebdal.vercel.app"
        }/cancel`,
        customer_email: donorEmail,
        metadata: {
          donation_amount: amount.toString(),
          currency: currency,
          timestamp: new Date().toISOString(),
          donor_email: donorEmail || "",
        },
      });

      res.status(200).json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({
        error: "Failed to create checkout session",
        message: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
