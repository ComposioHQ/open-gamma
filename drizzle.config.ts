import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required for drizzle-kit.\n" +
    "Run with: DATABASE_URL='postgres://...' npx drizzle-kit <command>\n" +
    "Or export DATABASE_URL in your shell before running."
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
