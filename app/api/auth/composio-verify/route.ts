import { Composio } from "@composio/core";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { verifyAuthState } from "@/lib/auth-state";
import { ensureUserExists } from "@/lib/db/utils";

const COOKIE_NAME = "composio_auth_state";

export async function POST() {
  const cookieStore = await cookies();
  const stateToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!stateToken) {
    return NextResponse.json({ error: "No auth state" }, { status: 400 });
  }

  const verified = verifyAuthState(stateToken);
  if (!verified) {
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ error: "Invalid or expired state" }, { status: 400 });
  }

  const { userId } = verified;

  try {
    const composio = new Composio({ apiKey: env.COMPOSIO_API_KEY });
    const connections = await composio.connectedAccounts.list({ userIds: [userId] });
    
    if (!connections.items || connections.items.length === 0) {
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json({ error: "No connected account found" }, { status: 400 });
    }

    cookieStore.delete(COOKIE_NAME);

    await ensureUserExists(userId);
    return NextResponse.json({ userId });
  } catch (error) {
    console.error("Verification failed:", error);
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
