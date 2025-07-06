// Donation statistics endpoint
import { getDonations, corsHeaders } from "../utils/database.js";

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
      const donations = await getDonations();
      const completedDonations = donations.filter(
        (d) => d.status === "completed"
      );
      const totalAmount = completedDonations.reduce(
        (sum, d) => sum + d.amount,
        0
      );
      const totalDonations = completedDonations.length;
      const averageDonation =
        totalDonations > 0 ? totalAmount / totalDonations : 0;

      res.status(200).json({
        totalAmount: Number(totalAmount.toFixed(2)),
        totalDonations,
        averageDonation: Number(averageDonation.toFixed(2)),
      });
    } catch (error) {
      console.error("Error getting donation stats:", error);
      res.status(500).json({ error: "Failed to get donation statistics" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
