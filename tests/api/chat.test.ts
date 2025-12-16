import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/chat/route";
import { auth } from "@/lib/auth";
import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { Composio } from "@composio/core";
import { streamText, convertToModelMessages } from "ai";

// 1. Mock Auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// 2. Mock Composio
vi.mock("@composio/core", () => ({
  Composio: vi.fn(),
}));

// 3. Mock AI SDK
vi.mock("@ai-sdk/mcp", () => ({
  experimental_createMCPClient: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "openai-model"),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: vi.fn(() => "anthropic-model"),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(() => "google-model"),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    streamText: vi.fn(),
    convertToModelMessages: vi.fn(),
  };
});

describe("Chat API POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Default Mock Implementations
    (Composio as any).mockImplementation(() => ({
      experimental: {
        toolRouter: {
          createSession: vi.fn().mockResolvedValue({ url: "http://mock-tool-url" }),
        },
      },
    }));

    (experimental_createMCPClient as any).mockResolvedValue({
      tools: vi.fn().mockResolvedValue([{ name: "test-tool" }]),
      close: vi.fn().mockResolvedValue(undefined),
    });

    (streamText as any).mockReturnValue({
      toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response("Mock Stream")),
    });

    (convertToModelMessages as any).mockReturnValue([]);
  });

  it("should return 401 Unauthorized if user is not logged in", async () => {
    (auth as any).mockResolvedValue(null);

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("should return 200 and a stream if user is logged in", async () => {
    (auth as any).mockResolvedValue({
      user: { id: "test-user-1" },
    });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
    const res = await POST(req);

    if (res.status !== 200) {
      console.error("Error Status:", res.status);
    }
    expect(res.status).toBe(200);
  });

  it("should return 500 Internal Server Error if upstream service fails", async () => {
    (auth as any).mockResolvedValue({
      user: { id: "test-user-error" },
    });

    // Override mock to simulate a crash in Composio initialization
    (Composio as any).mockImplementationOnce(() => {
      throw new Error("Composio API Down");
    });

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Internal Server Error");
  });

  it("should return 500 if request body is invalid", async () => {
    (auth as any).mockResolvedValue({
      user: { id: "test-user-bad-input" },
    });

    // Malformed JSON body
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: "{ invalid-json: ",
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
  });

  it("should return 429 Too Many Requests if limit exceeded", async () => {
    // Setup: Valid user
    (auth as any).mockResolvedValue({
      user: { id: "spam-user" },
    });

    const reqBody = JSON.stringify({ messages: [] });

    // Action: Call the API 10 times (the limit)
    for (let i = 0; i < 10; i++) {
      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: reqBody,
      });
      const res = await POST(req);
      expect(res.status).toBe(200); // Should succeed
    }

    // Action: Call it the 11th time
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: reqBody,
    });
    const res = await POST(req);

    // Assertion: Should fail now
    expect(res.status).toBe(429);
  });
});
