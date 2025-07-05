// Admin login endpoint
import { corsHeaders } from "../utils/database.js";

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
      const { password } = req.body;

      console.log("Admin login attempt");

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      if (password === process.env.ADMIN_SECRET) {
        console.log("✅ Admin login successful");
        res.status(200).json({
          success: true,
          message: "Admin authenticated successfully",
        });
      } else {
        console.log("❌ Admin login failed - wrong password");
        res.status(401).json({
          success: false,
          message: "Invalid admin password",
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed. Please try again.",
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
