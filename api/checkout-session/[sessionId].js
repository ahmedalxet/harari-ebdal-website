// Get checkout session details endpoint
import Stripe from "stripe";
import { corsHeaders } from "../utils/database.js";

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

  if (req.method === "GET") {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      res.status(200).json(session);
    } catch (error) {
      console.error("Error retrieving session:", error);
      res.status(500).json({ error: "Failed to retrieve session" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
