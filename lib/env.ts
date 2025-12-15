import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth (NextAuth)
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(), // Optional in Vercel
  
  // Auth (Composio)
  AUTH_CONFIG_ID: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_ID: z.string().optional(),
  
  // AI / Tools
  COMPOSIO_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 4)
  );
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables");
  }
}

export const env = parsed.success ? parsed.data : process.env as unknown as z.infer<typeof envSchema>;
