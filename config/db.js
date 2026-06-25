import { MongoClient, ObjectId } from "mongodb";

let client;
let db;

export async function connectDB() {
  if (db) return db;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI environment variable is required");
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("donationRequests").createIndex({ status: 1 });
  await db.collection("donationRequests").createIndex({ requesterEmail: 1 });
  console.log("Connected to MongoDB");
  return db;
}

export { ObjectId };
