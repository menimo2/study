import { MongoClient, type Db } from "mongodb";

const rawUri = process.env.MONGODB_URI;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  if (!rawUri) {
    return Promise.reject(new Error("MONGODB_URI is not configured"));
  }
  const client = new MongoClient(rawUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    family: 4,
  });
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise().catch((err) => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const client = await getClientPromise();
      return client.db(process.env.MONGODB_DB || "Report-Dorin");
    } catch (err) {
      lastError = err;
      global._mongoClientPromise = undefined;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }
  throw lastError;
}
