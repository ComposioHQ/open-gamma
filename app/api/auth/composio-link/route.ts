import { Composio } from "@composio/core";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { env } from "@/lib/env";
import { createAuthState } from "@/lib/auth-state";

const COOKIE_NAME = "composio_auth_state";

export async function POST() {
  try {
    const userId = `user-${nanoid(10)}`;
    const state = createAuthState(userId);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, state, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    const composio = new Composio({
      apiKey: env.COMPOSIO_API_KEY,
    });

    const callbackUrl = env.AUTH_URL
      ? `${env.AUTH_URL}/auth/callback`
      : "http://localhost:3000/auth/callback";

    const connectionRequest = await composio.connectedAccounts.link(userId, env.AUTH_CONFIG_ID, {
      callbackUrl,
    });

    return NextResponse.json({
      redirectUrl: connectionRequest.redirectUrl,
    });
  } catch (error) {
    console.error("Composio link error:", error);
    return NextResponse.json({ error: "Failed to initiate login" }, { status: 500 });
  }
}
