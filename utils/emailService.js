import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send welcome email to subscriber
export async function sendWelcomeEmail(toEmail) {
  await transporter.sendMail({
    from: `"Harari EBDAL Mugad" <${process.env.EMAIL_USER}>`,
    to: toEmail,
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
            You'll receive updates about:
          </p>
          
          <ul style="color: #666; line-height: 1.8;">
            <li>Cultural events and festivals</li>
            <li>Educational programs</li>
            <li>Community initiatives</li>
            <li>Heritage preservation projects</li>
          </ul>
          
          <div style="margin: 30px 0; padding: 20px; background: white; border-left: 4px solid #f59e0b; border-radius: 5px;">
            <p style="margin: 0; color: #666; font-style: italic;">
              "Culture is the widening of the mind and of the spirit." - Jawaharlal Nehru
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Visit Our Website
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              You can <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(toEmail)}" style="color: #f59e0b;">unsubscribe</a> at any time.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

// Send notification email to admin when someone subscribes
export async function sendAdminNotification(subscriberEmail) {
  if (!process.env.ADMIN_EMAIL) {
    console.log('⚠️  Admin email not configured in environment variables');
    return;
  }

  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    await transporter.sendMail({
      from: `"Harari EBDAL System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '🔔 New Subscriber Alert - Harari EBDAL',
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
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 5px 5px 0;">
              <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📊 Quick Actions</h3>
              <p style="margin: 5px 0; color: #78350f;">
                • Add to your email marketing list<br>
                • Send personalized welcome message<br>
                • Update subscriber analytics
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/admin/subscribers?email=${encodeURIComponent(subscriberEmail)}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View All Subscribers
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated notification from your Harari EBDAL website.<br>
                Subscriber total: Check your admin dashboard for current count.
              </p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log(`✅ Admin notification sent for new subscriber: ${subscriberEmail}`);
    
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error.message);
  }
}

// Send bulk email to all subscribers (admin function)
export async function sendBulkEmail(subject, htmlContent, subscribers) {
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    throw new Error('No subscribers provided');
  }

  const results = {
    successful: [],
    failed: []
  };

  for (const subscriber of subscribers) {
    try {
      await transporter.sendMail({
        from: `"Harari EBDAL" <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: subject,
        html: htmlContent,
      });
      
      results.successful.push(subscriber.email);
      console.log(`✅ Email sent to: ${subscriber.email}`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.failed.push({ email: subscriber.email, error: error.message });
      console.error(`❌ Failed to send email to ${subscriber.email}:`, error.message);
    }
  }

  return results;
}

// Test email configuration
export async function testEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
}