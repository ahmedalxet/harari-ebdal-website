// api/subscribe.js
import {
  getSubscribers,
  addSubscriber,
  updateSubscriber,
  generateId,
  corsHeaders,
} from "./utils/database.js";
import { sendWelcomeEmail, sendAdminNotification } from "./utils/email.js";

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Set CORS headers
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed" 
    });
  }

  try {
    // Validate request content type
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(415).json({
        success: false,
        error: "Unsupported Media Type: Expected application/json",
      });
    }

    const { email } = req.body;

    // Validate email exists
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email address is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address format",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("📧 Processing subscription for:", normalizedEmail);

    // Database operations
    const subscribers = await getSubscribers();
    const existingSubscriber = subscribers.find(
      (sub) => sub.email === normalizedEmail
    );

    let isNewSubscriber = false;
    let dbOperation;

    if (existingSubscriber) {
      if (existingSubscriber.status === "unsubscribed") {
        // Resubscribe user
        dbOperation = updateSubscriber(existingSubscriber._id, {
          status: "active",
          subscribedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
        isNewSubscriber = true;
        console.log("♻️ Resubscribed user:", normalizedEmail);
      } else {
        console.log("ℹ️ User already subscribed:", normalizedEmail);
        return res.status(200).json({
          success: true,
          message: "Thank You!",
          isNew: false,
          email: normalizedEmail,
        });
      }
    } else {
      // Add new subscriber
      const newSubscriber = {
        id: generateId(),
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        status: "active",
        source: "website",
      };

      dbOperation = addSubscriber(newSubscriber);
      isNewSubscriber = true;
      console.log("✅ New subscriber added:", normalizedEmail);
    }

    // Wait for database operation to complete
    await dbOperation;

    // Email sending configuration check
    const emailEnabled = process.env.BREVO_SMTP_LOGIN && 
                        process.env.BREVO_SMTP_PASSWORD &&
                        process.env.NODE_ENV === "production";

    if (emailEnabled) {
      console.log("📧 Starting email sending process...");
      
      try {
        // Send welcome email
        await sendWelcomeEmail(normalizedEmail);
        console.log("✓ Welcome email sent");

        // Send admin notification for new subscribers only
        if (isNewSubscriber) {
          await sendAdminNotification(normalizedEmail);
          console.log("✓ Admin notification sent");
        }
      } catch (emailError) {
        console.error("⚠️ Email sending error:", emailError.message);
        // Don't fail the request if emails fail
      }
    } else {
      console.log("ℹ️ Email sending disabled (missing config or not production)");
    }

    // Successful response
    return res.status(200).json({
      success: true,
      message: isNewSubscriber
        ? "Thank you for subscribing! Check your email for confirmation."
        : "Welcome back! You've been resubscribed.",
      isNew: isNewSubscriber,
      email: normalizedEmail,
    });

  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}