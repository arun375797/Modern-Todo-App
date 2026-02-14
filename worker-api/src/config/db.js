import { MongoClient } from "mongodb";

let client;
let clientPromise;

export async function getDB(env) {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  if (!client) {
    client = new MongoClient(env.MONGO_URI);
    clientPromise = client.connect();
  }

  await clientPromise;
  return client.db("test");
}
