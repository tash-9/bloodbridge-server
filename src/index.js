import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import requestRoutes from "./routes/requests.js";
import fundingRoutes from "./routes/funding.js";
import statsRoutes from "./routes/stats.js";
import { seedDB } from "./seed.js";

const app = express();
const port = process.env.PORT || 5000;

// CORS
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : true;

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Health check
app.get("/", (req, res) =>
  res.json({ name: "BloodBridge API", status: "healthy", version: "1.0.0" })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/funding", fundingRoutes);
app.use("/api/stats", statsRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

connectDB()
  .then(async () => {
    await seedDB();
    app.listen(port, () =>
      console.log(`BloodBridge API running on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
