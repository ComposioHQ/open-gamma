import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export async function ensureUserExists(userId: string) {
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      email: `${userId}@composio.local`,
      name: "Composio User",
    });
  }
}
