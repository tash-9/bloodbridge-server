import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";

async function seed() {
  const db = await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@bloodbridge.test";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin12345";

  const existing = await db.collection("users").findOne({ email: adminEmail });
  if (existing) {
    await db.collection("users").updateOne({ email: adminEmail }, { $set: { role: "admin", status: "active" } });
    console.log(`Admin user already exists (${adminEmail}), role enforced.`);
  } else {
    await db.collection("users").insertOne({
      email: adminEmail,
      name: "BloodBridge Admin",
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=Admin`,
      bloodGroup: "O+",
      district: "Dhaka",
      upazila: "Dhanmondi",
      role: "admin",
      status: "active",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      createdAt: new Date(),
    });
    console.log(`Admin user created: ${adminEmail}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
