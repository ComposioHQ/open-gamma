import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureUserExists } from "@/lib/db/utils";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("composio_user_id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "No user found" }, { status: 400 });
  }

  try {
    await ensureUserExists(userId);
    return NextResponse.json({ userId });
  } catch (error) {
    console.error("Failed to verify/create user:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
