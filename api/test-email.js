// Test email endpoint
import { testEmailConnection, corsHeaders } from "./utils/database.js";
import nodemailer from "nodemailer";

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
      console.log("🧪 Testing Brevo SMTP configuration...");

      // Test connection
      const transporter = nodemailer.createTransporter({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_SMTP_LOGIN,
          pass: process.env.BREVO_SMTP_PASSWORD,
          method: "LOGIN",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const isConnected = await transporter.verify();

      if (isConnected) {
        // Try sending a test email
        try {
          await transporter.sendMail({
            from: `"Harari EBDAL Test" <${process.env.BREVO_EMAIL}>`,
            to: process.env.ADMIN_EMAIL || process.env.BREVO_EMAIL,
            subject: "Brevo SMTP Test - Harari EBDAL",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">✅ Brevo SMTP Test Successful!</h2>
                <p>This email confirms that your Brevo SMTP configuration is working correctly.</p>
                <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                  <p><strong>Service:</strong> Brevo SMTP</p>
                  <p><strong>Server:</strong> smtp-relay.brevo.com</p>
                  <p><strong>Port:</strong> 587 (STARTTLS)</p>
                  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                  <p><strong>From:</strong> ${process.env.BREVO_EMAIL}</p>
                </div>
                <p>Your email system is ready to send welcome emails and notifications!</p>
              </div>
            `,
          });

          res.status(200).json({
            success: true,
            message: "Brevo SMTP test successful! Check your inbox.",
            service: "Brevo SMTP",
            server: "smtp-relay.brevo.com",
            port: 587,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "Brevo SMTP connection OK but sending failed",
            error: error.message,
            service: "Brevo SMTP",
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Brevo SMTP connection failed. Check your SMTP credentials.",
          service: "Brevo SMTP",
          help: "Get SMTP credentials from: Brevo Dashboard → SMTP & API → SMTP tab",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Email test error:", error);
      res.status(500).json({
        success: false,
        message: "Email test failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
