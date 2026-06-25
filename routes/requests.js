import express from "express";
import { connectDB } from "../config/db.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { oid, pageOptions, statuses } from "../utils.js";

const router = express.Router();

router.get("/public", async (req, res) => {
  try {
    const db = await connectDB();
    const items = await db
      .collection("donationRequests")
      .find({ status: "pending" })
      .sort({ donationDate: 1 })
      .toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const { page, limit, skip } = pageOptions(req);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    if (req.user.role === "donor" || req.query.mine === "true") {
      filter.requesterEmail = req.user.email;
    }

    const [items, total] = await Promise.all([
      db.collection("donationRequests").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection("donationRequests").countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const item = await db.collection("donationRequests").findOne({ _id: oid(req.params.id) });
    if (!item) return res.status(404).json({ message: "Donation request not found" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch request" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.status === "blocked") {
      return res.status(403).json({ message: "Blocked users cannot create donation requests" });
    }
    const required = ["recipientName", "recipientDistrict", "recipientUpazila", "hospitalName", "address", "bloodGroup", "donationDate", "donationTime", "message"];
    const missing = required.filter((k) => !req.body[k]);
    if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });

    const db = await connectDB();
    const doc = {
      ...Object.fromEntries(required.map((k) => [k, req.body[k]])),
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      status: "pending",
      donorName: "",
      donorEmail: "",
      createdAt: new Date(),
    };
    const result = await db.collection("donationRequests").insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create request" });
  }
});


router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const request = await db.collection("donationRequests").findOne({ _id: oid(req.params.id) });
    if (!request) return res.status(404).json({ message: "Donation request not found" });

    const canEdit = req.user.role === "admin" || request.requesterEmail === req.user.email;
    if (!canEdit) return res.status(403).json({ message: "Forbidden" });

    const fields = ["recipientName", "recipientDistrict", "recipientUpazila", "hospitalName", "address", "bloodGroup", "donationDate", "donationTime", "message"];
    const update = {};
    fields.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    await db.collection("donationRequests").updateOne({ _id: request._id }, { $set: update });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update request" });
  }
});


router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    if (!statuses.includes(req.body.status)) {
      return res.status(400).json({ message: `Status must be one of: ${statuses.join(", ")}` });
    }
    const db = await connectDB();
    const request = await db.collection("donationRequests").findOne({ _id: oid(req.params.id) });
    if (!request) return res.status(404).json({ message: "Donation request not found" });

    const owner = request.requesterEmail === req.user.email;
    const assignedDonor = request.donorEmail === req.user.email;
    const manager = ["admin", "volunteer"].includes(req.user.role);

    if (!owner && !assignedDonor && !manager) {
      return res.status(403).json({ message: "Forbidden" });
    }


    const update = { status: req.body.status };
    if (req.body.status === "inprogress") {
      update.donorName = req.user.name;
      update.donorEmail = req.user.email;
    }
    await db.collection("donationRequests").updateOne({ _id: request._id }, { $set: update });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
});


router.delete("/:id", verifyToken, requireRole("admin", "donor"), async (req, res) => {
  try {
    const db = await connectDB();
    const request = await db.collection("donationRequests").findOne({ _id: oid(req.params.id) });
    if (!request) return res.status(404).json({ message: "Donation request not found" });

    if (req.user.role !== "admin" && request.requesterEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await db.collection("donationRequests").deleteOne({ _id: request._id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete request" });
  }
});

export default router;
