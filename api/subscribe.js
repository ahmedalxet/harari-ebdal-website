// Newsletter subscription endpoint
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
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === "POST") {
    try {
      const { email } = req.body;

      console.log("📧 New subscription attempt:", email);

      // Validate email format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email address format",
        });
      }

      const subscribers = await getSubscribers();
      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already exists
      const existingSubscriber = subscribers.find(
        (sub) => sub.email === normalizedEmail
      );
      let isNewSubscriber = false;

      if (existingSubscriber) {
        if (existingSubscriber.status === "unsubscribed") {
          // Resubscribe user
          await updateSubscriber(existingSubscriber._id, {
            status: "active",
            subscribedAt: new Date().toISOString(),
          });
          isNewSubscriber = true;
          console.log("♻️ Resubscribed user:", email);
        } else {
          console.log("⚠️ User already subscribed:", email);
          return res.status(200).json({
            success: true,
            message: "You are already subscribed to our newsletter!",
            isNew: false,
          });
        }
      } else {
        // Add new subscriber
        const newSubscriber = {
          id: generateId(),
          email: normalizedEmail,
          subscribedAt: new Date().toISOString(),
          status: "active",
        };

        await addSubscriber(newSubscriber);
        isNewSubscriber = true;
        console.log("✅ New subscriber added:", email);
      }

      // Send emails in parallel (don't wait for them to complete)
      if (process.env.BREVO_SMTP_LOGIN && process.env.BREVO_SMTP_PASSWORD) {
        console.log("📧 Sending emails via Brevo SMTP...");

        // Send both emails without waiting (fire and forget)
        Promise.all([
          sendWelcomeEmail(normalizedEmail).catch((err) =>
            console.error("Welcome email failed:", err.message)
          ),
          isNewSubscriber
            ? sendAdminNotification(normalizedEmail).catch((err) =>
                console.error("Admin notification failed:", err.message)
              )
            : Promise.resolve(),
        ])
          .then(() => {
            console.log("📧 Email sending process completed");
          })
          .catch((err) => {
            console.error("Email process error:", err.message);
          });
      } else {
        console.log("⚠️ Brevo SMTP not configured, skipping email sending");
      }

      // Respond immediately (don't wait for emails)
      res.status(200).json({
        success: true,
        message: isNewSubscriber
          ? "Successfully subscribed! Welcome email will be sent shortly."
          : "Welcome back! You have been resubscribed.",
        isNew: isNewSubscriber,
      });
    } catch (error) {
      console.error("❌ Subscription error:", error);
      res.status(500).json({
        success: false,
        error: "Subscription failed. Please try again later.",
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
