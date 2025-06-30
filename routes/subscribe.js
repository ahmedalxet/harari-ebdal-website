import express from "express";
import { sendWelcomeEmail, sendAdminNotification } from "../utils/emailService.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// File to store subscribers (optional - for admin dashboard later)
const SUBSCRIBERS_FILE = path.join(__dirname, '..', 'data', 'subscribers.json');

// Initialize data directory and file
async function initializeStorage() {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    try {
      await fs.access(SUBSCRIBERS_FILE);
    } catch {
      await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Save subscriber to file
async function saveSubscriber(email) {
  try {
    await initializeStorage();
    
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
    const subscribers = JSON.parse(data);
    
    // Check if email already exists
    const existingSubscriber = subscribers.find(sub => sub.email === email);
    if (existingSubscriber) {
      return { isNew: false, subscriber: existingSubscriber };
    }
    
    // Add new subscriber
    const newSubscriber = {
      email,
      subscribedAt: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    subscribers.push(newSubscriber);
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
    
    return { isNew: true, subscriber: newSubscriber };
  } catch (error) {
    console.error('Error saving subscriber:', error);
    throw error;
  }
}

router.post("/", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  try {
    // Save subscriber to file
    const { isNew, subscriber } = await saveSubscriber(email.toLowerCase().trim());
    
    if (!isNew) {
      return res.status(200).json({ 
        message: "You're already subscribed to our newsletter!",
        alreadySubscribed: true 
      });
    }

    // Send welcome email to subscriber
    await sendWelcomeEmail(email);
    
    // Send notification to admin
    await sendAdminNotification(email);
    
    console.log(`New subscriber: ${email} at ${new Date().toISOString()}`);
    
    res.status(200).json({ 
      message: "Successfully subscribed! Welcome to Harari EBDAL community.",
      success: true 
    });
    
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ 
      error: "Failed to process subscription. Please try again later." 
    });
  }
});

// Get all subscribers (for admin use)
router.get("/admin/list", async (req, res) => {
  try {
    // Simple auth check - you should implement proper admin authentication
    const { adminKey } = req.query;
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    await initializeStorage();
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
    const subscribers = JSON.parse(data);
    
    res.json({
      subscribers: subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt)),
      total: subscribers.length
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

export default router;