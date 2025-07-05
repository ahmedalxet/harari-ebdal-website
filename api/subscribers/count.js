// Get subscriber count endpoint
import { getSubscribers, corsHeaders } from "../utils/database.js";

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
      const subscribers = await getSubscribers();
      const count = subscribers.filter(
        (sub) => sub.status !== "unsubscribed"
      ).length;

      res.status(200).json({ count });
    } catch (error) {
      console.error("Error getting subscriber count:", error);
      res.status(500).json({ error: "Failed to get subscriber count" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
