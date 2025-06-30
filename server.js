import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import subscribeRouter from './routes/subscribe.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 4000;

// File paths for data storage
const DATA_DIR = './data';
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const DONATIONS_FILE = path.join(DATA_DIR, 'donations.json');
const NEWSLETTERS_FILE = path.join(DATA_DIR, 'newsletters.json');

// Initialize data directory and files
const initializeDataStorage = async () => {
  try {
    // Create data directory if it doesn't exist
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('📁 Created data directory');
    }

    // Initialize files if they don't exist
    const files = [
      { path: SUBSCRIBERS_FILE, defaultData: [] },
      { path: DONATIONS_FILE, defaultData: [] },
      { path: NEWSLETTERS_FILE, defaultData: [] }
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        await fs.writeFile(file.path, JSON.stringify(file.defaultData, null, 2));
        console.log(`📄 Created ${path.basename(file.path)}`);
      }
    }

    console.log('💾 File-based storage initialized');
  } catch (error) {
    console.error('Error initializing data storage:', error);
    process.exit(1);
  }
};

// Helper functions for file operations
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Email transporter configuration - Fixed for Brevo SMTP
const createEmailTransporter = () => {
  const brevoEmail = process.env.BREVO_EMAIL;
  const brevoSmtpLogin = process.env.BREVO_SMTP_LOGIN;
  const brevoSmtpPassword = process.env.BREVO_SMTP_PASSWORD;
  
  console.log('🔧 Checking Brevo SMTP configuration...');
  console.log('📧 Brevo Email:', brevoEmail);
  console.log('👤 SMTP Login:', brevoSmtpLogin);
  console.log('🔑 SMTP Password exists:', !!brevoSmtpPassword);
  console.log('🔑 SMTP Password length:', brevoSmtpPassword?.length || 0);
  
  if (!brevoEmail || !brevoSmtpLogin || !brevoSmtpPassword) {
    console.log('⚠️ Brevo SMTP credentials not configured properly');
    console.log('Please set BREVO_EMAIL, BREVO_SMTP_LOGIN, and BREVO_SMTP_PASSWORD in your .env file');
    console.log('Get your SMTP credentials from: Brevo Dashboard → SMTP & API → SMTP tab');
    return null;
  }
  
  console.log('🔧 Creating Brevo SMTP transporter...');
  
  // Brevo SMTP configuration with correct credentials
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
       user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_PASSWORD,
        method: 'LOGIN'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

// Test email connection function
const testEmailConnection = async () => {
  console.log('🧪 Testing Brevo SMTP connection...');
  
  const transporter = createEmailTransporter();
  if (!transporter) {
    console.log('❌ Cannot create Brevo SMTP transporter');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Brevo SMTP connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Brevo SMTP connection failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 SMTP Authentication failed. Please check:');
      console.error('  1. Your Brevo account is active');
      console.error('  2. You have generated SMTP credentials (not API key)');
      console.error('  3. BREVO_SMTP_LOGIN is your SMTP username');
      console.error('  4. BREVO_SMTP_PASSWORD is your SMTP password');
      console.error('  5. Get credentials from: Brevo Dashboard → SMTP & API → SMTP tab');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network error. Check your internet connection.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timeout. Try again later.');
    }
    
    return false;
  }
};

// Send email with retry logic
const sendEmailWithRetry = async (transporter, mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Email attempt ${attempt}/${maxRetries}`);
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error; // Final attempt failed
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Send notification email to admin
const sendAdminNotification = async (subscriberEmail) => {
  if (!process.env.ADMIN_EMAIL) {
    console.log('⚠️ Admin email not configured, skipping notification');
    return;
  }

  console.log('📤 Preparing admin notification...');
  
  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      console.log('❌ Cannot create email transporter for admin notification');
      return;
    }

    const mailOptions = {
      from: `"Harari EBDAL System" <${process.env.BREVO_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '🔔 New Subscriber Alert - Harari EBDAL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Subscriber!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">New Subscription Details</h2>
              <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${subscriberEmail}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" 
                 style="background: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmailWithRetry(transporter, mailOptions);
    console.log(`✅ Admin notification sent successfully for: ${subscriberEmail}`);
    
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error.message);
    // Don't throw - admin notification failure shouldn't break subscription
  }
};

// Send welcome email to subscriber
const sendWelcomeEmail = async (subscriberEmail) => {
  console.log('📤 Preparing welcome email...');
  
  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      console.log('❌ Cannot create email transporter for welcome email');
      return;
    }

    const mailOptions = {
      from: `"Harari EBDAL Mugad" <${process.env.BREVO_EMAIL}>`,
      to: subscriberEmail,
      subject: 'Welcome to Harari EBDAL Newsletter! 🎉',
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
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Visit Our Website
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              If you didn't subscribe to this newsletter, you can 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" 
                 style="color: #f59e0b;">unsubscribe here</a>.
            </p>
          </div>
        </div>
      `,
    };

    await sendEmailWithRetry(transporter, mailOptions);
    console.log(`✅ Welcome email sent successfully to: ${subscriberEmail}`);
    
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    // Don't throw - welcome email failure shouldn't break subscription
  }
};

// CORS Configuration - Allow all origins for development
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'dist')));

// Special middleware for webhook (must be raw)
app.use('/api/webhook', express.raw({type: 'application/json'}));

// JSON middleware for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Subscribe router
app.use('/api/subscribe', subscribeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    timestamp: new Date().toISOString(),
    storage: 'File-based storage active',
    emailService: 'Brevo SMTP'
  });
});

// Email test endpoint - Updated for Brevo SMTP
app.get('/api/test-email', async (req, res) => {
  console.log('🧪 Testing Brevo SMTP configuration...');
  
  const isConnected = await testEmailConnection();
  
  if (isConnected) {
    // Try sending a test email
    try {
      const transporter = createEmailTransporter();
      await transporter.sendMail({
        from: `"Harari EBDAL Test" <${process.env.BREVO_EMAIL}>`,
        to: process.env.ADMIN_EMAIL || process.env.BREVO_EMAIL,
        subject: 'Brevo SMTP Test - Harari EBDAL',
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
        `
      });
      
      res.json({ 
        success: true, 
        message: 'Brevo SMTP test successful! Check your inbox.',
        service: 'Brevo SMTP',
        server: 'smtp-relay.brevo.com',
        port: 587,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Brevo SMTP connection OK but sending failed', 
        error: error.message,
        service: 'Brevo SMTP'
      });
    }
  } else {
    res.status(500).json({ 
      success: false, 
      message: 'Brevo SMTP connection failed. Check your SMTP credentials.',
      service: 'Brevo SMTP',
      help: 'Get SMTP credentials from: Brevo Dashboard → SMTP & API → SMTP tab',
      timestamp: new Date().toISOString()
    });
  }
});
// Serve frontend index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Authentication Routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  console.log('Admin login attempt with password:', password);
  
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }
  
  if (password === process.env.ADMIN_SECRET) {
    console.log('✅ Admin login successful');
    res.json({ success: true, message: 'Admin authenticated successfully' });
  } else {
    console.log('❌ Admin login failed - wrong password');
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

// Get all subscribers (Admin only)
app.get('/api/admin/subscribers', async (req, res) => {
  try {
    console.log('📊 Fetching subscribers...');
    const subscribers = await readJsonFile(SUBSCRIBERS_FILE);
    
    console.log(`Found ${subscribers.length} total subscribers`);
    
    // Filter out unsubscribed users and add ID field
    const activeSubscribers = subscribers
      .filter(sub => sub.status !== 'unsubscribed')
      .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
      .map(sub => ({
        id: sub.id,
        email: sub.email,
        subscribedAt: sub.subscribedAt,
        status: sub.status
      }));
    
    console.log(`Returning ${activeSubscribers.length} active subscribers`);
    res.json(activeSubscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// Delete subscriber (Admin only)
app.delete('/api/admin/subscribers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subscribers = await readJsonFile(SUBSCRIBERS_FILE);
    
    const updatedSubscribers = subscribers.filter(sub => sub.id !== id);
    
    if (subscribers.length === updatedSubscribers.length) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    
    await writeJsonFile(SUBSCRIBERS_FILE, updatedSubscribers);
    console.log(`🗑️ Removed subscriber with ID: ${id}`);
    res.json({ success: true, message: 'Subscriber removed successfully' });
  } catch (error) {
    console.error('Error removing subscriber:', error);
    res.status(500).json({ success: false, message: 'Failed to remove subscriber' });
  }
});

// Newsletter subscription endpoint
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 New subscription attempt:', email);
    
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email address format' 
      });
    }

    const subscribers = await readJsonFile(SUBSCRIBERS_FILE);
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists
    const existingSubscriber = subscribers.find(sub => sub.email === normalizedEmail);
    let isNewSubscriber = false;

    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        // Resubscribe user
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = new Date().toISOString();
        isNewSubscriber = true;
        console.log('♻️ Resubscribed user:', email);
      } else {
        console.log('⚠️ User already subscribed:', email);
        return res.status(200).json({ 
          success: true, 
          message: 'You are already subscribed to our newsletter!',
          isNew: false
        });
      }
    } else {
      // Add new subscriber
      const newSubscriber = {
        id: generateId(),
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        status: 'active'
      };
      subscribers.push(newSubscriber);
      isNewSubscriber = true;
      console.log('✅ New subscriber added:', email);
    }

    // Save to file
    if (isNewSubscriber) {
      await writeJsonFile(SUBSCRIBERS_FILE, subscribers);
      console.log('💾 Subscribers file updated');
    }

    // Send emails in parallel (don't wait for them to complete)
    if (process.env.BREVO_SMTP_LOGIN && process.env.BREVO_SMTP_PASSWORD) {
      console.log('📧 Sending emails via Brevo SMTP...');
      
      // Send both emails without waiting (fire and forget)
      Promise.all([
        sendWelcomeEmail(normalizedEmail).catch(err => 
          console.error('Welcome email failed:', err.message)
        ),
        isNewSubscriber ? sendAdminNotification(normalizedEmail).catch(err => 
          console.error('Admin notification failed:', err.message)
        ) : Promise.resolve()
      ]).then(() => {
        console.log('📧 Email sending process completed');
      }).catch(err => {
        console.error('Email process error:', err.message);
      });
    } else {
      console.log('⚠️ Brevo SMTP not configured, skipping email sending');
    }

    // Respond immediately (don't wait for emails)
    res.status(200).json({ 
      success: true, 
      message: isNewSubscriber 
        ? 'Successfully subscribed! Welcome email will be sent shortly.' 
        : 'Welcome back! You have been resubscribed.',
      isNew: isNewSubscriber
    });

  } catch (error) {
    console.error('❌ Subscription error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Subscription failed. Please try again later.' 
    });
  }
});

// Get subscriber count
app.get('/api/subscribers/count', async (req, res) => {
  try {
    const subscribers = await readJsonFile(SUBSCRIBERS_FILE);
    const count = subscribers.filter(sub => sub.status !== 'unsubscribed').length;
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    res.status(500).json({ error: 'Failed to get subscriber count' });
  }
});

// Unsubscribe endpoint
app.post('/api/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subscribers = await readJsonFile(SUBSCRIBERS_FILE);
    const subscriber = subscribers.find(sub => sub.email === email.toLowerCase());
    
    if (subscriber) {
      subscriber.status = 'unsubscribed';
      subscriber.unsubscribedAt = new Date().toISOString();
      await writeJsonFile(SUBSCRIBERS_FILE, subscribers);
      console.log('👋 User unsubscribed:', email);
    }

    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency = 'usd', donorEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Donation to Harari Culture Preservation',
            description: 'Supporting the preservation of Harari culture for future generations',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
      customer_email: donorEmail,
      metadata: {
        donation_amount: amount.toString(),
        currency: currency,
        timestamp: new Date().toISOString(),
        donor_email: donorEmail || ''
      }
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Webhook to handle successful payments
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session);
      
      try {
        const donations = await readJsonFile(DONATIONS_FILE);
        const donation = {
          id: generateId(),
          sessionId: session.id,
          amount: session.amount_total / 100,
          currency: session.currency,
          donorEmail: session.customer_email,
          status: 'completed',
          createdAt: new Date().toISOString(),
          metadata: session.metadata
        };
        donations.push(donation);
        await writeJsonFile(DONATIONS_FILE, donations);
      } catch (err) {
        console.error('Error saving donation:', err);
      }
      
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Get session details
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// Get donation statistics
app.get('/api/donations/stats', async (req, res) => {
  try {
    const donations = await readJsonFile(DONATIONS_FILE);
    const completedDonations = donations.filter(d => d.status === 'completed');
    const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = completedDonations.length;
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;
    
    res.json({
      totalAmount: Number(totalAmount.toFixed(2)),
      totalDonations,
      averageDonation: Number(averageDonation.toFixed(2))
    });
  } catch (error) {
    console.error('Error getting donation stats:', error);
    res.status(500).json({ error: 'Failed to get donation statistics' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize data storage and start server
// Replace lines ~450-458 in your server.js with this:

const startServer = async () => {
  await initializeDataStorage();
  
  // Test email configuration on startup
  console.log('🧪 Testing Brevo email configuration on startup...');
  const emailWorking = await testEmailConnection();
  
  if (emailWorking) {
    console.log('✅ Brevo email system ready');
  } else {
    console.log('⚠️ Brevo email system not working - subscriptions will work but no emails will be sent');
  }
  
  // Dynamic base URL for logging
  const baseUrl = process.env.RAILWAY_STATIC_URL 
    ? `https://${process.env.RAILWAY_STATIC_URL}`
    : process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL
    : `http://localhost:${PORT}`;
  
  app.listen(PORT, '0.0.0.0', () => { // Important: bind to 0.0.0.0 for Railway
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Health check: ${baseUrl}/health`);
    console.log(`🧪 Email test: ${baseUrl}/api/test-email`);
    console.log(`👨‍💼 Admin portal: ${baseUrl}/admin`);
    console.log(`📧 Newsletter API: ${baseUrl}/api/subscribe`);
    console.log(`💳 Stripe API: ${baseUrl}/api/create-checkout-session`);
    console.log(`💾 Using file-based storage in ./data/ directory`);
    console.log(`🔑 Admin password: ${process.env.ADMIN_SECRET}`);
    console.log(`📧 Email status: ${emailWorking ? '✅ Working' : '❌ Not configured'}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { app };