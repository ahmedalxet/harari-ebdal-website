// Database utility functions for Vercel deployment
// This handles both file-based storage (dev) and cloud storage (production)

import { MongoClient } from "mongodb";

let cachedClient = null;

// MongoDB connection (for production)
async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in environment variables");
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Generic database operations
export async function getCollection(collectionName) {
  const client = await connectToDatabase();
  return client.db("harari_ebdal").collection(collectionName);
}

// Subscribers operations
export async function getSubscribers() {
  try {
    const collection = await getCollection("subscribers");
    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }
}

export async function addSubscriber(subscriberData) {
  try {
    const collection = await getCollection("subscribers");
    const result = await collection.insertOne({
      ...subscriberData,
      _id: subscriberData.id,
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error("Error adding subscriber:", error);
    throw error;
  }
}

export async function updateSubscriber(id, updateData) {
  try {
    const collection = await getCollection("subscribers");
    const result = await collection.updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result;
  } catch (error) {
    console.error("Error updating subscriber:", error);
    throw error;
  }
}

export async function deleteSubscriber(id) {
  try {
    const collection = await getCollection("subscribers");
    const result = await collection.deleteOne({ _id: id });
    return result;
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    throw error;
  }
}

// Donations operations
export async function getDonations() {
  try {
    const collection = await getCollection("donations");
    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
}

export async function addDonation(donationData) {
  try {
    const collection = await getCollection("donations");
    const result = await collection.insertOne({
      ...donationData,
      _id: donationData.id,
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error("Error adding donation:", error);
    throw error;
  }
}

// Newsletters operations
export async function getNewsletters() {
  try {
    const collection = await getCollection("newsletters");
    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return [];
  }
}

export async function addNewsletter(newsletterData) {
  try {
    const collection = await getCollection("newsletters");
    const result = await collection.insertOne({
      ...newsletterData,
      _id: newsletterData.id,
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error("Error adding newsletter:", error);
    throw error;
  }
}

// Utility function to generate unique IDs
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Helper function for CORS headers
export function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}
