#!/usr/bin/env node

/**
 * Deployment script for Harari EBDAL Website
 * This script helps with building and deploying to Vercel
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";

const requiredEnvVars = [
  "MONGODB_URI",
  "BREVO_EMAIL",
  "BREVO_SMTP_LOGIN",
  "BREVO_SMTP_PASSWORD",
  "STRIPE_SECRET_KEY",
  "ADMIN_SECRET",
];

function checkEnvironmentVariables() {
  console.log("🔍 Checking environment variables...");

  if (!existsSync(".env")) {
    console.log(
      "⚠️  No .env file found. Make sure to set up environment variables in Vercel."
    );
    return false;
  }

  const envContent = readFileSync(".env", "utf8");
  const missingVars = requiredEnvVars.filter(
    (varName) =>
      !envContent.includes(varName) ||
      !envContent.match(new RegExp(`${varName}=.+`))
  );

  if (missingVars.length > 0) {
    console.log("❌ Missing required environment variables:");
    missingVars.forEach((varName) => console.log(`   - ${varName}`));
    return false;
  }

  console.log("✅ All required environment variables are present");
  return true;
}

function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: "inherit" });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function main() {
  console.log("🚀 Starting Harari EBDAL Website deployment...\n");

  // Check environment variables
  checkEnvironmentVariables();

  // Install dependencies
  runCommand("npm install", "Installing dependencies");

  // Run linting
  runCommand("npm run lint", "Running linter");

  // Build the project
  runCommand("npm run build", "Building project");

  // Check if Vercel CLI is installed
  try {
    execSync("vercel --version", { stdio: "pipe" });
  } catch (error) {
    console.log("⚠️  Vercel CLI not found. Installing...");
    runCommand("npm install -g vercel", "Installing Vercel CLI");
  }

  // Deploy to Vercel
  console.log("\n🚀 Deploying to Vercel...");
  console.log(
    "   Make sure you have set up your environment variables in Vercel dashboard"
  );
  console.log(
    "   Visit: https://vercel.com/dashboard > Your Project > Settings > Environment Variables\n"
  );

  try {
    execSync("vercel --prod", { stdio: "inherit" });
    console.log("\n✅ Deployment completed successfully!");
    console.log("\n📋 Post-deployment checklist:");
    console.log("   1. Test the health endpoint: /api/health");
    console.log("   2. Test email configuration: /api/test-email");
    console.log("   3. Set up Stripe webhook with your new domain");
    console.log("   4. Update FRONTEND_URL in environment variables");
    console.log("   5. Test the complete subscription flow");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main();
