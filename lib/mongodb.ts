type MongoModule = typeof import("mongodb");
type MongoClientInstance = import("mongodb").MongoClient;

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "farm_marketplace";

declare global {
  var _mongoClientPromise: Promise<MongoClientInstance> | undefined;
}

async function getMongoModule(): Promise<MongoModule> {
  return import("mongodb");
}

async function getClientPromise() {
  if (typeof window !== "undefined") {
    throw new Error("MongoDB can only be used on the server");
  }

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (!global._mongoClientPromise) {
    const { MongoClient, ServerApiVersion } = await getMongoModule();
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

export async function getDatabase() {
  const connectedClient = await getClientPromise();
  const db = connectedClient.db(databaseName);

  if (process.env.NODE_ENV === "development") {
    console.log("MongoDB Connected");
  }

  return db;
}
