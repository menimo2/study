import { createHash } from "crypto";
import { readFileSync } from "fs";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env.local");
const text = readFileSync(envFile, "utf8");

for (const line of text.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const index = trimmed.indexOf("=");
  if (index < 0) continue;
  const key = trimmed.slice(0, index).trim();
  let value = trimmed.slice(index + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = value;
}

const username = process.env.SEED_USERNAME || "admin";
const password = process.env.SEED_PASSWORD;
if (!password) {
  console.error("SEED_PASSWORD is required");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}

const hash = createHash("sha256").update(password, "utf8").digest("hex");
const client = new MongoClient(process.env.MONGODB_URI, { family: 4 });

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "Report-Dorin");
  const users = db.collection("Users");
  await users.createIndex({ username: 1 }, { unique: true });
  await users.updateOne({ username }, { $set: { username, password: hash } }, { upsert: true });
  console.log(`saved ${username} in ${db.databaseName}.Users`);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message.replace(/mongodb(\+srv)?:\/\/[^@\s]+@/g, "mongodb://***@"));
  process.exit(1);
} finally {
  await client.close();
}
