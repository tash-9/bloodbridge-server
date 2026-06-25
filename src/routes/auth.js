import express from "express";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { publicUser, signUser } from "../utils.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, name, avatar, bloodGroup, district, upazila, password } = req.body;
    if (!email || !name || !bloodGroup || !district || !upazila || !password) {
      return res.status(400).json({ message: "All registration fields are required" });
    }
    const db = await connectDB();
    const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const user = {
      email: email.toLowerCase(),
      name,
      avatar: avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
      bloodGroup,
      district,
      upazila,
      role: "donor",
      status: "active",
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);
    user._id = result.insertedId;
    res.status(201).json({ token: signUser(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection("users").findOne({
      email: String(req.body.email || "").toLowerCase(),
    });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked. Contact support." });
    }
    res.json({ token: signUser(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, (req, res) => {
  res.json(publicUser(req.user));
});

export default router;
