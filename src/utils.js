import jwt from "jsonwebtoken";
import { ObjectId } from "./config/db.js";

export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const statuses = ["pending", "inprogress", "done", "canceled"];

export function signUser(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export function oid(id) {
  if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
  return new ObjectId(id);
}

export function pageOptions(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}
