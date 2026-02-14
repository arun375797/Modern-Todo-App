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

// All rule routes require auth
rules.use("/*", protect);

// GET /api/v1/rules
rules.get("/", async (c) => {
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
});

// POST /api/v1/rules
rules.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const userId = user._id; // ObjectId

  if (!body.text) {
    return c.json({ message: "Please add text" }, 400);
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
});

// PUT /api/v1/rules/:id
rules.put("/:id", async (c) => {
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
    return c.json({ message: "Invalid ID format" }, 400);
  }

  const rule = await rulesCol.findOne(matchQuery);

  if (!rule) {
    return c.json({ message: "Rule not found" }, 400);
  }

  if (rule.user.toString() !== userId.toString()) {
    return c.json({ message: "User not authorized" }, 401);
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
});

// DELETE /api/v1/rules/:id
rules.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const userId = user._id; // ObjectId

  const db = await getDB(c.env);
  const rulesCol = db.collection("rules");

  let matchQuery;
  try {
    matchQuery = { _id: new ObjectId(id) };
  } catch (e) {
    return c.json({ message: "Invalid ID format" }, 400);
  }

  const rule = await rulesCol.findOne(matchQuery);

  if (!rule) {
    return c.json({ message: "Rule not found" }, 400);
  }

  if (rule.user.toString() !== userId.toString()) {
    return c.json({ message: "User not authorized" }, 401);
  }

  await rulesCol.deleteOne(matchQuery);

  return c.json({ id });
});

export default rules;
