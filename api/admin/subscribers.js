// Admin subscribers management endpoint
import {
  getSubscribers,
  deleteSubscriber,
  corsHeaders,
} from "../utils/database.js";

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
      console.log("📊 Fetching subscribers...");
      const subscribers = await getSubscribers();

      console.log(`Found ${subscribers.length} total subscribers`);

      // Filter out unsubscribed users and add ID field
      const activeSubscribers = subscribers
        .filter((sub) => sub.status !== "unsubscribed")
        .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
        .map((sub) => ({
          id: sub._id || sub.id,
          email: sub.email,
          subscribedAt: sub.subscribedAt,
          status: sub.status,
        }));

      console.log(`Returning ${activeSubscribers.length} active subscribers`);
      res.status(200).json(activeSubscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  } else if (req.method === "DELETE") {
    try {
      // Extract ID from URL path
      const url = new URL(req.url, "http://localhost");
      const pathParts = url.pathname.split("/");
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Subscriber ID is required",
        });
      }

      const result = await deleteSubscriber(id);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Subscriber not found",
        });
      }

      console.log(`🗑️ Removed subscriber with ID: ${id}`);
      res.status(200).json({
        success: true,
        message: "Subscriber removed successfully",
      });
    } catch (error) {
      console.error("Error removing subscriber:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove subscriber",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "DELETE"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
