// Health check endpoint
import { corsHeaders } from "./utils/database.js";

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
      res.status(200).json({
        status: "Server is running!",
        timestamp: new Date().toISOString(),
        storage: "MongoDB Atlas",
        emailService: "Brevo SMTP",
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
