import "server-only";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, options);
const clientPromise = global._mongoClientPromise ?? client.connect();

if (!global._mongoClientPromise) {
  global._mongoClientPromise = clientPromise;
}

const databaseName = process.env.MONGODB_DB || "farm_marketplace";

export async function getDatabase() {
  const connectedClient = await clientPromise;
  const db = connectedClient.db(databaseName);

  // ✅ Only log once (optional)
  if (process.env.NODE_ENV === "development") {
    console.log("✅ MongoDB Connected");
  }

  return db;
}