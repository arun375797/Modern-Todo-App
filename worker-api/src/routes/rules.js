import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const rules = new Hono();

// Helper: Get ID string from document
function getId(doc) {
  if (!doc._id) return null;
  return doc._id.toString();
}

function getUserId(doc) {
  if (!doc.user) return null;
  return doc.user.toString();
}

// Helper to get CORS origin
function getCorsOrigin(origin) {
  if (!origin) return null;
  if (origin.includes(".vercel.app")) return origin;
  if (
    origin.includes("localhost:3000") ||
    origin.includes("localhost:5173") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:")
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
  } else if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  
  return headers;
}

// All rule routes require auth
rules.use("/*", protect);

// GET /api/v1/rules
rules.get("/", async (c) => {
  try {
    const user = c.get("user");
    const userId = user._id; // ObjectId
    const db = await getDB(c.env);

    const result = await db
      .collection("rules")
      .find({ user: userId }, { sort: { order: 1 } })
      .toArray();

    const formatted = result.map((r) => ({
      ...r,
      _id: getId(r),
      user: getUserId(r),
    }));

    return c.json(formatted);
  } catch (error) {
    console.error("Error in GET /rules:", error);
    return c.json(
      { message: error.message || "Internal Server Error" },
      500,
      addCorsHeaders(c)
    );
  }
});

// POST /api/v1/rules
rules.post("/", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const userId = user._id; // ObjectId

    if (!body.text) {
      return c.json({ message: "Please add text" }, 400, addCorsHeaders(c));
    }

  const db = await getDB(c.env);
  const rulesCol = db.collection("rules");

  // Find max order
  const existingRules = await rulesCol
    .find({ user: userId }, { sort: { order: -1 }, limit: 1 })
    .toArray();

  const newOrder = existingRules.length > 0 ? existingRules[0].order + 1 : 0;

  const rule = {
    user: userId,
    text: body.text,
    order: newOrder,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await rulesCol.insertOne(rule);

    return c.json({
      ...rule,
      _id: result.insertedId.toString(),
      user: userId.toString(),
    });
  } catch (error) {
    console.error("Error in POST /rules:", error);
    return c.json(
      { message: error.message || "Internal Server Error" },
      500,
      addCorsHeaders(c)
    );
  }
});

// PUT /api/v1/rules/:id
rules.put("/:id", async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = await c.req.json();
    const userId = user._id; // ObjectId

    const db = await getDB(c.env);
    const rulesCol = db.collection("rules");

    let matchQuery;
    try {
      matchQuery = { _id: new ObjectId(id) };
    } catch (e) {
      return c.json({ message: "Invalid ID format" }, 400, addCorsHeaders(c));
    }

    const rule = await rulesCol.findOne(matchQuery);

    if (!rule) {
      return c.json({ message: "Rule not found" }, 400, addCorsHeaders(c));
    }

    if (rule.user.toString() !== userId.toString()) {
      return c.json({ message: "User not authorized" }, 401, addCorsHeaders(c));
    }

  const { _id, user: _user, ...updateData } = body;
  updateData.updatedAt = new Date();

  await rulesCol.updateOne(matchQuery, { $set: updateData });

  const updatedRule = await rulesCol.findOne(matchQuery);

    return c.json({
      ...updatedRule,
      _id: getId(updatedRule),
      user: getUserId(updatedRule),
    });
  } catch (error) {
    console.error("Error in PUT /rules:", error);
    return c.json(
      { message: error.message || "Internal Server Error" },
      500,
      addCorsHeaders(c)
    );
  }
});

// DELETE /api/v1/rules/:id
rules.delete("/:id", async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    const userId = user._id; // ObjectId

    const db = await getDB(c.env);
    const rulesCol = db.collection("rules");

    let matchQuery;
    try {
      matchQuery = { _id: new ObjectId(id) };
    } catch (e) {
      return c.json({ message: "Invalid ID format" }, 400, addCorsHeaders(c));
    }

    const rule = await rulesCol.findOne(matchQuery);

    if (!rule) {
      return c.json({ message: "Rule not found" }, 400, addCorsHeaders(c));
    }

    if (rule.user.toString() !== userId.toString()) {
      return c.json({ message: "User not authorized" }, 401, addCorsHeaders(c));
    }

    await rulesCol.deleteOne(matchQuery);

    return c.json({ id });
  } catch (error) {
    console.error("Error in DELETE /rules:", error);
    return c.json(
      { message: error.message || "Internal Server Error" },
      500,
      addCorsHeaders(c)
    );
  }
});

export default rules;
