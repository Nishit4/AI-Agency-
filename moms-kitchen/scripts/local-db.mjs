/**
 * Starts a local MongoDB server for development — no installation needed.
 *
 *   npm run db
 *
 * The first run downloads the MongoDB binary (about 100 MB). Data is kept in
 * the .mongo-data folder so it survives restarts. Keep this terminal open
 * while you use the app, and run `npm run dev` in a second terminal.
 *
 * Already have MongoDB installed or using MongoDB Atlas? You don't need this —
 * just set MONGODB_URI in .env.local.
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const PORT = Number(process.env.MONGO_PORT || 27017);
const dbPath = resolve(process.cwd(), ".mongo-data");
mkdirSync(dbPath, { recursive: true });

let MongoMemoryServer;
try {
  ({ MongoMemoryServer } = await import("mongodb-memory-server-core"));
} catch {
  console.error("mongodb-memory-server-core is not installed. Run `npm install` first.");
  process.exit(1);
}

console.log("Starting local MongoDB (the first start downloads MongoDB, please wait) …");

let server;
try {
  server = await MongoMemoryServer.create({
    instance: { port: PORT, ip: "127.0.0.1", dbPath, storageEngine: "wiredTiger" },
  });
} catch (error) {
  console.error("\n❌ Could not start MongoDB:", error.message);
  if (/EADDRINUSE|already in use/i.test(error.message)) {
    console.error(`Port ${PORT} is busy — MongoDB may already be running. If so, just run \`npm run dev\`.`);
  } else {
    console.error("Install MongoDB Community Server or use a free MongoDB Atlas cluster instead (see README.md).");
  }
  process.exit(1);
}

console.log(`\n✅ MongoDB is running at mongodb://127.0.0.1:${PORT}/moms-kitchen`);
console.log(`   Data folder: ${dbPath}`);
console.log("   Now run `npm run dev` in another terminal. Press Ctrl+C here to stop MongoDB.\n");

async function shutdown() {
  console.log("\nStopping MongoDB …");
  await server.stop({ doCleanup: false, force: false });
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
