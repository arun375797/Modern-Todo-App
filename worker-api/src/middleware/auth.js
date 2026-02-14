import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

// Helper function to get CORS origin (same as in index.js)
function getCorsOrigin(origin) {
  if (!origin) return null;
  if (origin.includes(".vercel.app")) return origin;
  if (
    origin.includes("localhost:3000") ||
    origin.includes("localhost:5173") ||
    origin.startsWith("http://localhost:")
  ) {
    return origin;
  }
  return origin;
}

// Helper to add CORS headers to response
function addCorsHeaders(c) {
  const origin = c.req.header("Origin");
  const allowedOrigin = getCorsOrigin(origin);
  
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
  
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }
  
  return headers;
}

export async function protect(c, next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return c.json({ message: "Not authorized, no token" }, 401, addCorsHeaders(c));
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
      return c.json({ message: "Not authorized, user not found" }, 401, addCorsHeaders(c));
    }

    // Attach user to context
    c.set("user", user);
    await next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return c.json({ message: "Not authorized, token failed" }, 401, addCorsHeaders(c));
  }
}
