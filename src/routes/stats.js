import express from "express";
import { connectDB } from "../config/db.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/stats — admin and volunteer dashboard stats
router.get("/", verifyToken, requireRole("admin", "volunteer"), async (req, res) => {
  try {
    const db = await connectDB();
    const [donors, requests, fundsAgg, chart] = await Promise.all([
      db.collection("users").countDocuments({ role: "donor" }),
      db.collection("donationRequests").countDocuments(),
      db.collection("funds").aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).toArray(),
      db.collection("donationRequests").aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]).toArray(),
    ]);
    res.json({
      donors,
      requests,
      funding: fundsAgg[0]?.total || 0,
      chart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
