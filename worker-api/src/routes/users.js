import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const users = new Hono();

// Helper
function getId(doc) {
  if (!doc._id) return null;
  return doc._id.toString();
}

// All user routes require auth
users.use("/*", protect);

// PUT /api/v1/users/preferences
users.put("/preferences", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const userId = user._id; // ObjectId

  const db = await getDB(c.env);
  const usersCol = db.collection("users");

  // Build the update object for nested preferences
  const updateFields = {};

  if (body.theme) updateFields["preferences.theme"] = body.theme;
  if (body.font) updateFields["preferences.font"] = body.font;
  if (body.alarmSound) updateFields["preferences.alarmSound"] = body.alarmSound;

  // Allow setting empty string for textColor
  if (Object.prototype.hasOwnProperty.call(body, "textColor")) {
    updateFields["preferences.textColor"] = body.textColor;
  }

  if (body.background) {
    if (body.background.type) {
      updateFields["preferences.background.type"] = body.background.type;
    }
    if (body.background.value !== undefined) {
      updateFields["preferences.background.value"] = body.background.value;
    }
  }

  if (body.overlay) {
    if (body.overlay.dim !== undefined) {
      updateFields["preferences.overlay.dim"] = body.overlay.dim;
    }
    if (body.overlay.blur !== undefined) {
      updateFields["preferences.overlay.blur"] = body.overlay.blur;
    }
  }

  updateFields.updatedAt = new Date();

  await usersCol.updateOne({ _id: userId }, { $set: updateFields });

  const updatedUser = await usersCol.findOne(
    { _id: userId },
    { projection: { password: 0 } },
  );

  return c.json(updatedUser.preferences);
});

// POST /api/v1/users/upload/background
// Upload image to Cloudinary via their REST API, then save URL in MongoDB
users.post("/upload/background", async (c) => {
  const user = c.get("user");
  const userId = user._id; // ObjectId
  const formData = await c.req.formData();
  const file = formData.get("image");

  if (!file) {
    return c.json({ message: "No file uploaded" }, 400);
  }

  // Upload to Cloudinary using their upload API
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${c.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  const timestamp = Math.round(Date.now() / 1000);

  // Create signature for signed upload
  const signatureString = `folder=antigravity_uploads&timestamp=${timestamp}${c.env.CLOUDINARY_API_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("folder", "antigravity_uploads");
  uploadFormData.append("timestamp", timestamp.toString());
  uploadFormData.append("api_key", c.env.CLOUDINARY_API_KEY);
  uploadFormData.append("signature", signature);

  const cloudinaryRes = await fetch(cloudinaryUrl, {
    method: "POST",
    body: uploadFormData,
  });

  if (!cloudinaryRes.ok) {
    const err = await cloudinaryRes.text();
    console.error("Cloudinary upload error:", err);
    return c.json({ message: "Failed to upload image" }, 500);
  }

  const cloudinaryData = await cloudinaryRes.json();
  const imageUrl = cloudinaryData.secure_url;

  // Update user preferences
  const db = await getDB(c.env);
  await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        "preferences.background.type": "upload",
        "preferences.background.value": imageUrl,
        updatedAt: new Date(),
      },
    },
  );

  const updatedUser = await db
    .collection("users")
    .findOne({ _id: userId }, { projection: { password: 0 } });

  return c.json({
    url: imageUrl,
    preferences: updatedUser.preferences,
  });
});

export default users;
