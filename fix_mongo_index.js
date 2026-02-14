import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

async function fixIndexes() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not found in .env");
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");

    const db = client.db("test"); // Based on your previous logs, your DB is named 'test'
    const users = db.collection("users");

    console.log("Checking indexes on 'users' collection...");
    const indexes = await users.indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    const hasUsernameIndex = indexes.some((idx) => idx.name === "username_1");

    if (hasUsernameIndex) {
      console.log("Dropping unique username index...");
      await users.dropIndex("username_1");
      console.log("Dropped 'username_1' index.");

      // Optional: Re-create it as a sparse index so it only applies if a username exists
      console.log("Re-creating 'username_1' as a sparse unique index...");
      await users.createIndex({ username: 1 }, { unique: true, sparse: true });
      console.log("Created sparse unique index on 'username'.");
    } else {
      console.log(
        "Index 'username_1' not found. It might have a different name or was already removed.",
      );
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

fixIndexes();
