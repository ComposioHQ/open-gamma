import { Composio } from "@composio/core";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export async function POST() {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get("composio_user_id")?.value;

    if (!userId) {
      userId = `user-${nanoid(10)}`;
      cookieStore.set("composio_user_id", userId);
    }

    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY!,
    });

    const authConfigId = process.env.AUTH_CONFIG_ID;
    if (!authConfigId) {
        return NextResponse.json({ error: "Missing AUTH_CONFIG_ID" }, { status: 500 });
    }

    const connectionRequest = await composio.connectedAccounts.link(userId, authConfigId, {
      callbackUrl: `${process.env.AUTH_URL || "http://localhost:3000"}/auth/callback`,
    });

    return NextResponse.json({ 
      redirectUrl: connectionRequest.redirectUrl,
      connectionId: connectionRequest.id 
    });
  } catch (error) {
    console.error("Composio link error:", error);
    return NextResponse.json({ error: "Failed to initiate login" }, { status: 500 });
  }
}
