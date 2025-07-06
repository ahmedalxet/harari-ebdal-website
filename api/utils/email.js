// Email service utility for Vercel serverless functions
import nodemailer from "nodemailer";

// Create email transporter with Brevo SMTP
const createEmailTransporter = () => {
  const brevoEmail = process.env.BREVO_EMAIL;
  const brevoSmtpLogin = process.env.BREVO_SMTP_LOGIN;
  const brevoSmtpPassword = process.env.BREVO_SMTP_PASSWORD;

  if (!brevoEmail || !brevoSmtpLogin || !brevoSmtpPassword) {
    console.log("⚠️ Brevo SMTP credentials not configured properly");
    return null;
  }

  return nodemailer.createTransporter({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: brevoSmtpLogin,
      pass: brevoSmtpPassword,
      method: "LOGIN",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send email with retry logic
const sendEmailWithRetry = async (transporter, mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Email attempt ${attempt}/${maxRetries}`);
      const result = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", result.messageId);
      return result;
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Send welcome email to subscriber
export async function sendWelcomeEmail(subscriberEmail) {
  console.log("📤 Preparing welcome email...");

  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      console.log("❌ Cannot create email transporter for welcome email");
      return;
    }

    const mailOptions = {
      from: `"Harari EBDAL Mugad" <${process.env.BREVO_EMAIL}>`,
      to: subscriberEmail,
      subject: "Welcome to Harari EBDAL Newsletter! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Harari EBDAL!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Thank you for subscribing! 🙏</h2>
            <p style="color: #666; line-height: 1.6;">
              You're now part of our community dedicated to preserving and celebrating Harari culture.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>What's next?</strong><br>
                • You'll receive our monthly newsletter with cultural insights<br>
                • Get updates on community events and initiatives<br>
                • Access exclusive content about Harari heritage
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${
                process.env.FRONTEND_URL || "https://harari-ebdal.vercel.app"
              }" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Visit Our Website
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              If you didn't subscribe to this newsletter, you can 
              <a href="${
                process.env.FRONTEND_URL || "https://harari-ebdal.vercel.app"
              }/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" 
                 style="color: #f59e0b;">unsubscribe here</a>.
            </p>
          </div>
        </div>
      `,
    };

    await sendEmailWithRetry(transporter, mailOptions);
    console.log(`✅ Welcome email sent successfully to: ${subscriberEmail}`);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
    throw error;
  }
}

// Send notification email to admin
export async function sendAdminNotification(subscriberEmail) {
  if (!process.env.ADMIN_EMAIL) {
    console.log("⚠️ Admin email not configured, skipping notification");
    return;
  }

  console.log("📤 Preparing admin notification...");

  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      console.log("❌ Cannot create email transporter for admin notification");
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const mailOptions = {
      from: `"Harari EBDAL System" <${process.env.BREVO_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🔔 New Subscriber Alert - Harari EBDAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Subscriber Alert!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px; border-radius: 0 5px 5px 0;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📧 New Subscription Details</h2>
              <p style="margin: 8px 0; color: #374151; font-size: 16px;">
                <strong>Email:</strong> 
                <span style="color: #059669; font-weight: 600;">${subscriberEmail}</span>
              </p>
              <p style="margin: 8px 0; color: #374151;">
                <strong>Subscribed:</strong> ${formattedDate}
              </p>
              <p style="margin: 8px 0; color: #374151;">
                <strong>Status:</strong> 
                <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">ACTIVE</span>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${
                process.env.FRONTEND_URL || "https://harari-ebdal.vercel.app"
              }/admin" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmailWithRetry(transporter, mailOptions);
    console.log(
      `✅ Admin notification sent for new subscriber: ${subscriberEmail}`
    );
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error.message);
    throw error;
  }
}

// Test email configuration
export async function testEmailConnection() {
  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      return false;
    }

    await transporter.verify();
    return true;
  } catch (error) {
    console.error("❌ Email connection test failed:", error.message);
    return false;
  }
}
