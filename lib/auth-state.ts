import { createHmac, timingSafeEqual } from "crypto";
import { env } from "./env";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface AuthState {
  userId: string;
  exp: number;
}

function sign(payload: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(payload).digest("base64url");
}

export function createAuthState(userId: string): string {
  const state: AuthState = {
    userId,
    exp: Date.now() + STATE_TTL_MS,
  };
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAuthState(token: string): { userId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const expectedSig = sign(payload);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const state: AuthState = JSON.parse(Buffer.from(payload, "base64url").toString());
    
    if (Date.now() > state.exp) {
      return null;
    }

    if (typeof state.userId !== "string" || state.userId.length < 1 || state.userId.length > 64) {
      return null;
    }

    return { userId: state.userId };
  } catch {
    return null;
  }
}

