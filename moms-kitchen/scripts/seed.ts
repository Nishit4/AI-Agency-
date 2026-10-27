/**
 * Reset the database and insert the sample data.
 * Usage: npm run seed
 */
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

loadEnvConfig(process.cwd());

async function main() {
  // Import after env vars are loaded
  const { getMongoUri } = await import("../lib/db");
  const { seedDatabase, DEMO_ACCOUNTS } = await import("../lib/seed");

  const uri = getMongoUri();
  console.log(`Connecting to ${uri.replace(/\/\/[^@]*@/, "//***@")} …`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

  console.log("Resetting database and inserting sample data …");
  await seedDatabase({ reset: true });

  console.log("\n✅ Done! Demo accounts:");
  console.table({
    Admin: DEMO_ACCOUNTS.admin,
    Customer: DEMO_ACCOUNTS.customer,
    "Home Cook": DEMO_ACCOUNTS.provider,
  });
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("\n❌ Seeding failed:", error.message);
  console.error("Is MongoDB running? Start it with `npm run db` or check MONGODB_URI in .env.local.");
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
