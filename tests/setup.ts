import { afterEach, vi } from "vitest";

// Keep tests deterministic and avoid accidental reliance on the real environment.
// Use vi.stubEnv for type-safe environment variable stubbing
vi.stubEnv("NODE_ENV", "test");
vi.stubEnv("COMPOSIO_API_KEY", process.env.COMPOSIO_API_KEY ?? "test-composio-key");
vi.stubEnv("AUTH_URL", process.env.AUTH_URL ?? "http://localhost:3000");

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
