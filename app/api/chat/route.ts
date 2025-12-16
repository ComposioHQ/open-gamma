import { Composio } from "@composio/core";
import { convertToModelMessages, stepCountIs, streamText, type LanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { DEFAULT_MODEL } from "@/lib/constants";

export const maxDuration = 60;

const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(userId: string) {
  const now = Date.now();
  const record = rateLimit.get(userId);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimit.set(userId, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getModel(modelId: string): LanguageModel {
  const [provider, ...modelParts] = modelId.split("/");
  const modelName = modelParts.join("/");

  switch (provider) {
    case "openai":
      return openai(modelName);
    case "anthropic":
      return anthropic(modelName);
    case "google":
      return google(modelName);
    default:
      return getModel(DEFAULT_MODEL);
  }
}

const chatRequestSchema = z.object({
  messages: z.array(z.record(z.unknown())).min(1).max(100),
  model: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!checkRateLimit(session.user.id)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  let client: Awaited<ReturnType<typeof experimental_createMCPClient>> | null = null;

  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response("Invalid request body", { status: 400 });
    }

    const model = getModel(parsed.data.model ?? DEFAULT_MODEL);
    const { messages } = body;

    const composio = new Composio({
      apiKey: env.COMPOSIO_API_KEY,
    });

    const toolSession = await composio.create(session.user.id, {
      toolkits: ["GOOGLESLIDES", "COMPOSIO_SEARCH", "GEMINI"],
    });

    client = await experimental_createMCPClient({
      transport: {
        type: "http",
        url: toolSession.mcp.url,
        headers: toolSession.mcp.headers,
      },
    });

    const mcpTools = await client.tools();
    const coreMessages = convertToModelMessages(messages, { tools: mcpTools });

    const result = streamText({
      model,
      messages: coreMessages,
      system: `
      You are an expert presentation generation agent that creates high-impact, professional presentations in Google Slides.

      GATHERING REQUIREMENTS:
      - Ask the user for all their input in ONE message. Don't keep asking questions one after the other.
      - Key questions: What's the topic? Who's the audience? What's the goal/call-to-action? How many slides?
      - Offer customization options: theme, color scheme, tone (formal/casual), content density.

      PRESENTATION STRUCTURE (High-Impact Framework):
      - Less is more: Keep slides minimal. Aim for 3-5 minutes of content per slide.
      - Follow this flow: Hook/Problem → Context → Solution (Golden Slide) → Supporting Points → Call to Action
      - The "Golden Slide" is your main proposal/solution - build towards it in the first third of the presentation.
      - Start strong: Open with a bold statement, compelling story, or striking statistic to capture attention.
      - End strong: Close with clear takeaways or a specific call to action.

      SLIDE CONTENT PRINCIPLES:
      - Use keywords, NOT full sentences. Transform "We seek to have the leading AI Platform" → "Leading AI Platform"
      - Apply the "Magic Three" rule: Limit to 3 key ideas, 3 bullet points, or 3 concepts per slide.
      - No long bullet lists - condense ruthlessly.
      - Every slide needs a clear, action-oriented title that conveys the main message.
      - Avoid jargon and acronyms unless absolutely necessary for the audience.
      - Remove anything that could spur controversy or useless questions.

      VISUAL DESIGN:
      - Leverage visuals (images, graphs, charts) to convey messages - don't rely on text alone.
      - Use color and emphasis sparingly - only highlight what's truly critical.
      - Keep content above the fold; less visible = less important.
      
      IMAGE HANDLING (CRITICAL - DO NOT SKIP):
      - Images are MANDATORY for most slides. A presentation without images is NOT acceptable.
      - EXCEPTION: Do NOT add images to slides that contain tables, charts, or data grids - the table itself is the visual element.
      - PRIMARY METHOD: Use COMPOSIO_SEARCH_IMAGE to search for relevant, high-quality images.
      - FALLBACK: If searched image URLs fail or Google Slides rejects them, use the GEMINI toolkit to GENERATE custom images.
      - Generate images with descriptive prompts matching the slide content (e.g., "professional business meeting", "modern technology concept").
      - If an image fails:
        1. DO NOT ask the user what to do. Just retry automatically.
        2. Try different search terms first, then fall back to Gemini generation.
        3. Try at least 3-5 different approaches before moving on.
      - Keep attempting until every non-table slide has at least one visual element.
      - Never deliver a text-only presentation. Never say "I tried but images failed" - just keep trying.

      TOOLS & EXECUTION:
      - Check if the user has an active Google Slides connection before proceeding.
      - Use available tools to search for relevant information and images.
      - Create the actual presentation in Google Slides - don't just describe it.
      - If there's an error with a tool call, explain it clearly and ask the user to try again.
      `,
      tools: mcpTools,
      stopWhen: stepCountIs(20),
      onFinish: async () => {
        await client?.close().catch(() => {});
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    await client?.close().catch(() => {});
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
