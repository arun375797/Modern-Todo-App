import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function protect(c, next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return c.json({ message: "Not authorized, no token" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET);
    const db = await getDB(c.env);

    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(decoded.id) },
        { projection: { password: 0 } },
      );

    if (!user) {
      return c.json({ message: "Not authorized, user not found" }, 401);
    }

    // Attach user to context
    c.set("user", user);
    await next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return c.json({ message: "Not authorized, token failed" }, 401);
  }
}
