import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Cache the connection across hot reloads in development
const globalForMongoose = globalThis as unknown as { _mongoose?: MongooseCache };
const cache: MongooseCache =
  globalForMongoose._mongoose ?? (globalForMongoose._mongoose = { conn: null, promise: null });

const DEV_FALLBACK_URI = "mongodb://127.0.0.1:27017/moms-kitchen";

export function getMongoUri() {
  const uri =
    process.env.MONGODB_URI ||
    (process.env.NODE_ENV !== "production" ? DEV_FALLBACK_URI : undefined);
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB connection string.",
    );
  }
  return uri;
}

/**
 * Connects to MongoDB once and reuses the connection.
 * On the first connection to an empty database the sample data is inserted
 * automatically (disable with AUTO_SEED=false).
 */
export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(getMongoUri(), { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
      .then(async (instance) => {
        if (process.env.AUTO_SEED !== "false") {
          const { seedIfEmpty } = await import("./seed");
          await seedIfEmpty();
        }
        return instance;
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
