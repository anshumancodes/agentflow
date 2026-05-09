import { auth } from "@/lib/auth";
import { extractTasksFromText } from "@/services/aiService";
import type { NextRequest } from "next/server";

/**
 * POST /api/ai/extract-tasks
 * Body: { text: string }
 * Returns: { success: true, tasks: ExtractedTask[] }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { text?: string };
  if (!body.text || body.text.trim().length < 10) {
    return Response.json(
      { success: false, error: "Please provide at least 10 characters of text." },
      { status: 400 }
    );
  }

  try {
    const tasks = await extractTasksFromText(body.text);
    return Response.json({ success: true, tasks });
  } catch (err) {
    console.error("[extract-tasks]", err);
    return Response.json(
      { success: false, error: "AI extraction failed. Check your Gemini API key." },
      { status: 500 }
    );
  }
}
