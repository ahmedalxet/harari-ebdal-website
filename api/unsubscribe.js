// Unsubscribe endpoint
import {
  getSubscribers,
  updateSubscriber,
  corsHeaders,
} from "./utils/database.js";

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
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const subscribers = await getSubscribers();
      const subscriber = subscribers.find(
        (sub) => sub.email === email.toLowerCase()
      );

      if (subscriber) {
        await updateSubscriber(subscriber._id || subscriber.id, {
          status: "unsubscribed",
          unsubscribedAt: new Date().toISOString(),
        });
        console.log("👋 User unsubscribed:", email);
      }

      res.status(200).json({
        success: true,
        message: "Successfully unsubscribed",
      });
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
