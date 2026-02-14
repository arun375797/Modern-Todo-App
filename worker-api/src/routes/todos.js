import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const todos = new Hono();

// Helper: Get ID string from document
function getId(doc) {
  if (!doc._id) return null;
  return doc._id.toString();
}

function getUserId(doc) {
  if (!doc.user) return null;
  return doc.user.toString();
}

// All todo routes require auth
todos.use("/*", protect);

// GET /api/v1/todos
todos.get("/", async (c) => {
  const user = c.get("user");
  const { date, priority, completed, search, sort } = c.req.query();
  const userId = user._id; // ObjectId

  const db = await getDB(c.env);
  const query = { user: userId };

  if (date) query.date = date;
  if (priority) query.priority = priority;
  if (completed !== undefined && completed !== "") {
    query.completed = completed === "true";
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  let sortObj = { date: 1, time: 1, priority: 1 };
  if (sort) {
    sortObj = {};
    sort.split(",").forEach((field) => {
      const trimmed = field.trim();
      if (trimmed.startsWith("-")) {
        sortObj[trimmed.substring(1)] = -1;
      } else {
        sortObj[trimmed] = 1;
      }
    });
  }

  const result = await db
    .collection("todos")
    .find(query, { sort: sortObj })
    .toArray();

  // Normalize IDs to strings for frontend
  const todosFormatted = result.map((t) => ({
    ...t,
    _id: getId(t),
    user: getUserId(t),
  }));

  return c.json(todosFormatted);
});

// POST /api/v1/todos
todos.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const userId = user._id; // ObjectId

  if (!body.title) {
    return c.json({ message: "Please add a text field" }, 400);
  }

  const db = await getDB(c.env);

  const todo = {
    user: userId,
    dayLabel: body.dayLabel || "Today",
    title: body.title,
    date: body.date || new Date().toISOString().split("T")[0],
    time: body.time || "",
    color: body.color || "#ffffff",
    priority: body.priority || "P4",
    notes: body.notes || "",
    links: body.links || [],
    subtasks: body.subtasks || [],
    textColor: body.textColor || "#000000",
    goalTime: body.goalTime || 0,
    timeSpent: body.timeSpent || 0,
    completed: body.completed || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("todos").insertOne(todo);

  return c.json({
    ...todo,
    _id: result.insertedId.toString(),
    user: userId.toString(),
  });
});

// PUT /api/v1/todos/:id
todos.put("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const userId = user._id; // ObjectId

  const db = await getDB(c.env);
  const todosCol = db.collection("todos");

  let matchQuery;
  try {
    matchQuery = { _id: new ObjectId(id) };
  } catch (e) {
    return c.json({ message: "Invalid ID format" }, 400);
  }

  const todo = await todosCol.findOne(matchQuery);

  if (!todo) {
    return c.json({ message: "Todo not found" }, 400);
  }

  if (todo.user.toString() !== userId.toString()) {
    return c.json({ message: "User not authorized" }, 401);
  }

  // Remove _id and user from body to avoid update errors
  const { _id, user: _user, ...updateData } = body;
  updateData.updatedAt = new Date();

  await todosCol.updateOne(matchQuery, { $set: updateData });

  // Fetch the updated document
  const updatedTodo = await todosCol.findOne(matchQuery);

  return c.json({
    ...updatedTodo,
    _id: getId(updatedTodo),
    user: getUserId(updatedTodo),
  });
});

// DELETE /api/v1/todos/:id
todos.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const userId = user._id; // ObjectId

  const db = await getDB(c.env);
  const todosCol = db.collection("todos");

  let matchQuery;
  try {
    matchQuery = { _id: new ObjectId(id) };
  } catch (e) {
    return c.json({ message: "Invalid ID format" }, 400);
  }

  const todo = await todosCol.findOne(matchQuery);

  if (!todo) {
    return c.json({ message: "Todo not found" }, 400);
  }

  if (todo.user.toString() !== userId.toString()) {
    return c.json({ message: "User not authorized" }, 401);
  }

  await todosCol.deleteOne(matchQuery);

  return c.json({ id });
});

export default todos;
