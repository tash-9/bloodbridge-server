import express from "express";
import Stripe from "stripe";
import { connectDB } from "../config/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

// GET /api/funding — list all funds
router.get("/", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const items = await db.collection("funds").find().sort({ fundingDate: -1 }).toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch funding records" });
  }
});

// POST /api/funding/payment-intent — create stripe payment intent
router.post("/payment-intent", verifyToken, async (req, res) => {
  try {
    const amount = Math.round(Number(req.body.amount) * 100);
    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Minimum fund amount is $1.00 USD" });
    }
    const intent = await getStripe().paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { email: req.user.email, name: req.user.name },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
});

// POST /api/funding — record a completed fund
router.post("/", verifyToken, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "A valid amount is required" });
    }
    const db = await connectDB();
    const doc = {
      userName: req.user.name,
      userEmail: req.user.email,
      amount,
      fundingDate: new Date(),
      paymentIntentId: req.body.paymentIntentId || "",
    };
    const result = await db.collection("funds").insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record funding" });
  }
});

export default router;
