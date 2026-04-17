import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js local dev convention), fall back to .env (CI)
config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for migrations (bypasses the connection pooler).
    // For local dev both vars point to the same Docker Postgres.
    // For production set DIRECT_URL to the Supabase direct connection (port 5432)
    // and DATABASE_URL to the Supabase pooler (port 6543).
    url: process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL,
  },
});