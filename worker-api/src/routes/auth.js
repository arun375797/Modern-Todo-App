import { Hono } from "hono";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const auth = new Hono();

// Helper: Generate JWT
async function generateToken(id, env) {
  return await sign(
    {
      id,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    },
    env.JWT_SECRET,
  );
}

// Helper: Extract _id string from MongoDB document
function getId(doc) {
  if (!doc._id) return null;
  return doc._id.toString();
}

// POST /api/v1/auth/google
auth.post("/google", async (c) => {
  try {
    const { token } = await c.req.json();

    if (!token) {
      return c.json({ message: "No token provided" }, 400, addCorsHeaders(c));
    }

    // Verify Google Token
    // Using Google's tokeninfo endpoint is simple and works in Workers
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
    );

    if (!googleRes.ok) {
      console.error(
        "Google token verification failed:",
        await googleRes.text(),
      );
      return c.json({ message: "Invalid Google token" }, 401);
    }

    const googleData = await googleRes.json();
    console.log("Google Data received:", googleData.email);
    const { email, name, sub, picture } = googleData;

    const db = await getDB(c.env);
    const usersCol = db.collection("users");

    // Check if user exists
    let user = await usersCol.findOne({ email });

    if (user) {
      // Update user with latest google info if needed (e.g. picture)
      // Also ensure googleId is set if they previously signed up with password
      await usersCol.updateOne(
        { _id: user._id },
        {
          $set: {
            googleId: sub,
            picture: picture || user.picture,
            updatedAt: new Date(),
          },
        },
      );
    } else {
      // Create new user
      const preferences = {
        theme: "calm",
        background: { type: "none", value: "" },
        overlay: { dim: 0, blur: 0 },
        font: "Inter",
        textColor: "",
        alarmSound: "beep",
      };

      const result = await usersCol.insertOne({
        name,
        email,
        googleId: sub,
        picture,
        preferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const userId = result.insertedId;

      // Seed data for new user
      try {
        const rulesCol = db.collection("rules");
        const todosCol = db.collection("todos");

        await rulesCol.insertMany([
          {
            user: userId,
            text: "Drink 3L of water",
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            user: userId,
            text: "Read 10 pages",
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        const today = new Date().toISOString().split("T")[0];
        await todosCol.insertMany([
          {
            user: userId,
            title: "Welcome to Antigravity! 🚀",
            date: today,
            priority: "P1",
            time: "09:00",
            color: "#3b82f6",
            notes: "This is your first todo. Click to see details or edit it.",
            completed: false,
            dayLabel: "Today",
            links: [],
            subtasks: [],
            textColor: "#000000",
            goalTime: 0,
            timeSpent: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      } catch (err) {
        console.error("Error seeding data:", err);
      }

      // Fetch the newly created user
      user = await usersCol.findOne({ _id: userId });
    }

    const userIdStr = getId(user);

    return c.json({
      _id: userIdStr,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: await generateToken(userIdStr, c.env),
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error in POST /api/v1/auth/google:", error);
    // Throw error to let global error handler in index.js handle it with proper CORS headers
    throw error;
  }
});

// GET /api/v1/auth/me
auth.get("/me", protect, async (c) => {
  try {
    const user = c.get("user");
    return c.json({
      _id: getId(user),
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/auth/me:", error);
    throw error;
  }
});

export default auth;
